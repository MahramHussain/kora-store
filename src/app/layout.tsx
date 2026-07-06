import type { Metadata } from "next";
import { Inter, Outfit, Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // <-- 1. IMPORT THE FOOTER
import SaleToast from "@/components/SaleToast";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider, Language } from "@/context/LanguageContext";
import { cookies } from "next/headers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://korastore.ae"),
  title: {
    default: "Kora Store — Premium Football Kits, Jerseys & Boots | Football Shop UAE",
    template: "%s | Kora Store"
  },
  description: "Shop premium football jerseys, retro kits, boots & player editions at Kora Store — the UAE's top football shop. Browse the latest club shirts, vintage collections & custom name printing. Fast UAE delivery. KoraStore.",
  keywords: [
    "korastore", "kora store", "korastore.ae", "kora store uae",
    "football shop UAE", "football shops UAE", "football store UAE", "football store Dubai",
    "football kits online", "football jerseys online", "buy football kits UAE",
    "football jerseys UAE", "football shirts UAE", "buy football jerseys Dubai",
    "retro football kits UAE", "vintage football jerseys", "classic football shirts",
    "football boots UAE", "buy football boots Dubai", "soccer cleats UAE",
    "custom football jersey UAE", "personalised football shirt", "custom name jersey",
    "player edition jersey", "player version kit",
    "Premier League jerseys UAE", "La Liga kits UAE", "Champions League jerseys",
    "Real Madrid jersey UAE", "Barcelona kit UAE", "Manchester United jersey Dubai",
    "Liverpool jersey UAE", "Arsenal kit UAE", "PSG jersey Dubai",
    "1:1 football jersey", "premium grade football kit", "best football jerseys UAE"
  ],
  openGraph: {
    title: "Kora Store — Premium Football Kits, Jerseys & Boots | Football Shop UAE",
    description: "Shop premium football jerseys, retro kits, boots & player editions at Kora Store — the UAE's top football shop. Fast UAE delivery. Custom name printing available.",
    url: "https://korastore.ae",
    siteName: "Kora Store",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Kora Store — Premium Football Kits & Jerseys | Football Shop UAE"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kora Store — Premium Football Kits & Jerseys | Football Shop UAE",
    description: "Shop premium football jerseys, retro kits, boots & player editions at Kora Store — the UAE's top football shop. Fast UAE delivery. Custom name printing available.",
    images: ["/opengraph-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "en") as Language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <ClerkProvider>
      <html lang={lang} dir={dir} className={`${tajawal.variable}`}>
        {/* Added flexbox magic here to push the footer to the bottom */}
        <body className={`${inter.variable} ${outfit.variable} ${inter.className} bg-white text-slate-900 antialiased flex flex-col min-h-screen selection:bg-kora selection:text-white`}>
          <LanguageProvider initialLang={lang}>
            <CartProvider>
              <Navbar />
              <SaleToast />

              {/* flex-grow makes the main content take up all available space */}
              <main className="flex-grow">
                {children}
              </main>

              {/* 2. RENDER THE FOOTER AT THE VERY BOTTOM */}
              <Footer />

            </CartProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}