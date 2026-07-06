"use client";
import { useState, useEffect, useRef } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { CURRENCY } from "@/lib/constants";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

const CATEGORIES = ["All", "World Cup", "Shoes", "Shirts", "Retro Kits", "Accessories"];
const TEAMS = ["All Teams", "Argentina", "Brazil", "France", "Germany", "Portugal", "Spain", "Uruguay", "Arsenal", "Barcelona", "Real Madrid", "Manchester City", "Paris Saint-Germain", "Manchester United"];

// ─── Mini Image Carousel (pure CSS scroll-snap, no JS animation) ───
function MiniCarousel({ images, alt, soldOut }: { images: string[]; alt: string; soldOut: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const slideWidth = el.clientWidth;
      if (slideWidth > 0) {
        setActiveSlide(Math.round(el.scrollLeft / slideWidth));
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (images.length <= 1) {
    return (
      <img
        src={images[0] || ""}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={`w-full h-full object-cover ${soldOut ? "opacity-40 grayscale" : ""}`}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={scrollRef} className="mobile-mini-carousel w-full h-full">
        {images.slice(0, 3).map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${alt} ${idx + 1}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={`mobile-mini-carousel-slide object-cover ${soldOut ? "opacity-40 grayscale" : ""}`}
          />
        ))}
      </div>
      {/* Dot indicators */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {images.slice(0, 3).map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              idx === activeSlide ? "bg-kora scale-125" : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ShopUI({ products }: { products: any[] }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTeam, setActiveTeam] = useState("All Teams");
  const [activeTag, setActiveTag] = useState("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setActiveTag(searchParams.get("tag") || "All");
    setActiveTeam(searchParams.get("team") || "All Teams");
    setActiveCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  useEffect(() => {
    const handleFilterUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.resetAll) {
        setSearchQuery("");
        setActiveTag("All");
        setActiveTeam("All Teams");
        setActiveCategory("All");
      } else {
        if (detail.team !== undefined) {
          setActiveTeam(detail.team || "All Teams");
        }
        if (detail.category !== undefined) {
          setActiveCategory(detail.category || "All");
        }
      }
    };
    window.addEventListener("kora_filter_update", handleFilterUpdate);
    return () => window.removeEventListener("kora_filter_update", handleFilterUpdate);
  }, []);

  // Lock scroll inside the sidebar so it doesn't affect the body/product grid
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleSidebarWheel = (e: WheelEvent) => {
      const scrollTop = sidebar.scrollTop;
      const scrollHeight = sidebar.scrollHeight;
      const clientHeight = sidebar.clientHeight;
      const delta = e.deltaY;

      // 1. If content is shorter than container, prevent body scroll entirely
      if (scrollHeight <= clientHeight) {
        e.preventDefault();
        return;
      }

      // 2. Prevent scroll leakage if trying to scroll up at the top
      if (delta < 0 && scrollTop <= 0) {
        e.preventDefault();
        return;
      }

      // 3. Prevent scroll leakage if trying to scroll down at the bottom
      if (delta > 0 && scrollTop + clientHeight >= scrollHeight - 1) {
        e.preventDefault();
        return;
      }
    };

    sidebar.addEventListener("wheel", handleSidebarWheel, { passive: false });
    return () => {
      sidebar.removeEventListener("wheel", handleSidebarWheel);
    };
  }, []);

  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isBottomSheetOpen]);

  // Reset page scroll to the top of viewport when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeCategory, activeTeam, searchQuery]);

  const normalizeTeam = (teamName: string) => {
    const lower = teamName.toLowerCase().trim();
    if (lower === "man city" || lower === "manchester city") return "manchester city";
    if (lower === "psg" || lower === "paris saint-germain") return "paris saint-germain";
    return lower;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || 
      (activeCategory === "Shoes" && product.category === "Boots") ||
      (activeCategory === "World Cup" && product.isWorldCup) ||
      (activeCategory === "Accessories" && (product.category === "Flags" || product.category === "Accessories")) ||
      product.category === activeCategory;
    const matchesTag = activeTag === "All" || product.tag === activeTag;
    const matchesTeam = activeTeam === "All Teams" || (product.team && normalizeTeam(product.team) === normalizeTeam(activeTeam));

    return matchesSearch && matchesCategory && matchesTag && matchesTeam;
  });

  // Sort display products: "On Sale" tags always appear first.
  // Then follow standard Category hierarchy: Shirts (1) -> Boots (2) -> Accessories (3) -> Others (4)
  // Then Tag priority within category: Trending (1) -> Latest (2) -> Others (3)
  const displayProducts = [...filteredProducts];
  const categoryPriority = (cat: string) => {
    if (cat === "Shirts") return 1;
    if (cat === "Boots") return 2;
    if (cat === "Accessories" || cat === "Flags") return 3;
    return 4;
  };

  const tagPriority = (tag: string | null) => {
    if (tag === "On Sale") return 0;
    if (tag === "Trending") return 1;
    if (tag === "Latest") return 2;
    return 3; // Other or null
  };

  displayProducts.sort((a, b) => {
    // 1. Tag priority absolute top check for "On Sale"
    const isSaleA = a.tag === "On Sale";
    const isSaleB = b.tag === "On Sale";
    if (isSaleA !== isSaleB) return isSaleA ? -1 : 1;

    // 2. Category Priority
    const catA = categoryPriority(a.category);
    const catB = categoryPriority(b.category);
    if (catA !== catB) return catA - catB;

    // 3. Tag Priority
    const tagA = tagPriority(a.tag);
    const tagB = tagPriority(b.tag);
    if (tagA !== tagB) return tagA - tagB;

    return a.name.localeCompare(b.name);
  });

  // Count active filters for badge
  const activeFilterCount = 
    (activeCategory !== "All" ? 1 : 0) + 
    (activeTeam !== "All Teams" ? 1 : 0) +
    (activeTag !== "All" ? 1 : 0);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "All": return t("all");
      case "World Cup": return t("category_world_cup");
      case "Shoes": return t("category_shoes");
      case "Shirts": return t("category_shirts");
      case "Retro Kits": return t("category_retro");
      case "Accessories": return t("category_accessories");
      default: return cat;
    }
  };

  const getTeamLabel = (teamName: string) => {
    const key = teamName.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
    return t(key) || teamName;
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans pt-4 md:pt-8 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ═══ MOBILE ONLY: Top Search Bar ═══ */}
        <div className="block sm:hidden mb-4 relative z-10 text-start">
          <div className="relative group">
            <span className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch className="text-sm" />
            </span>
            <input 
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 ltr:pl-11 ltr:pr-10 rtl:pr-11 rtl:pl-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors font-sans text-sm shadow-sm text-start"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 active:text-slate-600"
              >
                <FaXmark className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* ═══ TABLET: Toggle for filters (sm to lg only) ═══ */}
        <div className="w-full hidden sm:flex lg:hidden gap-3 mb-6">
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-800 active:bg-slate-100 transition-colors shadow-sm"
          >
            <FaFilter className="text-kora text-xs" /> {isFiltersOpen ? t("hide_filters") : t("show_filters")}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar (Desktop/Tablet only — hidden on mobile, replaced by bottom sheet) */}
          <aside 
            ref={sidebarRef}
            className={`w-full lg:w-64 xl:w-72 shrink-0 z-20 hidden sm:block ${
              isFiltersOpen ? "sm:block" : "sm:hidden lg:block"
            }`}
          >
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-start">
              
              {/* Search Field */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FaSearch className="text-kora" /> {t("search")}
                </h3>
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder={t("search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-all font-sans text-sm shadow-sm text-start"
                  />
                </div>
              </div>


              {/* Categories Selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FaFilter className="text-kora" /> {t("categories")}
                </h3>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-start whitespace-nowrap lg:w-full border ${
                        activeCategory === category
                          ? "bg-kora border-kora text-white shadow-md shadow-kora/30"
                          : "bg-white text-slate-600 border-slate-200 hover:text-kora hover:border-kora"
                      }`}
                    >
                      {getCategoryLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Products Grid/List Pane */}
          <div className="flex-1 w-full animate-fade-in-up">
            
            {/* Active Filter Chips */}
            {(searchQuery || activeCategory !== "All" || activeTeam !== "All Teams" || activeTag !== "All") && (
              <div className="flex items-center gap-2 mb-6 font-sans overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-1 flex-wrap sm:flex-nowrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1 shrink-0">{t("active_filters")}</span>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider">
                      {t("search")}: &quot;{searchQuery}&quot;
                      <button 
                        onClick={() => setSearchQuery("")} 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-150 active:bg-slate-200 transition-colors"
                        aria-label="Clear Search"
                      >
                        <FaXmark className="text-xs" />
                      </button>
                    </span>
                  )}

                  {activeCategory !== "All" && (
                    <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider">
                      {getCategoryLabel(activeCategory)}
                      <button 
                        onClick={() => setActiveCategory("All")} 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-150 active:bg-slate-200 transition-colors"
                        aria-label="Clear Category"
                      >
                        <FaXmark className="text-xs" />
                      </button>
                    </span>
                  )}

                  {activeTeam !== "All Teams" && (
                    <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider">
                      {t("team_label")}: {getTeamLabel(activeTeam)}
                      <button 
                        onClick={() => setActiveTeam("All Teams")} 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-150 active:bg-slate-200 transition-colors"
                        aria-label="Clear Team"
                      >
                        <FaXmark className="text-xs" />
                      </button>
                    </span>
                  )}

                  {activeTag !== "All" && (
                    <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider">
                      {activeTag}
                      <button 
                        onClick={() => setActiveTag("All")} 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-150 active:bg-slate-200 transition-colors"
                        aria-label="Clear Tag"
                      >
                        <FaXmark className="text-xs" />
                      </button>
                    </span>
                  )}

                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                      setActiveTeam("All Teams");
                      setActiveTag("All");
                    }}
                    className="text-xs font-bold text-kora hover:text-purple-700 underline underline-offset-4 uppercase tracking-wider ml-1 shrink-0 py-1"
                  >
                    {t("clear_all")}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile View: List Layout with Image Slideshow */}
            <div className="block sm:hidden space-y-3">
              {displayProducts.map((product) => {
                const images = product.images && product.images.length > 0
                  ? product.images
                  : product.image
                    ? [product.image]
                    : [];
                return (
                  <Link 
                    href={`/shop/${product.id}`} 
                    key={product.id}
                    className="flex gap-3 p-2.5 bg-white border border-slate-200 active:border-kora rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] overflow-hidden text-start"
                  >
                    {/* Left: Product Image Carousel */}
                    <div className="w-28 h-28 shrink-0 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                      {product.stock === 0 ? (
                        <div className="absolute top-1.5 ltr:left-1.5 rtl:right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest z-10 bg-rose-100 text-rose-800 border border-rose-200">
                          {t("sold_out")}
                        </div>
                      ) : product.tag ? (
                        <div className={`absolute top-1.5 ltr:left-1.5 rtl:right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest z-10 ${
                          product.tag === 'Latest' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {t(product.tag.toLowerCase()) || product.tag}
                        </div>
                      ) : null}
                      <MiniCarousel 
                        images={images} 
                        alt={product.name} 
                        soldOut={product.stock === 0} 
                      />
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 font-sans text-start">
                      <div>
                        <p className="text-kora text-[9px] font-bold uppercase tracking-widest mb-1">{product.category === "Boots" ? t("category_shoes") : product.category === "Flags" ? t("category_accessories") : getCategoryLabel(product.category)}</p>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
                      </div>
                      
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">{t("price_label")}</span>
                          <div className="flex items-baseline gap-1">
                            {(product.team === "Germany" || product.team === "Uruguay") && (
                              <span className="text-xs text-slate-400 line-through leading-none font-medium">
                                {t("aed")}75
                              </span>
                            )}
                            <span className="text-base font-black text-slate-900 leading-none">
                              {t("aed")}{String(product.price).replace(CURRENCY.trim(), '').replace('$', '').trim()}
                            </span>
                          </div>
                        </div>
                        <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border ${
                          product.stock === 0 
                            ? "bg-slate-100 text-slate-400 border-slate-200" 
                            : "bg-kora text-white border-kora shadow-sm"
                        }`}>
                          {product.stock === 0 ? t("sold_out") : t("view_gear")}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop View: Grid Layout */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-16 md:py-24 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
                <div className="text-4xl mb-4 opacity-50">🏟️</div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{t("no_results")}</h3>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                    setActiveTeam("All Teams");
                    setActiveTag("All");
                  }}
                  className="mt-6 px-6 py-3 bg-kora hover:bg-purple-700 text-white rounded-full font-bold text-xs transition-colors shadow-md shadow-kora/30"
                >
                  {t("reset_filters")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ MOBILE: Filter FAB (Floating Action Button) ═══ */}
        <button
          onClick={() => setIsBottomSheetOpen(true)}
          className="sm:hidden mobile-filter-fab"
          aria-label="Open filters"
        >
          <FaFilter className="text-lg" />
          {activeFilterCount > 0 && (
            <span className="mobile-filter-fab-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* ═══ MOBILE: Bottom Sheet Filter Drawer ═══ */}
        {isBottomSheetOpen && (
          <>
            <div 
              className="sm:hidden mobile-bottom-sheet-backdrop"
              onClick={() => setIsBottomSheetOpen(false)}
            />
            <div className="sm:hidden mobile-bottom-sheet">
              <div className="mobile-bottom-sheet-handle" />
              
              <div className="p-5 space-y-5 text-start">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-tight">{t("filters")}</h3>
                  <button 
                    onClick={() => setIsBottomSheetOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200"
                  >
                    <FaXmark className="text-sm" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">{t("categories")}</p>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                          activeCategory === category
                            ? "bg-kora border-kora text-white shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 active:border-kora"
                        }`}
                      >
                        {getCategoryLabel(category)}
                      </button>
                    ))}
                  </div>
                </div>


                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setActiveTeam("All Teams");
                      setActiveTag("All");
                      setSearchQuery("");
                    }}
                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 text-slate-600 active:bg-slate-50"
                  >
                    {t("clear_all")}
                  </button>
                  <button
                    onClick={() => setIsBottomSheetOpen(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-kora text-white border border-kora shadow-sm active:bg-purple-700"
                  >
                    {t("show_results")} ({displayProducts.length})
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}