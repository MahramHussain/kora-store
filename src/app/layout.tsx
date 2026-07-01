import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // <-- 1. IMPORT THE FOOTER
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://korastore.ae"),
  title: {
    default: "Kora Store | Elite Football Gear",
    template: "%s | Kora Store"
  },
  description: "Secure your premium 1:1 grade football jerseys. Vintage collections, latest club releases, and player editions with custom print names and numbers.",
  openGraph: {
    title: "Kora Store | Elite Football Gear",
    description: "Secure your premium 1:1 grade football jerseys. Vintage collections, latest club releases, and player editions with custom print names and numbers.",
    url: "https://korastore.ae",
    siteName: "Kora Store",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Kora Store - Elite Football Gear"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kora Store | Elite Football Gear",
    description: "Secure your premium 1:1 grade football jerseys. Vintage collections, latest club releases, and player editions with custom print names and numbers.",
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