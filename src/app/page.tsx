import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard, ProductSkeletonCard } from "@/components/ProductCard";
import { ScrollSlider } from "@/components/ScrollSlider";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

async function WorldCupJerseySlider() {
  const products = await prisma.product.findMany({
    where: { isWorldCup: true },
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
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pb-12 md:pb-20">
      {/* 4. PROMO BANNER — Scannable on mobile */}
      <div className="bg-neutral-100 border-b border-neutral-200 py-3 md:py-2.5 text-center text-xs md:text-sm font-bold text-neutral-800 px-4">
        <span className="block md:inline">🏆 <span className="text-neutral-900 font-black">{t("promo_active")}</span></span>
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
      <section className="w-full bg-white border-b border-neutral-100 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Argentina Away */}
          <Link href="/shop?q=Argentina" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white hover:shadow-md transition-shadow duration-300">
              <img 
                src="/assets/argentina_away_messi.jpg" 
                alt="Argentina Away" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {formatTitle(t("argentina_away_title"))}
            </h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("argentina_away_desc")}
            </p>
          </Link>

          {/* Brazil Away */}
          <Link href="/shop?q=Brazil" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white hover:shadow-md transition-shadow duration-300">
              <img 
                src="/assets/brazil_away_raphinha.jpg" 
                alt="Brazil Away" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {formatTitle(t("brazil_away_title"))}
            </h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("brazil_away_desc")}
            </p>
          </Link>

          {/* Portugal */}
          <Link href="/shop?q=Portugal" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white hover:shadow-md transition-shadow duration-300">
              <img 
                src="/assets/portugal_jersey.png" 
                alt="Portugal" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {t("portugal")}
            </h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("portugal_desc")}
            </p>
          </Link>

          {/* Argentina */}
          <Link href="/shop?q=Argentina" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-0 mb-4 bg-white hover:shadow-md transition-shadow duration-300">
              <img 
                src="/assets/argentina_jersey.png" 
                alt="Argentina" 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900 mb-1.5 group-hover:text-kora transition-colors min-h-[3.5rem] flex items-center justify-center">
              {t("argentina")}
            </h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-[240px] min-h-[4.5rem] flex items-start justify-center">
              {t("argentina_desc")}
            </p>
          </Link>

        </div>
      </section>

      {/* 7. LATEST WORLD CUP MATCHUP SPOTLIGHT BANNER */}
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

        {/* MOBILE VIEW MATCHUP BANNER */}
        <div 
          className="block md:hidden relative w-full h-[450px] rounded-3xl overflow-hidden group/mob border border-slate-800 shadow-2xl flex flex-col items-center justify-between p-6 text-center select-none"
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/mob:scale-102 z-0"
            style={{ backgroundImage: `url('/assets/matchup_bg.png')` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 z-10 pointer-events-none" />

          {/* Subtitle / Header */}
          <div className="relative z-30 pt-2">
            <span className="text-[9px] font-black tracking-[0.25em] text-purple-300 uppercase drop-shadow-md">
              {t("world_cup_highlight")}
            </span>
          </div>

          {/* Teams / VS */}
          <div className="relative z-30 flex flex-col items-center justify-center my-auto w-full">
            <h3 className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-sans">
              {t("france")}
            </h3>

            <div className="flex items-center justify-center my-3">
              {/* France Flag */}
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/90 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex relative shrink-0">
                <div className="w-1/3 h-full bg-[#002654]"></div>
                <div className="w-1/3 h-full bg-white"></div>
                <div className="w-1/3 h-full bg-[#ED2939]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10" />
              </div>

              {/* VS */}
              <div className="mx-4 px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.6)] text-white font-black text-xs tracking-widest uppercase flex items-center justify-center">
                <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent animate-pulse">{t("vs")}</span>
              </div>

              {/* Spain Flag */}
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/90 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col relative shrink-0">
                <div className="h-[27%] w-full bg-[#C1272D]"></div>
                <div className="h-[46%] w-full bg-[#FCD116] flex items-center justify-center">
                  <div className="w-2.5 h-3 bg-[#C1272D]/20 rounded-xs border border-[#C1272D]/40" />
                </div>
                <div className="h-[27%] w-full bg-[#C1272D]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10" />
              </div>
            </div>

            <h3 className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-sans">
              {t("spain")}
            </h3>
          </div>

          {/* Subtitle and CTAs */}
          <div className="relative z-30 w-full flex flex-col items-center gap-3">
            <p className="text-[10px] font-extrabold tracking-[0.25em] text-slate-200 uppercase drop-shadow-md">
              {t("matchup_subtitle")}
            </p>
            <div className="flex flex-row gap-3 w-full justify-center">
              <Link 
                href="/shop?q=France" 
                className="flex-grow bg-blue-600/90 text-white font-extrabold text-[10px] tracking-wider uppercase py-3 px-2 rounded-xl text-center shadow-lg active:scale-95"
              >
                {t("shop_france")}
              </Link>
              <Link 
                href="/shop?q=Spain" 
                className="flex-grow bg-red-600/90 text-white font-extrabold text-[10px] tracking-wider uppercase py-3 px-2 rounded-xl text-center shadow-lg active:scale-95"
              >
                {t("shop_spain")}
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW MATCHUP BANNER */}
        <div 
          className="hidden md:flex relative w-full aspect-[16/9] md:h-auto rounded-[32px] overflow-hidden group/desk border border-slate-800/80 shadow-2xl flex-row select-none"
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/desk:scale-[1.01] z-0"
            style={{ backgroundImage: `url('/assets/matchup_bg.png')` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 z-10 pointer-events-none" />

          {/* Subtitle / Header absolute top */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
            <span className="text-[10px] font-black tracking-[0.3em] text-purple-300 uppercase bg-slate-950/60 backdrop-blur-xs px-5 py-2 rounded-full border border-white/5 shadow-md">
              {t("matchup_subtitle")}
            </span>
          </div>

          {/* Left half (France) */}
          <div className="w-1/2 h-full relative z-20 group/france transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center justify-between py-14 px-10">
            {/* Hover Tint */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-transparent opacity-0 group-hover/france:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <span className="relative z-30 text-xs font-black tracking-widest text-blue-300 opacity-60 group-hover/france:opacity-100 transition-opacity uppercase">
              {t("france")} Issue
            </span>

            <div className="relative z-30 flex flex-col items-center gap-6 my-auto">
              <h3 className="text-6xl lg:text-7xl font-black text-white tracking-widest uppercase transition-transform duration-500 group-hover/france:scale-105 drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] font-sans">
                {t("france")}
              </h3>
              <div className="w-20 h-20 rounded-[22px] overflow-hidden border-2 border-white/90 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex relative transition-transform duration-500 group-hover/france:scale-110">
                <div className="w-1/3 h-full bg-[#002654]"></div>
                <div className="w-1/3 h-full bg-white"></div>
                <div className="w-1/3 h-full bg-[#ED2939]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10" />
              </div>
            </div>

            <Link 
              href="/shop?q=France" 
              className="relative z-30 bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase py-4 px-8 rounded-2xl hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_4px_25px_rgba(37,99,235,0.4)] group-hover/france:shadow-[0_4px_35px_rgba(37,99,235,0.6)]"
            >
              {t("shop_france")}
            </Link>
          </div>

          {/* Absolute Center Divider */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center text-white font-black text-lg tracking-wider uppercase animate-pulse">
              <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{t("vs")}</span>
            </div>
          </div>

          {/* Right half (Spain) */}
          <div className="w-1/2 h-full relative z-20 group/spain transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center justify-between py-14 px-10">
            {/* Hover Tint */}
            <div className="absolute inset-0 bg-gradient-to-l from-red-900/30 to-transparent opacity-0 group-hover/spain:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <span className="relative z-30 text-xs font-black tracking-widest text-red-300 opacity-60 group-hover/spain:opacity-100 transition-opacity uppercase">
              {t("spain")} Issue
            </span>

            <div className="relative z-30 flex flex-col items-center gap-6 my-auto">
              <h3 className="text-6xl lg:text-7xl font-black text-white tracking-widest uppercase transition-transform duration-500 group-hover/spain:scale-105 drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] font-sans">
                {t("spain")}
              </h3>
              <div className="w-20 h-20 rounded-[22px] overflow-hidden border-2 border-white/90 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex flex-col relative transition-transform duration-500 group-hover/spain:scale-110">
                <div className="h-[27%] w-full bg-[#C1272D]"></div>
                <div className="h-[46%] w-full bg-[#FCD116] flex items-center justify-center">
                  <div className="w-3.5 h-4 bg-[#C1272D]/20 rounded-xs border border-[#C1272D]/40" />
                </div>
                <div className="h-[27%] w-full bg-[#C1272D]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10" />
              </div>
            </div>

            <Link 
              href="/shop?q=Spain" 
              className="relative z-30 bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase py-4 px-8 rounded-2xl hover:bg-red-500 hover:scale-105 transition-all shadow-[0_4px_25px_rgba(220,38,38,0.4)] group-hover/spain:shadow-[0_4px_35px_rgba(220,38,38,0.6)]"
            >
              {t("shop_spain")}
            </Link>
          </div>
        </div>
      </section>

      {/* 8. WORLD CUP JERSEYS (Horizontal Slider) */}
      <section className="px-4 md:px-6 mb-10 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("national_jerseys")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2">{t("national_jerseys_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Shirts" 
            className="text-[10px] md:text-xs font-bold text-kora hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
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
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("shoes")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2">{t("shoes_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Shoes" 
            className="text-[10px] md:text-xs font-bold text-kora hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
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
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("streetwear_gear")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2">{t("streetwear_gear_sub")}</p>
          </div>
          <Link 
            href="/shop?category=Accessories" 
            className="text-[10px] md:text-xs font-bold text-kora hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/20 md:border-0 rounded-full px-3 py-1.5 md:p-0 shrink-0"
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