"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CURRENCY } from "@/lib/constants";
import { getOrders, updateOrderFulfillment, getProducts, deleteProduct, updateProduct } from "./actions";

export default function AdminDashboard() {
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "", category: "Shirts", team: "", price: "", description: "", 
    tag: "Latest", images: "", sizes: "S, M, L, XL"
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  useEffect(() => {
    async function fetchAll() {
      const ordersData = await getOrders();
      setOrders(ordersData);
      setLoadingOrders(false);

      const productsData = await getProducts();
      setProducts(productsData);
      setLoadingProducts(false);
    }
    fetchAll();
  }, []);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const res = await deleteProduct(productToDelete);
    if (res.success) {
      setProducts(products.filter(p => p.id !== productToDelete));
      setDeleteModalOpen(false);
    } else {
      alert(res.error);
    }
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    const res = await updateProduct(productToEdit.id, productToEdit);
    if (res.success) {
      setProducts(products.map(p => p.id === productToEdit.id ? res.product : p));
      setEditModalOpen(false);
    } else {
      alert("Failed to update product.");
    }
  };

  const handleUpdateOrder = async (orderId: string, status: string, trackingId: string) => {
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status, trackingId } : o));
    
    const res = await updateOrderFulfillment(orderId, status, trackingId || null);
    if (!res?.success) {
      setOrders(originalOrders);
      alert("Failed to update order");
    }
  };

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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price ({CURRENCY.trim()})</label>
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

      <div className="max-w-6xl mx-auto mt-24">
        <h2 className="text-3xl font-black text-white tracking-tight mb-8">ORDER FULFILLMENT</h2>
        
        {loadingOrders ? (
          <p className="text-slate-400">Loading secured orders...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-[#0a0514] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 group">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order <span className="text-white">#{order.id.slice(-6)}</span></span>
                    <span className="text-sm font-black text-emerald-400">{CURRENCY}{order.total}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-6 truncate">{order.user?.email || order.userId}</p>
                  
                  <div className="space-y-4 mb-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-purple-400 transition-colors">Status</label>
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateOrder(order.id, e.target.value, order.trackingId || "")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none cursor-pointer font-bold transition-all"
                      >
                        <option value="PROCESSING" className="bg-[#0a0514]">PROCESSING</option>
                        <option value="SHIPPED" className="bg-[#0a0514]">SHIPPED</option>
                        <option value="DELIVERED" className="bg-[#0a0514]">DELIVERED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-purple-400 transition-colors">Tracking ID</label>
                      <input 
                        type="text"
                        value={order.trackingId || ""}
                        onChange={(e) => {
                          const newTrackingId = e.target.value;
                          setOrders(orders.map(o => o.id === order.id ? { ...o, trackingId: newTrackingId } : o));
                        }}
                        onBlur={(e) => handleUpdateOrder(order.id, order.status, e.target.value)}
                        placeholder="Enter courier tracking #"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">No recent orders in the vault.</p>}
          </div>
        )}
      </div>

      {/* PRODUCT INVENTORY DATA TABLE */}
      <div className="max-w-6xl mx-auto mt-24 pb-12">
        <h2 className="text-3xl font-black text-white tracking-tight mb-8">PRODUCT INVENTORY</h2>
        
        {loadingProducts ? (
          <p className="text-slate-400">Loading vault inventory...</p>
        ) : (
          <div className="bg-[#0a0514] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-widest text-slate-400">
                  <th className="p-4 font-bold hidden md:table-cell">ID</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-500 font-mono hidden md:table-cell">{product.id.slice(-6)}</td>
                    <td className="p-4 font-bold text-white max-w-[200px] truncate">{product.name}</td>
                    <td className="p-4 text-slate-300">{product.category}</td>
                    <td className="p-4 text-emerald-400 font-black">{CURRENCY}{product.price}</td>
                    <td className="p-4 text-right space-x-3">
                      <button 
                        onClick={() => { setProductToEdit(product); setEditModalOpen(true); }}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { setProductToDelete(product.id); setDeleteModalOpen(true); }}
                        className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold tracking-widest uppercase">The vault is currently empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0514] border border-red-500/30 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4">CONFIRM DELETION</h3>
            <p className="text-slate-400 mb-8 text-sm">Are you sure you want to permanently delete this product? This action cannot be reversed.</p>
            <div className="flex space-x-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeleteProduct} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0a0514] border border-purple-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl my-8">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">Edit Gear</h3>
            <form onSubmit={handleUpdateProductSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input 
                  required type="text" 
                  value={productToEdit.name} 
                  onChange={e => setProductToEdit({...productToEdit, name: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price ($)</label>
                <input 
                  required type="number" step="0.01" 
                  value={productToEdit.price} 
                  onChange={e => setProductToEdit({...productToEdit, price: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Image URLs (Comma separated)</label>
                <input 
                  required type="text" 
                  value={Array.isArray(productToEdit.images) ? productToEdit.images.join(", ") : productToEdit.images} 
                  onChange={e => setProductToEdit({...productToEdit, images: e.target.value.split(",").map((i: string) => i.trim()).filter(Boolean)})} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}