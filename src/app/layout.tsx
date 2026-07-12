import type { Metadata } from "next";
import { Inter, Outfit, Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // <-- 1. IMPORT THE FOOTER
import SaleToast from "@/components/SaleToast";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider, Language } from "@/context/LanguageContext";
import { cookies, headers } from "next/headers";

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

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1. Detect language from cookie
  let lang = cookieStore.get("lang")?.value;

  // 2. Fallback to Accept-Language header (crucial for search engine bots)
  if (!lang) {
    const acceptLanguage = headerStore.get("accept-language") || "";
    if (acceptLanguage.startsWith("ar") || acceptLanguage.includes("ar-")) {
      lang = "ar";
    } else {
      lang = "en";
    }
  }

  const isAr = lang === "ar";

  if (isAr) {
    return {
      metadataBase: new URL("https://korastore.ae"),
      title: {
        default: "متجر كورة — أفضل متجر كرة قدم في الإمارات | قمصان وأحذية رياضية دبي",
        template: "%s | متجر كورة الإمارات"
      },
      description: "هل تبحث عن أفضل متجر كرة قدم في الإمارات؟ تسوق قمصان كرة القدم الفاخرة، الأطقم الكلاسيكية، والأحذية في كورة ستور - متجر كرة القدم الأول عبر الإنترنت في دبي، أبوظبي، والشارقة. طباعة أسماء مخصصة وشحن سريع.",
      keywords: [
        "كورة ستور", "متجر كورة", "موقع كورة ستور", "متجر كرة قدم الامارات", "متجر كرة قدم دبي",
        "قمصان كرة قدم الامارات", "تيشيرتات كرة قدم دبي", "احذية كرة قدم دبي", "محل رياضة دبي",
        "ملابس رياضية الامارات", "احذية كرة قدم الامارات", "اطقم اندية كرة قدم", "اطقم منتخبات كرة قدم",
        "طباعة اسم ورقم على القميص", "نسخة اللاعبين الامارات", "شحن سريع الامارات",
        "تيشيرت ريال مدريد الامارات", "تيشيرت برشلونة الامارات", "تيشيرت مانشستر يونايتد دبي",
        "korastore", "kora store", "korastore.ae", "football store uae", "football shop dubai"
      ],
      openGraph: {
        title: "متجر كورة — أفضل متجر كرة قدم في الإمارات | قمصان وأحذية رياضية دبي",
        description: "تسوق قمصان كرة القدم الفاخرة، الأطقم الكلاسيكية، والأحذية في كورة ستور - متجر كرة القدم الأول عبر الإنترنت في دبي، أبوظبي، والشارقة. طباعة أسماء مخصصة وشحن سريع.",
        url: "https://korastore.ae",
        siteName: "Kora Store",
        images: [
          {
            url: "/opengraph-image.jpg",
            width: 1200,
            height: 630,
            type: "image/jpeg",
            alt: "متجر كورة — أفضل متجر كرة قدم في الإمارات"
          }
        ],
        locale: "ar_AE",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "متجر كورة — أفضل متجر كرة قدم في الإمارات",
        description: "تسوق قمصان كرة القدم الفاخرة، الأطقم الكلاسيكية، والأحذية في كورة ستور - متجر كرة القدم الأول عبر الإنترنت في دبي، أبوظبي، والشارقة. طباعة أسماء مخصصة وشحن سريع.",
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
  }

  // Default English Metadata
  return {
    metadataBase: new URL("https://korastore.ae"),
    title: {
      default: "Kora Store — Premium Football Store UAE | Jerseys & Boots Dubai",
      template: "%s | Kora Store UAE"
    },
    description: "Looking for the best football store in the UAE? Shop premium football jerseys, retro kits, boots & player editions at Kora Store - the UAE's top online football shop. Fast delivery in Dubai, Abu Dhabi & Sharjah.",
    keywords: [
      "football store uae", "football shop dubai", "buy football jerseys uae", "football shop uae",
      "football store dubai", "buy football boots dubai", "classic football shirts uae",
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
      title: "Kora Store — Premium Football Store UAE | Jerseys & Boots Dubai",
      description: "Looking for the best football store in the UAE? Shop premium football jerseys, retro kits, boots & player editions at Kora Store - the UAE's top online football shop. Fast delivery in Dubai, Abu Dhabi & Sharjah.",
      url: "https://korastore.ae",
      siteName: "Kora Store",
      images: [
        {
          url: "/opengraph-image.jpg",
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: "Kora Store — Premium Football Store UAE"
        }
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kora Store — Premium Football Store UAE",
      description: "Looking for the best football store in the UAE? Shop premium football jerseys, retro kits, boots & player editions at Kora Store - the UAE's top online football shop. Fast delivery in Dubai, Abu Dhabi & Sharjah.",
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1. Detect language from cookie
  let lang = cookieStore.get("lang")?.value;

  // 2. Fallback to Accept-Language header
  if (!lang) {
    const acceptLanguage = headerStore.get("accept-language") || "";
    if (acceptLanguage.startsWith("ar") || acceptLanguage.includes("ar-")) {
      lang = "ar";
    } else {
      lang = "en";
    }
  }

  const dir = lang === "ar" ? "rtl" : "ltr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "additionalType": "https://schema.org/OnlineStore",
    "name": "Kora Store",
    "description": lang === "ar"
      ? "هل تبحث عن أفضل متجر كرة قدم في الإمارات؟ تسوق قمصان كرة القدم الفاخرة، الأطقم الكلاسيكية، والأحذية في كورة ستور - متجر كرة القدم الأول عبر الإنترنت في دبي، أبوظبي، والشارقة."
      : "Looking for the best football store in the UAE? Shop premium football jerseys, retro kits, boots & player editions at Kora Store - the UAE's top online football shop.",
    "url": "https://korastore.ae",
    "logo": "https://korastore.ae/assets/logo.png",
    "image": "https://korastore.ae/opengraph-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dubai",
      "addressCountry": "AE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.2048",
      "longitude": "55.2708"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.instagram.com/korastore.ae/"
    ],
    "priceRange": "$$"
  };

  return (
    <ClerkProvider>
      <html lang={lang} dir={dir} className={`${tajawal.variable}`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        {/* Added flexbox magic here to push the footer to the bottom */}
        <body className={`${inter.variable} ${outfit.variable} ${inter.className} bg-white text-slate-900 antialiased flex flex-col min-h-screen selection:bg-kora selection:text-white`}>
          <LanguageProvider initialLang={(lang === "ar" ? "ar" : "en") as Language}>
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