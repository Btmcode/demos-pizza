import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderSchema } from "@/lib/validators";
import { orderLimiter, checkRateLimit, getClientIp, getUserAgent, containsSqlInjection, containsXss, normalizePhone } from "@/lib/security";
import { CURRENCY, CONTACT } from "@/lib/constants";

/**
 * POST /api/orders
 * Public: yeni sipariş oluştur.
 * - Zod validation
 * - Rate limited (10/saat IP bazlı)
 * - SQL injection / XSS pattern kontrol
 * - Toplam tutar server-side hesaplanır (client güvenilmez)
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(orderLimiter, `order:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ error: rl.message }, { status: rl.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Ekstra güvenlik: input içeriği kontrol
  const allText = [
    data.customerName,
    data.customerEmail || "",
    data.deliveryAddress || "",
    data.notes || "",
    ...data.items.map((i) => i.name + (i.notes || "")),
  ].join(" ");
  if (containsSqlInjection(allText) || containsXss(allText)) {
    return NextResponse.json({ error: "Geçersiz içerik" }, { status: 400 });
  }

  // Teslimat adresi kontrol
  if (data.orderType === "DELIVERY" && !data.deliveryAddress?.trim()) {
    return NextResponse.json({ error: "Teslimat adresi gerekli" }, { status: 422 });
  }

  // Server-side fiyat hesabı — DB'den fiyatları al, client'a güvenme
  try {
    const menuItemIds = data.items.map((i) => i.menuItemId).filter(Boolean) as string[];
    const menuItems = menuItemIds.length
      ? await db.menuItem.findMany({ where: { id: { in: menuItemIds } } })
      : [];
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    let subtotalCents = 0;
    const orderItemsData = data.items.map((item) => {
      // GÜVENLİK: Fiyat ASLA client'ten alınmaz — her zaman DB'den
      let unitPrice = 0;
      let itemName = item.name.slice(0, 120);
      let menuItemId: string | null = null;

      if (item.menuItemId && menuMap.has(item.menuItemId)) {
        const dbItem = menuMap.get(item.menuItemId)!;
        unitPrice = dbItem.priceCents;
        itemName = dbItem.name; // DB'den isim de al (client ismine güvenme)
        menuItemId = item.menuItemId;
      } else {
        // menuItemId yoksa — bu bir custom item olabilir, ama fiyat 0 olmalı
        // (güvenlik: client 0 TL dışında fiyat gönderemez)
        unitPrice = 0;
      }

      // Ekstra malzeme fiyatlarını DB'den doğrula (ileride)
      // Şimdilik extras fiyatlarını toplama dahil et ama güvenli şekilde
      const extrasTotal = (item.extras || []).reduce((sum: number, e: { priceCents?: number }) => {
        return sum + (typeof e.priceCents === "number" && e.priceCents > 0 && e.priceCents < 100000 ? e.priceCents : 0);
      }, 0);

      const itemTotal = (unitPrice + extrasTotal) * item.quantity;
      subtotalCents += itemTotal;

      return {
        menuItemId,
        name: itemName,
        quantity: item.quantity,
        unitPriceCents: unitPrice + extrasTotal,
        extras: JSON.stringify(item.extras || []),
        notes: (item.notes || "").slice(0, 200),
      };
    });

    // GÜVENLİK: Toplam tutar negatif olamaz
    if (subtotalCents < 0 || subtotalCents > 10_000_000) {
      return NextResponse.json({ error: "Geçersiz sipariş tutarı" }, { status: 422 });
    }

    // Min sipariş kontrolü
    if (data.orderType === "DELIVERY" && subtotalCents < CONTACT.delivery.minOrder * 100) {
      return NextResponse.json(
        { error: `Minimum sipariş ${CURRENCY.formatShort(CONTACT.delivery.minOrder * 100)}` },
        { status: 422 }
      );
    }

    // Teslimat ücreti hesabı
    let deliveryCents = 0;
    if (data.orderType === "DELIVERY") {
      if (subtotalCents >= CONTACT.delivery.freeDeliveryThreshold * 100) {
        deliveryCents = 0;
      } else {
        deliveryCents = CONTACT.delivery.deliveryFee * 100;
      }
    }

    const totalCents = subtotalCents + deliveryCents;

    // Order number: DP-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const orderNumber = `DP-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerPhone: normalizePhone(data.customerPhone),
        customerEmail: data.customerEmail || null,
        orderType: data.orderType,
        paymentMethod: data.paymentMethod,
        subtotalCents,
        deliveryCents,
        totalCents,
        deliveryDistrict: data.deliveryDistrict || null,
        deliveryAddress: data.deliveryAddress || null,
        notes: data.notes || null,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // WhatsApp bildirim gönder (env var varsa)
    if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        await sendWhatsAppNotification(order, orderItemsData);
        await db.order.update({
          where: { id: order.id },
          data: { whatsappSent: true, whatsappSentAt: new Date() },
        });
      } catch (e) {
        console.error("WhatsApp send error");
      }
    }

    return NextResponse.json(
      {
        ok: true,
        orderNumber: order.orderNumber,
        totalCents,
        totalDisplay: CURRENCY.formatShort(totalCents),
        estimatedTime:
          data.orderType === "PICKUP"
            ? CONTACT.delivery.pickupTime
            : CONTACT.delivery.deliveryTime,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("order create error");
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }
}

/**
 * WhatsApp Business Cloud API ile sipariş bildirimi gönderir.
 *
 * Kurulum (env vars):
 * - WHATSAPP_API_TOKEN: Meta Business API token
 * - WHATSAPP_PHONE_NUMBER_ID: WhatsApp Business phone number ID
 * - WHATSAPP_RECIPIENT_PHONE: Bildirim gönderilecek numara (admin telefonu, format: 905551234567)
 *
 * Henüz API yoksa sessizce atlar. Admin panelde sipariş görünecektir.
 */
async function sendWhatsAppNotification(order: any, items: any[]) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_PHONE || CONTACT.whatsapp.replace(/\D/g, "");

  if (!token || !phoneId || !recipient) return;

  // Sipariş özeti
  const itemsList = items.map((it) => `• ${it.quantity}× ${it.name}`).join("\n");
  const orderTypeLabel = order.orderType === "DELIVERY" ? "Teslimat" : "Gel-Al";
  const paymentLabel = order.paymentMethod === "CASH_ON_DELIVERY" ? "Kapıda Nakit" : "Kapıda Kart";

  const message = `🍕 *YENİ SİPARİŞ - ${order.orderNumber}*

👤 *Müşteri:* ${order.customerName}
📞 *Telefon:* ${order.customerPhone}
📦 *Tip:* ${orderTypeLabel}
💳 *Ödeme:* ${paymentLabel}
${order.deliveryDistrict ? `📍 *Bölge:* ${order.deliveryDistrict}` : ""}
${order.deliveryAddress ? `🏠 *Adres:* ${order.deliveryAddress}` : ""}

🛒 *Ürünler:*
${itemsList}

💰 *Toplam:* ${CURRENCY.formatShort(order.totalCents)}
🕐 *Zaman:* ${new Date().toLocaleString("tr-TR")}
${order.notes ? `\n📝 *Not:* ${order.notes}` : ""}

_Sipariş hazırlanmak üzere admin panelinde._`;

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: { body: message },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("WhatsApp API error:", errText);
    throw new Error(`WhatsApp API: ${res.status}`);
  }
}

