import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard, ProductSkeletonCard } from "@/components/ProductCard";
import { ScrollSlider } from "@/components/ScrollSlider";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

async function ClubJerseySlider() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { subCategory: "Club" },
        { category: { in: ["Shirts", "Retro Kits"] }, isWorldCup: false }
      ]
    },
    take: 24,
    orderBy: { createdAt: "desc" },
  });

  // Sort: On Sale tag first, then by createdAt desc
  products.sort((a, b) => {
    const isSaleA = a.tag === "On Sale";
    const isSaleB = b.tag === "On Sale";
    if (isSaleA !== isSaleB) return isSaleA ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const displayProducts = products.slice(0, 6);

  return (
    <>
      {displayProducts.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[220px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString(), originalPrice: product.originalPrice ? product.originalPrice.toString() : null}} />
        </div>
      ))}
    </>
  );
}

async function WorldCupJerseySlider() {
  const products = await prisma.product.findMany({
    where: { isWorldCup: true },
    // Fetch only the top 24 latest products to avoid loading the entire catalog in memory
    take: 24,
    orderBy: { createdAt: "desc" },
  });

  // Sort: On Sale tag first, then by createdAt desc
  products.sort((a, b) => {
    const isSaleA = a.tag === "On Sale";
    const isSaleB = b.tag === "On Sale";
    if (isSaleA !== isSaleB) return isSaleA ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const displayProducts = products.slice(0, 6);

  return (
    <>
      {displayProducts.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[220px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString(), originalPrice: product.originalPrice ? product.originalPrice.toString() : null}} />
        </div>
      ))}
    </>
  );
}

async function ShoesSlider() {
  const products = await prisma.product.findMany({
    where: { category: { in: ["Boots", "Casual Shoes"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[220px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString(), originalPrice: product.originalPrice ? product.originalPrice.toString() : null}} />
        </div>
      ))}
    </>
  );
}

async function StreetwearAndGearSlider() {
  const products = await prisma.product.findMany({
    where: { category: { in: ["Accessories", "Flags", "Gear"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[220px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString(), originalPrice: product.originalPrice ? product.originalPrice.toString() : null}} />
        </div>
      ))}
    </>
  );
}

export default async function Home() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = (key: string) => {
    const entry = (translations as any)[key];
    if (!entry) return key;
    return entry[lang] || entry["en"] || key;
  };

  const formatTitle = (title: string) => {
    const lastSpaceIdx = title.lastIndexOf(" ");
    if (lastSpaceIdx === -1) return title;
    return (
      <>
        {title.slice(0, lastSpaceIdx)}
        <br className="md:hidden" />
        {title.slice(lastSpaceIdx)}
      </>
    );
  };





  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-kora selection:text-white pb-12 md:pb-20 transition-colors duration-300">
      {/* 4. PROMO BANNER — Scannable on mobile */}
      <div className="bg-neutral-100 dark:bg-slate-900 border-b border-neutral-200 dark:border-slate-800 py-3 md:py-2.5 text-center text-xs md:text-sm font-bold text-neutral-800 dark:text-slate-300 px-4">
        <span className="block md:inline">🏆 <span className="text-neutral-900 dark:text-slate-100 font-black">{t("promo_active")}</span></span>
        <span className="block md:inline md:ms-1 mt-0.5 md:mt-0">{t("promo_code_text")}</span>
      </div>

      {/* 6. WORLD CUP HERO BANNER */}
      <section className="w-full mb-0">
        <div className="relative w-full h-[480px] md:h-[600px] rounded-none overflow-hidden group">
          <img 
            src="/hero_banner.png" 
            alt="Hero Banner" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 md:via-slate-950/20 to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 md:right-auto md:bottom-12 ltr:md:left-12 rtl:md:right-12 p-5 md:p-0 z-20 md:max-w-xl text-start">
            <h1 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-3 tracking-wide uppercase font-sans drop-shadow-md">
              {t("hero_title")}
            </h1>
            <p className="text-slate-300 md:text-slate-200 text-xs md:text-sm mb-5 md:mb-6 max-w-[320px] md:max-w-md font-sans font-medium leading-relaxed drop-shadow-sm">
              {t("hero_desc")}
            </p>
            <Link href="/shop?q=Barcelona" className="mobile-cta-full md:inline-block bg-[#ffffff] dark:bg-[#ffffff] text-[#020617] dark:text-[#020617] px-6 md:px-8 py-3.5 md:py-3 rounded-xl md:rounded-none font-bold text-sm md:text-sm hover:bg-kora hover:text-white hover:scale-105 transition-all shadow-lg uppercase tracking-wider">
              {t("shop_now")}
            </Link>
          </div>
        </div>
      </section>





      {/* 7.8 CLUB JERSEYS (Horizontal Slider) */}
      <section className="px-4 md:px-6 mb-10 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("club_jerseys")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">{t("club_jerseys_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Shirts" 
            className="text-[10px] md:text-xs font-bold text-kora dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 dark:border-purple-800/40 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
          >
            {t("see_all")} 
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[220px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <ClubJerseySlider />
          </Suspense>
        </ScrollSlider>
      </section>

      {/* 8. WORLD CUP JERSEYS (Horizontal Slider) */}
      <section className="px-4 md:px-6 mb-10 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("national_jerseys")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">{t("national_jerseys_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Shirts" 
            className="text-[10px] md:text-xs font-bold text-kora dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 dark:border-purple-800/40 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
          >
            {t("see_all")} 
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[220px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <WorldCupJerseySlider />
          </Suspense>
        </ScrollSlider>
      </section>

      {/* 8.5 SHOES (Horizontal Slider) */}
      <section className="px-4 md:px-6 mb-10 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("shoes")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">{t("shoes_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Casual Shoes" 
            className="text-[10px] md:text-xs font-bold text-kora dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 dark:border-purple-800/40 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
          >
            {t("see_all")} 
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[220px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <ShoesSlider />
          </Suspense>
        </ScrollSlider>
      </section>

      {/* 9. STREETWEAR, ACCESSORIES & FLAGS (Horizontal Slider) */}
      <section className="px-4 md:px-6 mb-16 md:mb-24 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("streetwear_gear")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">{t("streetwear_gear_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Accessories" 
            className="text-[10px] md:text-xs font-bold text-kora dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 dark:border-purple-800/40 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
          >
            {t("see_all")} 
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[220px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <StreetwearAndGearSlider />
          </Suspense>
        </ScrollSlider>
      </section>


    </main>
  );
}