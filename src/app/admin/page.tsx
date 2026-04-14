"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "", category: "Shirts", team: "", price: "", description: "", 
    tag: "Latest", images: "", sizes: "S, M, L, XL"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Dropping into Vault...");

    try {
      const response = await fetch("/api/gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Convert comma-separated text into real arrays for the database
          images: formData.images.split(",").map(img => img.trim()).filter(Boolean),
          sizes: formData.sizes.split(",").map(size => size.trim()).filter(Boolean),
        })
      });

      if (response.ok) {
        setStatus("✅ Gear successfully added to the Vault!");
        // Clear the form for the next product
        setFormData({ name: "", category: "Shirts", team: "", price: "", description: "", tag: "Latest", images: "", sizes: "S, M, L, XL" });
      } else {
        setStatus("❌ Error adding gear. Check console.");
      }
    } catch (err) {
      setStatus("❌ Critical failure.");
    }
  };

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 pt-24 pb-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">COMMAND CENTER</h1>
            <p className="text-purple-400 font-bold uppercase tracking-widest text-sm">Authorized Access Only</p>
          </div>
          <Link href="/shop" className="text-slate-400 hover:text-white underline underline-offset-4 font-bold text-sm">
            Go to Vault &rarr;
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0514] border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gear Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="e.g., Arsenal 03/04 Invincibles" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price ($)</label>
              <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="120.00" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none cursor-pointer">
                <option value="Shirts" className="bg-[#0a0514]">Shirts</option>
                <option value="Boots" className="bg-[#0a0514]">Boots</option>
                <option value="Retro Kits" className="bg-[#0a0514]">Retro Kits</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Team</label>
              <input type="text" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Arsenal" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tag</label>
              <select value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none cursor-pointer">
                <option value="Latest" className="bg-[#0a0514]">Latest</option>
                <option value="Trending" className="bg-[#0a0514]">Trending</option>
                <option value="Sale" className="bg-[#0a0514]">Sale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Image URLs (Comma separated)</label>
            <input required type="text" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="https://link1.png, https://link2.png" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Available Sizes (Comma separated)</label>
            <input required type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="S, M, L, XL" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-24 resize-none" placeholder="Sell the gear..."></textarea>
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            Add to Vault
          </button>
          
          {status && <p className="text-center font-bold text-emerald-400 mt-4">{status}</p>}
        </form>

      </div>
    </main>
  );
}