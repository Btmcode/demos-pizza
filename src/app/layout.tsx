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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://demospizza.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Demos Pizza · Taş Fırın İtalyan Pizzası · Fatih, İstanbul",
    template: "%s · Demos Pizza",
  },
  description:
    "Fatih Haseki'de taş fırında pişen gerçek İtalyan pizzası. 72 saat mayalı hamur, San Marzano domates, taze mozzarella. Online sipariş, rezervasyon ve paket servis.",
  keywords: [
    "Demos Pizza",
    "Fatih pizza",
    "Haseki pizza",
    "taş fırın pizza",
    "İstanbul pizza sipariş",
    "İtalyan pizza",
    "pizza delivery Fatih",
    "online pizza İstanbul",
  ],
  authors: [{ name: "Demos Pizza" }],
  creator: "Demos Pizza",
  publisher: "Demos Pizza",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Demos Pizza · Taş Fırın İtalyan Pizzası",
    description:
      "Fatih Haseki'de taş fırında pişen gerçek İtalyan pizzası. 72 saat mayalı hamur, taze malzemeler.",
    url: SITE_URL,
    siteName: "Demos Pizza",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/images/hero-pizza.png", width: 1440, height: 720, alt: "Demos Pizza" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demos Pizza · Taş Fırın İtalyan Pizzası",
    description: "Fatih Haseki'de taş fırında pişen gerçek İtalyan pizzası.",
    images: ["/images/hero-pizza.png"],
  },
  category: "food",
  other: {
    "og:locale": "tr_TR",
    "format-detection": "telephone=no",
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
