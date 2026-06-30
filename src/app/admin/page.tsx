"use client";

import { useState } from "react";
import { CURRENCY } from "@/lib/constants";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "Shirts",
    team: "",
    price: "",
    description: "",
    tag: "Latest",
    images: "",
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
    setStatus("Dropping into Vault...");

    const rawImages = formData.images.split(",").map(img => img.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: rawImages,
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
          images: "",
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
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-8">
        
        {/* Section 1: Ingestion Header */}
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Vault Ingestion</h2>
          <p className="text-slate-400 text-xs mt-1">Register new football gear directly into the Kora Store central database</p>
        </div>

        {/* Section 2: Basic Details Grid */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-l-2 border-[#6B00FF] pl-2">1. Basic Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gear Name</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-sm shadow-2xs transition-all font-bold" 
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
                className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-sm font-mono shadow-2xs transition-all font-bold" 
                placeholder="120.00" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
              <select 
                value={formData.category} 
                onChange={e => handleCategoryChange(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] outline-none text-sm cursor-pointer shadow-2xs transition-all font-bold"
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
                className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-sm shadow-2xs transition-all font-bold" 
                placeholder="e.g., Real Madrid" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Display Tag</label>
              <select 
                value={formData.tag} 
                onChange={e => setFormData({...formData, tag: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] outline-none text-sm cursor-pointer shadow-2xs transition-all font-bold"
              >
                <option value="Latest">Latest</option>
                <option value="Trending">Trending</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Stock & Campaigns Grid */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-l-2 border-[#6B00FF] pl-2">2. Inventory & Campaigns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Initial Stock Level</label>
              <input 
                required 
                type="number" 
                min="0"
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-sm font-bold shadow-2xs transition-all" 
                placeholder="10" 
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 hover:bg-slate-100/60 border border-slate-200/80 rounded-xl p-4 w-full h-full select-none transition-colors">
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

        {/* Section 4: Media & Sizing */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-l-2 border-[#6B00FF] pl-2">3. Media & Sizes</h3>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Image Filenames (Comma separated)</label>
            <input 
              required 
              type="text" 
              value={formData.images} 
              onChange={e => setFormData({...formData, images: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none font-mono text-xs shadow-2xs transition-all" 
              placeholder="realmadrid-home.png, realmadrid-home-back.png" 
            />
            <span className="text-[10px] text-slate-400 mt-2 block">Files are resolved recursively inside the public/assets/ and public/uploads/ directories.</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available Sizes (Comma separated)</label>
            <input 
              required 
              type="text" 
              value={formData.sizes} 
              onChange={e => setFormData({...formData, sizes: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none font-mono text-xs shadow-2xs transition-all" 
              placeholder="S, M, L, XL" 
            />
          </div>
        </div>

        {/* Section 5: Description */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-l-2 border-[#6B00FF] pl-2">4. Description</h3>

          <div>
            <textarea 
              required 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200/80 focus:bg-white rounded-xl p-3.5 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none h-28 resize-none text-sm shadow-2xs transition-all" 
              placeholder="Verify dimensions and jersey fabric weave type detail..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-[#6B00FF] text-white font-black py-4 rounded-xl tracking-widest uppercase transition-all shadow-md shadow-slate-900/10 hover:shadow-[#6B00FF]/20 active:scale-98"
          >
            Add to Vault
          </button>
          
          {status && (
            <p className={`font-bold text-xs uppercase tracking-wider ${
              status.startsWith("❌") ? "text-rose-600" : "text-emerald-600"
            }`}>
              {status}
            </p>
          )}
        </div>
        
      </form>
    </div>
  );
}