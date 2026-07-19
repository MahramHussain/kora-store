import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard, ProductSkeletonCard } from "@/components/ProductCard";
import { ScrollSlider } from "@/components/ScrollSlider";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";
import SpotlightButton from "@/components/SpotlightButton";

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
    where: { category: "Boots" },
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
    where: { isWorldCup: false, category: { not: "Boots" } },
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

  // Fetch Trending World Cup Products for top carousel
  const trendingWorldCup = await prisma.product.findMany({
    where: { isWorldCup: true },
    take: 6,
    orderBy: { createdAt: "asc" },
  });



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
          <video 
            src="/hero_banner_video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 md:via-slate-950/20 to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 md:right-auto md:bottom-12 ltr:md:left-12 rtl:md:right-12 p-5 md:p-0 z-20 md:max-w-xl text-start">
            <h1 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter uppercase font-sans drop-shadow-md">
              {t("hero_title")}
            </h1>
            <p className="text-slate-300 md:text-slate-200 text-xs md:text-sm mb-5 md:mb-6 max-w-[320px] md:max-w-md font-sans font-medium leading-relaxed drop-shadow-sm">
              {t("hero_desc")}
            </p>
            <Link href="/shop" className="mobile-cta-full md:inline-block bg-white text-slate-900 px-6 md:px-8 py-3.5 md:py-3 rounded-xl md:rounded-none font-bold text-sm md:text-sm hover:bg-kora hover:text-white hover:scale-105 transition-all shadow-lg uppercase tracking-wider">
              {t("shop_now")}
            </Link>
          </div>
        </div>
      </section>

      {/* 6.5 BRANDED KITS SHOWCASE ROW */}
      <section className="w-full bg-white dark:bg-slate-950 border-b border-neutral-100 dark:border-slate-800 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Argentina Away */}
          <Link href="/shop?q=Argentina" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800 rounded-2xl">
              <img 
                src="/assets/argentina_away_messi.jpg" 
                alt="Argentina Away" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-slate-100 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {formatTitle(t("argentina_away_title"))}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("argentina_away_desc")}
            </p>
          </Link>

          {/* Brazil Away */}
          <Link href="/shop?q=Brazil" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800 rounded-2xl">
              <img 
                src="/assets/brazil_away_raphinha.jpg" 
                alt="Brazil Away" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-slate-100 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {formatTitle(t("brazil_away_title"))}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("brazil_away_desc")}
            </p>
          </Link>

          {/* Portugal */}
          <Link href="/shop?q=Portugal" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800 rounded-2xl">
              <img 
                src="/assets/portugal_jersey.png" 
                alt="Portugal" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-slate-100 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {t("portugal")}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("portugal_desc")}
            </p>
          </Link>

          {/* Argentina */}
          <Link href="/shop?q=Argentina" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800 rounded-2xl">
              <img 
                src="/assets/argentina_jersey.png" 
                alt="Argentina" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-slate-100 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {t("argentina")}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("argentina_desc")}
            </p>
          </Link>

        </div>
      </section>

      {/* 7. LATEST WORLD CUP CAMPAIGN SPOTLIGHT BANNER */}
      <section className="px-4 md:px-6 mb-10 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 md:gap-4 uppercase tracking-tight">
            <span className="relative flex h-3 w-3 md:h-4 md:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kora opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-kora"></span>
            </span>
            {t("world_cup_highlight")}
          </h2>
        </div>

        <div className="flex flex-col gap-8 md:gap-12">
          {/* Argentina Campaign Spotlight Banner */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950 flex flex-col md:flex-row min-h-[480px] md:min-h-[520px]">
            {/* Background Glows for Premium Vibe */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Image Column */}
            <div className="w-full md:w-1/2 relative h-[320px] md:h-auto overflow-hidden group z-10 shrink-0">
              <img 
                src="/assets/messi_highlight.png" 
                alt="Messi Argentina World Cup campaign" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
              />
              {/* Gradient Overlay for seamless blending into dark content column */}
              <div className="absolute inset-0 bg-gradient-to-t ltr:md:bg-gradient-to-r rtl:md:bg-gradient-to-l from-slate-950 via-slate-950/20 to-transparent z-15 pointer-events-none" />
            </div>

            {/* Text Column */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-14 relative z-20 text-start">
              {/* Campaign Tag */}
              <span className="text-[10px] font-black tracking-[0.35em] text-amber-400 uppercase mb-4 inline-block drop-shadow-md">
                {t("campaign_spotlight")}
              </span>
              
              {/* Title */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight uppercase leading-tight font-sans mb-4 md:mb-6 drop-shadow-lg">
                {t("messi_spotlight_title")}
              </h3>
              
              {/* Description */}
              <p className="text-slate-300 text-sm md:text-base lg:text-lg mb-6 md:mb-8 font-sans font-medium leading-relaxed max-w-md">
                {t("messi_spotlight_subtitle")}
              </p>
              
              {/* Button */}
              <div>
                <SpotlightButton query="Argentina" theme="gold" />
              </div>
            </div>
          </div>

          {/* Spain Campaign Spotlight Banner */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950 flex flex-col md:flex-row-reverse min-h-[480px] md:min-h-[520px]">
            {/* Background Glows for Premium Vibe */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Image Column */}
            <div className="w-full md:w-1/2 relative h-[320px] md:h-auto overflow-hidden group z-10 shrink-0">
              <img 
                src="/assets/spain_highlight.jpg" 
                alt="Spain World Cup final campaign" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
              />
              {/* Gradient Overlay for seamless blending into dark content column */}
              <div className="absolute inset-0 bg-gradient-to-t ltr:md:bg-gradient-to-l rtl:md:bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent z-15 pointer-events-none" />
            </div>

            {/* Text Column */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-14 relative z-20 text-start">
              {/* Campaign Tag */}
              <span className="text-[10px] font-black tracking-[0.35em] text-red-500 uppercase mb-4 inline-block drop-shadow-md">
                {t("campaign_spotlight")}
              </span>
              
              {/* Title */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight uppercase leading-tight font-sans mb-4 md:mb-6 drop-shadow-lg">
                {t("spain_spotlight_title")}
              </h3>
              
              {/* Description */}
              <p className="text-slate-300 text-sm md:text-base lg:text-lg mb-6 md:mb-8 font-sans font-medium leading-relaxed max-w-md">
                {t("spain_spotlight_subtitle")}
              </p>
              
              {/* Button */}
              <div>
                <SpotlightButton query="Spain" theme="red" />
              </div>
            </div>
          </div>
        </div>
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
            href="/shop?category=Shoes" 
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