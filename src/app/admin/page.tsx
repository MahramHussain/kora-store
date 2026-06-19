"use client";

import { useState } from "react";
import { CURRENCY } from "@/lib/constants";
import { getProducts } from "./actions";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "", category: "Shirts", team: "", price: "", description: "", 
    tag: "Latest", images: "", sizes: "S, M, L, XL"
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
        })
      });

      if (response.ok) {
        setStatus("✅ Gear successfully added to the Vault!");
        setFormData({ name: "", category: "Shirts", team: "", price: "", description: "", tag: "Latest", images: "", sizes: "S, M, L, XL" });
      } else {
        const errorData = await response.json();
        setStatus(`❌ Error adding gear: ${errorData.error || "Check console."}`);
      }
    } catch (err) {
      setStatus("❌ Critical failure.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Vault Ingestion</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gear Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-1 focus:ring-kora outline-none text-sm shadow-sm" placeholder="e.g., Arsenal 03/04 Invincibles" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price ({CURRENCY.trim()})</label>
            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-1 focus:ring-kora outline-none text-sm font-mono shadow-sm" placeholder="120.00" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
            <select value={formData.category} onChange={e => handleCategoryChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora outline-none text-sm cursor-pointer shadow-sm">
              <option value="Shirts">Shirts</option>
              <option value="Boots">Shoes</option>
              <option value="Retro Kits">Retro Kits</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Team</label>
            <input type="text" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-1 focus:ring-kora outline-none text-sm shadow-sm" placeholder="None" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tag</label>
            <select value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora outline-none text-sm cursor-pointer shadow-sm">
              <option value="Latest">Latest</option>
              <option value="Trending">Trending</option>
              <option value="Sale">Sale</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Image Filenames (Comma separated)</label>
          <input required type="text" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-1 focus:ring-kora outline-none font-mono text-sm shadow-sm" placeholder="predator-black.png, predator-black-2.png" />
          <span className="text-[10px] text-slate-400 mt-1.5 block">Local files are automatically resolved by recursively searching the public/assets/ and public/uploads/ folders.</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Available Sizes (Comma separated)</label>
          <input required type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-1 focus:ring-kora outline-none font-mono text-sm shadow-sm" placeholder="S, M, L, XL" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-1 focus:ring-kora outline-none h-24 resize-none text-sm shadow-sm" placeholder="Sell the gear..."></textarea>
        </div>

        <button type="submit" className="w-full bg-kora hover:bg-purple-700 text-white font-black py-4 rounded-xl tracking-widest uppercase transition-all shadow-md shadow-kora/20">
          Add to Vault
        </button>
        
        {status && <p className="text-center font-bold text-emerald-600 mt-4 text-sm">{status}</p>}
      </form>
    </div>
  );
}