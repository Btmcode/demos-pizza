import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://demospizza.com.tr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Demos Pizza · Fatih'in Premium Pizza Platformu · Online Sipariş",
    template: "%s · Demos Pizza",
  },
  description:
    "Fatih Haseki'de günlük taze hamur, endüstriyel fırında pişen premium İtalyan pizza. AI destekli sipariş deneyimi, 30-45 dk kurye teslimat. Haseki, Aksaray, Fındıkzade, Çapa ve Fatih çevresine hizmet.",
  keywords: [
    "Demos Pizza", "Fatih pizza", "Haseki pizza", "Aksaray pizza",
    "Fındıkzade pizza", "Çapa pizza", "İstanbul pizza sipariş",
    "online pizza İstanbul", "pizza delivery Fatih",
    "günlük taze hamur pizza", "endüstriyel fırın pizza",
    "İtalyan pizza İstanbul", "1 alana 1 bedava pizza",
    "AI pizza önerisi", "akıllı sipariş",
  ],
  authors: [{ name: "Demos Pizza" }],
  creator: "Demos Pizza",
  publisher: "Demos Pizza",
  applicationName: "Demos Pizza",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Demos Pizza · Fatih'in Premium Pizza Platformu",
    description: "AI destekli sipariş deneyimi, günlük taze hamur, 30-45 dk teslimat.",
    url: SITE_URL,
    siteName: "Demos Pizza",
    locale: "tr_TR",
    type: "website",
    images: [{
      url: "/images/hero-pizza-main.png",
      width: 1024,
      height: 1024,
      alt: "Demos Pizza — Fatih Haseki",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demos Pizza · Premium Pizza Platformu",
    description: "Fatih Haseki'de günlük taze hamur, AI destekli sipariş.",
    images: ["/images/hero-pizza-main.png"],
  },
  category: "food",
  other: {
    "geo.region": "TR-34",
    "geo.placename": "Fatih, İstanbul",
    "geo.position": "41.0096;28.9471",
    "ICBM": "41.0096, 28.9471",
    "theme-color": "#111111",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Demos Pizza",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

// ============================================================
// JSON-LD STRUCTURED DATA — Multi-schema for AISO + GEO
// ============================================================
const jsonLd = {
  restaurant: {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    "name": "Demos Pizza",
    "alternateName": "Demos Pizza Haseki",
    "image": `${SITE_URL}/images/hero-pizza-main.png`,
    "logo": `${SITE_URL}/logo.png`,
    "url": SITE_URL,
    "telephone": "+90444000000",
    "servesCuisine": ["Pizza", "Italian", "Fast Food"],
    "priceRange": "₺₺",
    "paymentAccepted": "Cash, Credit Card",
    "currenciesAccepted": "TRY",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Haseki Sultan, Turgut Özal Millet Cd.",
      "addressLocality": "Fatih",
      "addressRegion": "İstanbul",
      "postalCode": "34093",
      "addressCountry": "TR",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.0096,
      "longitude": 28.9471,
    },
    "hasMenu": { "@type": "Menu", "url": `${SITE_URL}/#menu` },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
        "opens": "10:00",
        "closes": "00:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Friday", "Saturday"],
        "opens": "10:00",
        "closes": "01:00",
      },
    ],
    "areaServed": [
      "Haseki", "Aksaray", "Fındıkzade", "Çapa", "Şehremini",
      "Molla Gürani", "İskenderpaşa", "Samatya", "Yenikapı", "Laleli",
      "Beyazıt", "Topkapı", "Kocamustafapaşa", "Vatan Caddesi", "Adnan Menderes Bulvarı",
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "350",
      "bestRating": "5",
      "worstRating": "1",
    },
    "acceptsReservations": "False",
    "hasDelivery": {
      "@type": "DeliveryService",
      "deliveryTime": "PT30M",
      "priceRange": "₺₺",
    },
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Demos Pizza",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/#menu?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },

  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Anasayfa", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Menü", "item": `${SITE_URL}/#menu` },
    ],
  },

  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Demos Pizza teslimat süresi ne kadar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sipariş onayından sonra ortalama 30-45 dakika içinde kurye ile teslim edilir. Yoğun saatlerde bu süre uzayabilir.",
        },
      },
      {
        "@type": "Question",
        "name": "Hangi bölgelere teslimat yapıyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Haseki, Aksaray, Fındıkzade, Çapa, Şehremini, Molla Gürani, İskenderpaşa, Samatya, Yenikapı, Laleli, Beyazıt, Topkapı, Kocamustafapaşa, Vatan Caddesi ve Adnan Menderes Bulvarı bölgelerine teslimat yapıyoruz.",
        },
      },
      {
        "@type": "Question",
        "name": "Minimum sipariş tutarı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Minimum sipariş tutarı 200 TL'dir. 400 TL ve üzeri siparişlerde teslimat ücretsizdir.",
        },
      },
      {
        "@type": "Question",
        "name": "1 alana 1 bedava kampanyası nasıl çalışır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tüm büyük boy pizzalarda 1 alana 1 bedava kampanyamız aktiftir. Sipariş verirken kampanya otomatik uygulanır.",
        },
      },
      {
        "@type": "Question",
        "name": "Hamurunuz taze mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, her sabah taze hazırlanan el yapımı hamur kullanıyoruz. Dondurulmuş hamur kullanmıyoruz. Endüstriyel fırınımızda mükemmel kıvamında pişiriyoruz.",
        },
      },
      {
        "@type": "Question",
        "name": "Online ödeme kabul ediyor musunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Şu anda kapıda nakit ve kapıda kart ödemesi kabul ediyoruz. Online ödeme seçeneği yakında sunulacaktır.",
        },
      },
    ],
  },

  offer: {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": "1 ALANA 1 BEDAVA — Büyük Boy Pizza",
    "description": "Tüm büyük boy pizzalarda 1 alana 1 bedava fırsatı. Paket serviste geçerlidir.",
    "url": SITE_URL,
    "availability": "https://schema.org/InStock",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "TRY",
      "price": 0,
    },
    "validFrom": "2026-01-01",
    "validThrough": "2026-12-31",
    "seller": { "@type": "Restaurant", "name": "Demos Pizza" },
  },

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Demos Pizza",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90444000000",
      "contactType": "customer service",
      "areaServed": "TR",
      "availableLanguage": ["Turkish", "English"],
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Haseki Sultan, Turgut Özal Millet Cd.",
      "addressLocality": "Fatih",
      "addressRegion": "İstanbul",
      "postalCode": "34093",
      "addressCountry": "TR",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Multi-schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.restaurant) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.website) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faq) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.offer) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.organization) }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
