"use client";

import { useState } from "react";
import { CURRENCY } from "@/lib/constants";
import ImageUploader from "@/components/ImageUploader";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "Shirts",
    team: "",
    price: "",
    description: "",
    tag: "Latest",
    images: [] as string[],
    sizes: "S, M, L, XL",
    stock: "10",
    isWorldCup: false
  });

  const handleCategoryChange = (cat: string) => {
    let defaultSizes = "S, M, L, XL";
    if (cat === "Boots") {
      defaultSizes = "38, 39, 40, 41, 42, 43, 44";
    } else if (cat === "Accessories") {
      defaultSizes = "One Size";
    }
    setFormData({
      ...formData,
      category: cat,
      sizes: defaultSizes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      setStatus("❌ Please upload at least one image.");
      return;
    }

    setStatus("Dropping into Vault...");

    try {
      const response = await fetch("/api/gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sizes: formData.sizes.split(",").map(size => size.trim()).filter(Boolean),
          stock: parseInt(formData.stock) || 0,
          isWorldCup: formData.isWorldCup
        })
      });

      if (response.ok) {
        setStatus("✅ Gear successfully added to the Vault!");
        setFormData({
          name: "",
          category: "Shirts",
          team: "",
          price: "",
          description: "",
          tag: "Latest",
          images: [],
          sizes: "S, M, L, XL",
          stock: "10",
          isWorldCup: false
        });
      } else {
        const errorData = await response.json();
        setStatus(`❌ Error adding gear: ${errorData.error || "Check console."}`);
      }
    } catch (err) {
      setStatus("❌ Critical failure.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">

        {/* Form Header with gradient accent bar */}
        <div className="relative px-5 sm:px-8 pt-7 pb-5 border-b border-slate-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kora via-purple-500 to-pink-500" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Vault Ingestion</h2>
          <p className="text-slate-400 text-xs mt-1">Register new football gear directly into the Kora Store central database</p>
        </div>

        <div className="p-5 sm:p-8 space-y-8">

          {/* Section 1: Basic Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-kora/10 text-kora flex items-center justify-center text-xs font-black shrink-0">1</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Basic Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gear Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-sm font-bold transition-all"
                  placeholder="e.g., Real Madrid 11/12 Gold Edition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Price ({CURRENCY.trim()})</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-sm font-mono font-bold transition-all"
                  placeholder="120.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora outline-none text-sm cursor-pointer font-bold transition-all"
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Boots">Shoes / Boots</option>
                  <option value="Retro Kits">Retro Kits</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Club / National Team</label>
                <input
                  type="text"
                  value={formData.team}
                  onChange={e => setFormData({...formData, team: e.target.value})}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-sm font-bold transition-all"
                  placeholder="e.g., Real Madrid"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Display Tag</label>
                <select
                  value={formData.tag}
                  onChange={e => setFormData({...formData, tag: e.target.value})}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora outline-none text-sm cursor-pointer font-bold transition-all"
                >
                  <option value="Latest">Latest</option>
                  <option value="Trending">Trending</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Inventory & Campaigns */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-kora/10 text-kora flex items-center justify-center text-xs font-black shrink-0">2</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Inventory &amp; Campaigns</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Initial Stock Level</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-sm font-bold transition-all"
                  placeholder="10"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200 rounded-xl p-4 w-full h-full select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isWorldCup}
                    onChange={e => setFormData({...formData, isWorldCup: e.target.checked})}
                    className="rounded text-[#6B00FF] focus:ring-[#6B00FF] h-4 w-4 border-slate-300"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">World Cup Campaign</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Highlight this gear in the World Cup catalog section</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Media & Sizes */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-kora/10 text-kora flex items-center justify-center text-xs font-black shrink-0">3</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Media &amp; Sizes</h3>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Product Images</label>
              <ImageUploader
                images={formData.images}
                onChange={uploadedUrls => setFormData({ ...formData, images: uploadedUrls })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available Sizes (Comma separated)</label>
              <input
                required
                type="text"
                value={formData.sizes}
                onChange={e => setFormData({...formData, sizes: e.target.value})}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none font-mono text-xs transition-all"
                placeholder="S, M, L, XL"
              />
            </div>
          </div>

          {/* Section 4: Description */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-kora/10 text-kora flex items-center justify-center text-xs font-black shrink-0">4</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Description</h3>
            </div>

            <div>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none h-28 resize-none text-sm transition-all"
                placeholder="Verify dimensions and jersey fabric weave type detail..."
              />
            </div>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="px-5 sm:px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex flex-col items-center gap-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-kora to-purple-600 hover:from-purple-700 hover:to-kora text-white font-black py-4 rounded-2xl tracking-widest uppercase transition-all shadow-lg shadow-kora/20 hover:shadow-xl hover:shadow-kora/30 active:scale-[0.98]"
          >
            Add to Vault
          </button>

          {status && (
            <div className={`w-full text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider ${
              status.startsWith("❌")
                ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                : status.startsWith("✅")
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                : "bg-kora/5 text-kora border border-kora/20"
            }`}>
              {status}
            </div>
          )}
        </div>

      </form>
    </div>
  );
}