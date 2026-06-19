"use client";
import { useState, useEffect, useRef } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = ["All", "World Cup", "Shoes", "Shirts", "Retro Kits", "Accessories", "Flags"];
const TEAMS = ["All Teams", "Argentina", "Brazil", "France", "Germany", "Portugal", "Spain", "Uruguay", "Arsenal", "Barcelona", "Real Madrid", "Man City", "PSG", "Manchester United"];

export default function ShopUI({ products }: { products: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTeam, setActiveTeam] = useState("All Teams");
  const [activeTag, setActiveTag] = useState("All");

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) setSearchQuery(params.get("q")!);
    if (params.get("tag")) setActiveTag(params.get("tag")!);
    if (params.get("team")) setActiveTeam(params.get("team")!);
    if (params.get("category")) setActiveCategory(params.get("category")!);
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

  // Reset page scroll to the top of viewport when filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeCategory, activeTeam, searchQuery]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || 
      (activeCategory === "Shoes" && product.category === "Boots") ||
      (activeCategory === "World Cup" && product.isWorldCup) ||
      product.category === activeCategory;
    const matchesTag = activeTag === "All" || product.tag === activeTag;
    const matchesTeam = activeTeam === "All Teams" || (product.team && product.team.toLowerCase() === activeTeam.toLowerCase());

    return matchesSearch && matchesCategory && matchesTag && matchesTeam;
  });

  // Sort display products: Category hierarchy: Shirts (1) -> Boots (2) -> Accessories (3) -> Others (4)
  // Tag priority within category: Trending (1) -> Latest (2) -> Others (3)
  const displayProducts = [...filteredProducts];
  const categoryPriority = (cat: string) => {
    if (cat === "Shirts") return 1;
    if (cat === "Boots") return 2;
    if (cat === "Accessories") return 3;
    return 4; // Flags, etc.
  };

  const tagPriority = (tag: string | null) => {
    if (tag === "Trending") return 1;
    if (tag === "Latest") return 2;
    return 3; // Sale or null
  };

  displayProducts.sort((a, b) => {
    // 1. Primary: Category priority
    const catA = categoryPriority(a.category);
    const catB = categoryPriority(b.category);
    if (catA !== catB) {
      return catA - catB;
    }

    // 2. Secondary: Tag priority
    const tagA = tagPriority(a.tag);
    const tagB = tagPriority(b.tag);
    if (tagA !== tagB) {
      return tagA - tagB;
    }

    // 3. Tertiary: Alphabetical sorting of names
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans pt-8 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar (Confined scroll: scrolling here doesn't affect page) */}
          <aside 
            ref={sidebarRef}
            className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-28 z-20 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-hide overscroll-contain"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Search Field */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FaSearch className="text-kora" /> Search
                </h3>
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Search players, boots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-all font-sans text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Support Your Side (Teams Selection) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Support Your Side
                </h3>
                <div className="relative">
                  <select 
                    value={activeTeam}
                    onChange={(e) => setActiveTeam(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 focus:outline-none focus:border-kora transition-all cursor-pointer font-sans text-sm shadow-sm"
                  >
                    {TEAMS.map(team => (
                      <option key={team} value={team} className="bg-white text-slate-900">{team}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">&#9662;</div>
                </div>
              </div>

              {/* Categories Selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FaFilter className="text-kora" /> Categories
                </h3>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left whitespace-nowrap lg:w-full border ${
                        activeCategory === category
                          ? "bg-kora border-kora text-white shadow-md shadow-kora/30"
                          : "bg-white text-slate-600 border-slate-200 hover:text-kora hover:border-kora"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Products Grid Pane */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-24 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
                <div className="text-4xl mb-4 opacity-50">🏟️</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">The Vault is empty.</h3>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                    setActiveTeam("All Teams");
                  }}
                  className="mt-6 px-6 py-3 bg-kora hover:bg-purple-700 text-white rounded-full font-bold text-xs transition-colors shadow-md shadow-kora/30"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}