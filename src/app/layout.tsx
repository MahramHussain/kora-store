import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/CartContext"; 

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.korastore.com"),
  title: {
    default: "Kora Store | Premium Football Jerseys & Boots UAE",
    template: "%s | Kora Store UAE"
  },
  description: "The UAE's #1 exclusive vault for premium football kits, soccer jerseys, elite pitch boots, and football accessories. Sourced direct, shipped fast to Dubai, Abu Dhabi, and across the Emirates.",
  keywords: [
    "football jerseys UAE",
    "soccer shirts Dubai",
    "football kits Abu Dhabi",
    "football merchandise UAE",
    "original football shirts Dubai",
    "retro football jerseys Dubai",
    "football store UAE",
    "football boots Dubai",
    "buy football gear UAE",
    "World Cup jerseys Dubai",
    "Al Ain jerseys",
    "Real Madrid jersey Dubai",
    "Manchester United kit UAE"
  ],
  authors: [{ name: "Kora Store Team" }],
  creator: "Kora Store",
  publisher: "Kora Store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://www.korastore.com",
    title: "Kora Store | Premium Football Jerseys & Boots UAE",
    description: "The UAE's #1 exclusive vault for premium football kits, soccer jerseys, elite pitch boots, and football accessories. Sourced direct, shipped fast.",
    siteName: "Kora Store UAE",
    images: [
      {
        url: "/assets/argentina_away_spotlight.png",
        width: 1200,
        height: 630,
        alt: "Kora Store Premium Football Merchandise UAE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kora Store | Premium Football Jerseys & Boots UAE",
    description: "The UAE's #1 exclusive vault for premium football kits, soccer jerseys, elite pitch boots, and football accessories.",
    images: ["/assets/argentina_away_spotlight.png"],
  },
  alternates: {
    canonical: "https://www.korastore.com",
  },
  other: {
    "geo.region": "AE-DU",
    "geo.placename": "Dubai, United Arab Emirates",
    "geo.position": "25.2048;55.2708",
    "ICBM": "25.2048, 55.2708",
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* Added flexbox magic here to push the footer to the bottom */}
        <body className={`${inter.variable} ${outfit.variable} ${inter.className} bg-white text-slate-900 antialiased flex flex-col min-h-screen selection:bg-kora selection:text-white`}>
          <CartProvider>
            <Navbar />
            
            {/* flex-grow makes the main content take up all available space */}
            <main className="flex-grow">
              {children}
            </main>

            {/* 2. RENDER THE FOOTER AT THE VERY BOTTOM */}
            <Footer />
            
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}