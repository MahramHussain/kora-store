"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaFilter, FaSearch } from "react-icons/fa";
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = ["All", "Boots", "Shirts", "Retro Kits"];
const TEAMS = ["All Teams", "Arsenal", "Liverpool", "Man City", "Real Madrid", "Barcelona", "Bayern", "Juventus", "AC Milan", "PSG", "Tottenham", "Al Nassr", "Inter Miami"];

export default function ShopUI({ products }: { products: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTeam, setActiveTeam] = useState("All Teams");
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) setSearchQuery(params.get("q")!);
    if (params.get("tag")) setActiveTag(params.get("tag")!);
    if (params.get("team")) setActiveTeam(params.get("team")!);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesTag = activeTag === "All" || product.tag === activeTag;
    const matchesTeam = activeTeam === "All Teams" || (product.team && product.team.toLowerCase() === activeTeam.toLowerCase());

    return matchesSearch && matchesCategory && matchesTag && matchesTeam;
  });

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-500">VAULT</span>
          </h1>
          <p className="text-slate-400 max-w-xl">
            Browse the complete Kora Store collection. Secure the latest drops, official kits, and legendary retro gear.
          </p>
        </div>

        <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-4 md:p-6 mb-12 shadow-2xl relative z-20">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search players, boots, or collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="relative min-w-[200px]">
              <select 
                value={activeTeam}
                onChange={(e) => setActiveTeam(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
              >
                {TEAMS.map(team => (
                  <option key={team} value={team} className="bg-[#0a0514] text-white">{team}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">&#9662;</div>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10 text-purple-400 shrink-0">
              <FaFilter />
              <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
            </div>
            <div className="flex gap-2 shrink-0">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                    activeCategory === category
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-32 border border-white/5 rounded-2xl bg-white/5 mt-6">
            <div className="text-4xl mb-4 opacity-50">🏟️</div>
            <h3 className="text-2xl font-bold text-white mb-2">The Vault is empty.</h3>
            <button 
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
                setActiveTeam("All Teams");
              }}
              className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </main>
  );
}