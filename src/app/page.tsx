import Link from "next/link";
import { Suspense } from "react";
import { ProductCard, ProductSkeletonCard } from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";
import { getFeaturedProductsForSection, SectionId } from "@/lib/featuredSections";

// Force dynamic rendering so admin featured changes appear immediately on homepage
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function FeaturedSectionGrid({ sectionId }: { sectionId: SectionId }) {
  const products = await getFeaturedProductsForSection(sectionId);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={index >= 4 ? "hidden md:block" : ""}
        >
          <ProductCard
            product={{
              ...product,
              price: product.price.toString(),
              originalPrice: product.originalPrice ? product.originalPrice.toString() : null,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function SectionGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={index >= 4 ? "hidden md:block" : ""}
        >
          <ProductSkeletonCard />
        </div>
      ))}
    </div>
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

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-kora selection:text-white pb-12 md:pb-20 transition-colors duration-300">
      {/* PROMO BANNER */}
      <div className="bg-neutral-100 dark:bg-slate-900 border-b border-neutral-200 dark:border-slate-800 py-3 md:py-2.5 text-center text-xs md:text-sm font-bold text-neutral-800 dark:text-slate-300 px-4">
        <span className="block md:inline">🏆 <span className="text-neutral-900 dark:text-slate-100 font-black">{t("promo_active")}</span></span>
        <span className="block md:inline md:ms-1 mt-0.5 md:mt-0">{t("promo_code_text")}</span>
      </div>

      {/* 1. BEST SELLERS (12 Products: 4 in a row on desktop, 2 rows on mobile) */}
      <section className="px-3 sm:px-6 my-8 sm:my-10 md:my-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("best_sellers")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">
              {t("best_sellers_sub")}
            </p>
          </div>
          <Link 
            href="/shop" 
            className="text-xs sm:text-sm font-bold text-kora dark:text-purple-400 hover:text-white hover:bg-kora dark:hover:bg-purple-600 dark:hover:text-white transition-all uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/25 dark:border-purple-800/40 rounded-full px-3.5 py-1.5 shrink-0 shadow-xs"
          >
            <span>{t("view_all")}</span>
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <Suspense fallback={<SectionGridSkeleton count={12} />}>
          <FeaturedSectionGrid sectionId="best_sellers" />
        </Suspense>
      </section>

      {/* DYNAMIC HERO BANNER CAROUSEL */}
      <HeroBanner />

      {/* 2. CLUB JERSEYS (8 Products: 4 in a row on desktop, 2 rows on mobile) */}
      <section className="px-3 sm:px-6 my-8 sm:my-12 md:my-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("club_jerseys")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">
              {t("club_jerseys_sub")}
            </p>
          </div>
          <Link 
            href="/shop?category=Shirts" 
            className="text-xs sm:text-sm font-bold text-kora dark:text-purple-400 hover:text-white hover:bg-kora dark:hover:bg-purple-600 dark:hover:text-white transition-all uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/25 dark:border-purple-800/40 rounded-full px-3.5 py-1.5 shrink-0 shadow-xs"
          >
            <span>{t("view_all")}</span>
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <Suspense fallback={<SectionGridSkeleton count={8} />}>
          <FeaturedSectionGrid sectionId="club" />
        </Suspense>
      </section>

      {/* 3. WORLD CUP & NATIONAL JERSEYS (8 Products: 4 in a row on desktop, 2 rows on mobile) */}
      <section className="px-3 sm:px-6 mb-8 sm:mb-12 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("national_jerseys")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">
              {t("national_jerseys_sub")}
            </p>
          </div>
          <Link 
            href="/shop?category=Shirts" 
            className="text-xs sm:text-sm font-bold text-kora dark:text-purple-400 hover:text-white hover:bg-kora dark:hover:bg-purple-600 dark:hover:text-white transition-all uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/25 dark:border-purple-800/40 rounded-full px-3.5 py-1.5 shrink-0 shadow-xs"
          >
            <span>{t("view_all")}</span>
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <Suspense fallback={<SectionGridSkeleton count={8} />}>
          <FeaturedSectionGrid sectionId="national" />
        </Suspense>
      </section>

      {/* 4. SHOES & BOOTS (8 Products: 4 in a row on desktop, 2 rows on mobile) */}
      <section className="px-3 sm:px-6 mb-8 sm:mb-12 md:mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("shoes")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">
              {t("shoes_sub")}
            </p>
          </div>
          <Link 
            href="/shop?category=Boots" 
            className="text-xs sm:text-sm font-bold text-kora dark:text-purple-400 hover:text-white hover:bg-kora dark:hover:bg-purple-600 dark:hover:text-white transition-all uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/25 dark:border-purple-800/40 rounded-full px-3.5 py-1.5 shrink-0 shadow-xs"
          >
            <span>{t("view_all")}</span>
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <Suspense fallback={<SectionGridSkeleton count={8} />}>
          <FeaturedSectionGrid sectionId="shoes" />
        </Suspense>
      </section>

      {/* 5. STREETWEAR, ACCESSORIES & GEAR (8 Products: 4 in a row on desktop, 2 rows on mobile) */}
      <section className="px-3 sm:px-6 mb-16 md:mb-24 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-4 md:mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              {t("streetwear_gear")}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 md:mt-2">
              {t("streetwear_gear_sub")}
            </p>
          </div>
          <Link 
            href="/shop?category=Accessories" 
            className="text-xs sm:text-sm font-bold text-kora dark:text-purple-400 hover:text-white hover:bg-kora dark:hover:bg-purple-600 dark:hover:text-white transition-all uppercase tracking-wider flex items-center gap-1.5 md:gap-2 group border border-kora/25 dark:border-purple-800/40 rounded-full px-3.5 py-1.5 shrink-0 shadow-xs"
          >
            <span>{t("view_all")}</span>
            <span className="group-hover:translate-x-1 transition-transform rtl:rotate-180">→</span>
          </Link>
        </div>

        <Suspense fallback={<SectionGridSkeleton count={8} />}>
          <FeaturedSectionGrid sectionId="gear" />
        </Suspense>
      </section>
    </main>
  );
}