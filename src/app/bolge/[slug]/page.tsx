import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Clock, Truck, Phone, Star, ArrowRight } from "lucide-react";
import { BRAND, CONTACT } from "@/lib/constants";
import type { Metadata } from "next";

/** Generate static params for all service areas */
export function generateStaticParams() {
  return CONTACT.delivery.serviceAreas.map((area) => {
    const slug = area.toLowerCase()
      .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
      .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    return { slug };
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = decodeDistrict(slug);
  if (!area) return {};

  const title = `Pizza Sipariş ${area} · Demos Pizza · ${CONTACT.delivery.deliveryTime} Teslimat`;
  const description = `${area} bölgesine pizza siparişi ver! Demos Pizza'dan günlük taze hamur, endüstriyel fırın pizza. ${CONTACT.delivery.deliveryTime} kurye teslimatı. Min. ${CONTACT.delivery.minOrder} ₺. 1 alana 1 bedava!`;

  return {
    title,
    description,
    alternates: { canonical: `/bolge/${slug}` },
    openGraph: {
      title,
      description,
      url: `${BRAND.siteUrl}/bolge/${slug}`,
      type: "website",
      locale: "tr_TR",
    },
    keywords: [
      `pizza ${area}`, `${area} pizza sipariş`, `${area} pizza delivery`,
      `pizza ${area} İstanbul`, `Demos Pizza ${area}`,
      `${area} paket servis`, `${area} kurye pizza`,
    ],
  };
}

function decodeDistrict(slug: string): string | null {
  // Reverse slug to area name
  for (const area of CONTACT.delivery.serviceAreas) {
    const areaSlug = area.toLowerCase()
      .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
      .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    if (areaSlug === slug) return area;
  }
  return null;
}

export default async function DistrictPage({ params }: PageProps) {
  const { slug } = await params;
  const area = decodeDistrict(slug);
  if (!area) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Pizza Teslimat ${area}`,
    "provider": {
      "@type": "Restaurant",
      "name": "Demos Pizza",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Haseki Sultan, Turgut Özal Millet Cd.",
        "addressLocality": "Fatih",
        "addressRegion": "İstanbul",
        "postalCode": "34093",
        "addressCountry": "TR",
      },
    },
    "areaServed": {
      "@type": "Place",
      "name": area,
    },
    "serviceType": "Pizza Delivery",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "TRY",
      "price": CONTACT.delivery.minOrder,
      "description": `Min. sipariş ${CONTACT.delivery.minOrder} ₺ · ${CONTACT.delivery.deliveryTime} teslimat`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-ink text-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-yellow text-sm mb-5 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Ana sayfaya dön
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-yellow" />
            <span className="text-yellow text-xs font-mono uppercase tracking-widest">Servis Bölgesi</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Pizza Sipariş
            <br />
            <span className="text-gradient-gold">{area}</span>
          </h1>
          <p className="mt-4 text-white/80 text-base md:text-lg max-w-xl">
            {area} bölgesine günlük taze hamur, endüstriyel fırında pişen premium İtalyan pizza.
            Kurye ile {CONTACT.delivery.deliveryTime} kapınızda.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/#menu">
              <button className="bg-pink hover:bg-pink-hover text-white px-6 h-12 rounded-xl font-semibold shadow-pink-glow btn-premium inline-flex items-center gap-2">
                Hemen Sipariş Ver
                <ArrowRight className="h-4 w-4" />
              </button>
            </a>
            <a href={CONTACT.phoneHref}>
              <button className="glass-dark border-white/20 text-white px-6 h-12 rounded-xl font-semibold inline-flex items-center gap-2 btn-premium">
                <Phone className="h-4 w-4" />
                <span className="font-mono">{CONTACT.phone}</span>
              </button>
            </a>
          </div>
        </div>
      </header>

      {/* Info grid */}
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-paper border border-ink/8 rounded-2xl p-5 shadow-premium">
              <div className="w-10 h-10 rounded-lg bg-pink/10 text-pink flex items-center justify-center mb-3">
                <Truck className="h-5 w-5" />
              </div>
              <div className="font-display font-bold text-ink">Hızlı Teslimat</div>
              <div className="text-sm text-ink/60 mt-1">{CONTACT.delivery.deliveryTime}</div>
              <div className="text-xs text-ink/40 mt-1">Kurye ile {area}'ya</div>
            </div>

            <div className="bg-paper border border-ink/8 rounded-2xl p-5 shadow-premium">
              <div className="w-10 h-10 rounded-lg bg-yellow/10 text-yellow flex items-center justify-center mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <div className="font-display font-bold text-ink">Açık</div>
              <div className="text-sm text-ink/60 mt-1">10:30 - 02:00</div>
              <div className="text-xs text-ink/40 mt-1">Her gün açık</div>
            </div>

            <div className="bg-paper border border-ink/8 rounded-2xl p-5 shadow-premium">
              <div className="w-10 h-10 rounded-lg bg-pink/10 text-pink flex items-center justify-center mb-3">
                <Star className="h-5 w-5" />
              </div>
              <div className="font-display font-bold text-ink">Min. Sipariş</div>
              <div className="text-sm text-ink/60 mt-1">{CONTACT.delivery.minOrder} ₺</div>
              <div className="text-xs text-ink/40 mt-1">{CONTACT.delivery.freeDeliveryThreshold} ₺ üzeri ücretsiz</div>
            </div>
          </div>

          {/* SEO content */}
          <div className="mt-10 prose prose-stone max-w-none">
            <h2 className="font-display text-2xl font-bold text-ink mb-4">
              {area} Pizza Siparişi — Demos Pizza
            </h2>
            <p className="text-ink/70 leading-relaxed">
              Demos Pizza, {area} bölgesine günlük taze hamur ve endüstriyel fırında pişen
              premium İtalyan pizza teslimatı yapıyor. Her sabah taze hazırlanan hamurumuz,
              dondurulmuş değil, gerçek el yapımı. Sipariş verir vermez, pizzasınız hemen
              hazırlanmaya başlar ve {CONTACT.delivery.deliveryTime} içinde kurye ile kapınıza gelir.
            </p>
            <p className="text-ink/70 leading-relaxed mt-4">
              {area} ve çevresine sunduğumuz servislerle, bölgenin en hızlı pizza teslimat
              hizmetini sağlıyoruz. Minimum sipariş tutarı {CONTACT.delivery.minOrder} ₺ olup,
              {CONTACT.delivery.freeDeliveryThreshold} ₺ ve üzeri siparişlerde teslimat ücretsizdir.
              "1 alana 1 bedava" kampanyamızla tüm büyük boy pizzalarda ikinci pizza bizden!
            </p>

            <h3 className="font-display text-xl font-bold text-ink mt-8 mb-3">
              Neden Demos Pizza?
            </h3>
            <ul className="space-y-2 text-ink/70">
              <li className="flex items-start gap-2">
                <span className="text-pink mt-1">●</span>
                <span>Günlük taze hazırlanan el yapımı hamur (dondurulmuş değil)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink mt-1">●</span>
                <span>Endüstriyel fırında mükemmel kıvamında pişirme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink mt-1">●</span>
                <span>{CONTACT.delivery.deliveryTime} hızlı kurye teslimatı</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink mt-1">●</span>
                <span>Helal sertifikalı taze malzemeler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink mt-1">●</span>
                <span>1 alana 1 bedava kampanyası (büyük boy)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink mt-1">●</span>
                <span>Kişiselleştirilmiş pizza önerileri</span>
              </li>
            </ul>
          </div>

          {/* Other districts */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-ink mb-4">Diğer Servis Bölgeleri</h2>
            <div className="flex flex-wrap gap-2">
              {CONTACT.delivery.serviceAreas
                .filter((a) => a !== area)
                .map((other) => {
                  const otherSlug = other.toLowerCase()
                    .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
                    .replace(/Ü/g, "u").replace(/Ö/g, "o").replace(/Ç/g, "c")
                    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                  return (
                    <Link
                      key={other}
                      href={`/bolge/${otherSlug}`}
                      className="px-3 py-1.5 rounded-full bg-mist/30 border border-ink/8 text-xs text-ink/70 hover:bg-pink hover:text-white hover:border-pink transition-colors"
                    >
                      {other}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
