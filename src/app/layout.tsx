import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://demos.pizza.com.tr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Demos Pizza · Günlük Taze Hamur · Fatih, İstanbul · Online Sipariş",
    template: "%s · Demos Pizza",
  },
  description:
    "Fatih Haseki'de günlük taze hamurla endüstriyel fırında pişen İtalyan tarzı pizza. Kurye ile 30-45 dk teslimat. Haseki, Aksaray, Fındıkzade, Çapa ve Fatih çevresine hizmet. Online sipariş ver, kapına gelsin!",
  keywords: [
    "Demos Pizza",
    "Fatih pizza",
    "Haseki pizza sipariş",
    "Aksaray pizza",
    "Fındıkzade pizza",
    "Çapa pizza",
    "İstanbul pizza sipariş",
    "online pizza sipariş İstanbul",
    "pizza delivery Fatih",
    "kurye pizza İstanbul",
    "günlük taze hamur pizza",
    "endüstriyel fırın pizza",
    "İtalyan pizza İstanbul",
    "Demos Pizza Haseki",
    "paket servis pizza Fatih",
    "1 alana 1 bedava pizza",
  ],
  authors: [{ name: "Demos Pizza" }],
  creator: "Demos Pizza",
  publisher: "Demos Pizza",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Demos Pizza · Günlük Taze Hamur · Fatih, İstanbul",
    description:
      "Fatih Haseki'de günlük taze hamurla pişen İtalyan tarzı pizza. Kurye ile 30-45 dk teslimat. Online sipariş ver!",
    url: SITE_URL,
    siteName: "Demos Pizza",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/images/demos-storefront.png", width: 1024, height: 1024, alt: "Demos Pizza — Fatih Haseki" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demos Pizza · Günlük Taze Hamur · Fatih, İstanbul",
    description: "Fatih Haseki'de günlük taze hamurla pişen İtalyan tarzı pizza. Kurye ile 30-45 dk teslimat.",
    images: ["/images/demos-storefront.png"],
  },
  category: "food",
  other: {
    "og:locale": "tr_TR",
    "format-detection": "telephone=no",
    "geo.region": "TR-34",
    "geo.placename": "Fatih, İstanbul",
    "geo.position": "41.0096;28.9471",
    "ICBM": "41.0096, 28.9471",
  },
};

export const viewport = {
  themeColor: "#1A1410",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* LocalBusiness Schema.org JSON-LD — Local SEO için kritik */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "@id": "https://demos.pizza.com.tr/#restaurant",
              "name": "Demos Pizza",
              "image": "https://demos.pizza.com.tr/images/demos-storefront.png",
              "url": "https://demos.pizza.com.tr",
              "telephone": "+90444000000",
              "servesCuisine": ["Pizza", "Italian", "Fast Food"],
              "priceRange": "₺₺",
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
              "hasMenu": {
                "@type": "Menu",
                "url": "https://demos.pizza.com.tr/#menu",
              },
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
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "350",
              },
              "acceptsReservations": "False",
            }),
          }}
        />
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Demos Pizza",
              "url": "https://demos.pizza.com.tr",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://demos.pizza.com.tr/#menu?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${mono.variable} antialiased bg-background text-foreground`}
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
