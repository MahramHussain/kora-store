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
  title: "Kora Store",
  description: "Elite Football Gear",
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