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
    const orderItemsData = data.items.map((item, idx) => {
      let unitPrice = item.unitPriceCents;
      // Eğer menuItemId varsa, DB'den fiyat al
      if (item.menuItemId && menuMap.has(item.menuItemId)) {
        const dbItem = menuMap.get(item.menuItemId)!;
        unitPrice = dbItem.priceCents;
      }
      const itemTotal = unitPrice * item.quantity;
      subtotalCents += itemTotal;

      return {
        menuItemId: item.menuItemId || null,
        name: item.name.slice(0, 120),
        quantity: item.quantity,
        unitPriceCents: unitPrice,
        extras: JSON.stringify(item.extras || []),
        notes: (item.notes || "").slice(0, 200),
      };
    });

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
        deliveryAddress: data.deliveryAddress || null,
        notes: data.notes || null,
        ipAddress: ip === "unknown" ? null : ip,
        userAgent: getUserAgent(req),
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

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
    console.error("order create error:", e);
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }
}
