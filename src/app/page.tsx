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
        <span className="hidden md:inline"> </span>
        {title.slice(lastSpaceIdx + 1)}
      </>
    );
  };

  // Fetch Trending World Cup Products for top carousel
  const trendingWorldCup = await prisma.product.findMany({
    where: { isWorldCup: true },
    take: 6,
    orderBy: { createdAt: "asc" },
  });

  // Fetch Argentina Away Kit for Spotlight
  const argentinaAwayKit = await prisma.product.findUnique({
    where: { id: "argentina-away-kit" },
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

      {/* 7. LATEST WORLD CUP DROP (SPOTLIGHT SECTION) */}
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
        
        {argentinaAwayKit && (
          <div 
            className="relative w-full h-[420px] md:h-[460px] rounded-2xl overflow-hidden group border border-slate-200 hover:border-[#d45372]/50 transition-colors shadow-2xl"
            style={{ backgroundColor: '#d45372' }}
          >
            {/* Spotlight Banner Image — top area on mobile, right-aligned on desktop */}
            <img 
              src="/assets/argentina_away_spotlight.png" 
              alt="Argentina Away Kit"
              className="absolute ltr:right-0 rtl:left-0 top-0 h-[55%] md:h-full w-auto object-contain pointer-events-none z-0 group-hover:scale-102 transition-transform duration-700"
            />
            
            {/* Gradient overlay — bottom-up on mobile for text area, left-to-right on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t md:ltr:bg-gradient-to-r md:rtl:bg-gradient-to-l from-[#d45372] via-[#d45372]/95 md:via-[#d45372]/90 to-transparent z-10"></div>
            
            <div className="absolute bottom-0 left-0 right-0 md:right-auto md:top-1/2 md:-translate-y-1/2 ltr:md:left-12 rtl:md:right-12 p-5 md:p-0 z-20 md:max-w-lg text-start">
              <p className="text-pink-200 font-bold tracking-widest text-[10px] md:text-sm uppercase mb-1.5 md:mb-2.5">{t("world_cup_highlight")}</p>
              <h3 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 md:mb-3.5 leading-none tracking-tighter uppercase break-words font-sans">
                {t("argentina_away_title")}
              </h3>
              <p className="text-pink-100 mb-4 md:mb-6 max-w-[280px] md:max-w-sm text-xs md:text-base line-clamp-2 md:line-clamp-3 font-sans font-medium">
                {argentinaAwayKit.description || t("spotlight_desc")}
              </p>
              <Link href={`/shop/${argentinaAwayKit.id}`} className="mobile-cta-full md:inline-block bg-white text-[#d45372] px-6 md:px-8 py-3 md:py-3 rounded-full font-bold text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,83,114,0.4)]">
                {t("shop_national_kit")}
              </Link>
            </div>
          </div>
        )}
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

      {/* 10. SEO TEXT CONTENT SECTION (Bilingual) */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-start">
          {lang === "ar" ? (
            // ARABIC SEO SECTION
            <div dir="rtl" className="space-y-10 font-sans">
              <div className="max-w-3xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-kora block mb-2">أفضل متجر كرة قدم في الإمارات</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                  كورة ستور — وجهتك الأولى لشراء مستلزمات وقمصان كرة القدم في دبي والإمارات
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold mt-4">
                  مرحباً بكم في متجر كورة (Kora Store)، متجر كرة القدم الأول عبر الإنترنت في دولة الإمارات العربية المتحدة. نحن نوفر لعشاق المستديرة الساحرة تشكيلة واسعة من قمصان الأندية والمنتخبات، أحذية كرة القدم الاحترافية، والإكسسوارات عالية الجودة. نحن نستورد منتجاتنا مباشرة لنتجاوز هوامش ربح التجزئة الضخمة ونقدم لك الجودة التي تستحقها بأسعار لا تقبل المنافسة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">أطقم قمصان مخصصة ومطبوعة بالكامل</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    سواء كنت تبحث عن أطقم الدوري الإنجليزي الممتاز، الدوري الإسباني، أو قمصان كأس العالم، نوفر لك نسخ اللاعبين (Player Edition) ونسخ الجماهير الفاخرة. استمتع بخدمة طباعة الأسماء والأرقام الرسمية والشارات الأصلية لتصميم قميصك الخاص تماماً كما يرتديه أبطالك في الملعب.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">أحذية كرة قدم فاخرة (Soccer Boots)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    ارتقِ بأدائك في الملعب مع أحذية كرة القدم الفاخرة المتاحة لدينا في دبي وأبوظبي. نوفر أحذية رياضية مصممة للسرعة، الثبات، والتحكم بالكرة على العشب الطبيعي أو الملاعب الاصطناعية (Turf)، لتضمن التميز في كل مباراة.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">توصيل سريع لكافة إمارات الدولة</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    مخزوننا متوفر محلياً بالكامل داخل مستودعاتنا في دولة الإمارات. استمتع بتوصيل سريع وموثوق في غضون 1 إلى 2 أيام عمل إلى دبي، أبوظبي، الشارقة، العين، عجمان، رأس الخيمة، الفجيرة وأم القيوين. كل طلب يخضع لفحص دقيق لضمان جودته قبل شحنه إليك.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // ENGLISH SEO SECTION
            <div className="space-y-10">
              <div className="max-w-3xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-kora block mb-2">Leading Football Shop in UAE</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                  Kora Store — UAE's Premier Online Football Store for Jerseys &amp; Boots
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold mt-4">
                  Welcome to Kora Store, your absolute destination for premium football culture in the United Arab Emirates. As the leading online football store in the UAE, we are dedicated to bringing fans the absolute highest-grade current-season jerseys, custom name printing, professional boots, and iconic retro collections. By cutting out corporate middlemen and sourcing directly, we provide top-tier sport gear at unmatched prices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">Premium Jerseys &amp; Custom Sourcing</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Browse our expansive collection of club kits from the Premier League, La Liga, Serie A, and Champions League, alongside national team jerseys. We feature professional custom name &amp; number printing and official sleeve badges (Champions League, World Cup) so you can represent your favourite player or your own name with pitch-perfect quality.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">Elite Football Boots in Dubai &amp; Abu Dhabi</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Step onto the pitch equipped with the best cleats and turf shoes in the UAE. Our selection of football boots is built for high-performance traction, elite touch, and maximum comfort, helping you perform at your best on firm ground, artificial grass, and indoor courts.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">Express Shipping Across the Emirates</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    We do not dropship. We maintain 100% local stock in our UAE warehouse, allowing us to offer express 1 to 2 business day delivery directly to your doorstep in Dubai, Abu Dhabi, Sharjah, Ajman, Al Ain, Fujairah, and Ras Al Khaimah. Every product goes through rigorous pre-shipping quality checks.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}