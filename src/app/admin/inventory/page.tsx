"use client";

import { useState, useEffect } from "react";
import { CURRENCY } from "@/lib/constants";
import { getProducts, deleteProduct, updateProduct } from "../actions";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  useEffect(() => {
    async function fetchProducts() {
      const productsData = await getProducts();
      setProducts(productsData);
      setLoadingProducts(false);
    }
    fetchProducts();
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

    // Process image entries: just trim them, let server-side actions resolve exact paths
    const formattedImages = (Array.isArray(productToEdit.images)
      ? productToEdit.images.map((img: string) => img.trim())
      : typeof productToEdit.images === "string"
        ? productToEdit.images.split(",").map((img: string) => img.trim())
        : []
    ).filter(Boolean);

    const updatedData = {
      name: productToEdit.name,
      price: parseFloat(productToEdit.price),
      category: productToEdit.category,
      team: productToEdit.team || null,
      tag: productToEdit.tag || null,
      sizes: Array.isArray(productToEdit.sizes) 
        ? productToEdit.sizes 
        : typeof productToEdit.sizes === "string" 
          ? productToEdit.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
      description: productToEdit.description || "",
      images: formattedImages
    };

    const res = await updateProduct(productToEdit.id, updatedData);
    if (res.success) {
      // Re-fetch list to capture the formatted updates
      const productsData = await getProducts();
      setProducts(productsData);
      setEditModalOpen(false);
    } else {
      alert("Failed to update product.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Product Inventory</h2>
      
      {loadingProducts ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-kora rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading vault inventory...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                <th className="p-4 font-bold hidden md:table-cell">ID</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-400 font-mono hidden md:table-cell">{product.id.slice(-6).toUpperCase()}</td>
                  <td className="p-4 font-bold text-slate-900 max-w-[200px] truncate">{product.name}</td>
                  <td className="p-4 text-slate-600">{product.category === "Boots" ? "Shoes" : product.category}</td>
                  <td className="p-4 text-emerald-600 font-black">{CURRENCY}{parseFloat(product.price).toFixed(2)}</td>
                  <td className="p-4 text-right space-x-3">
                    <button 
                      onClick={() => { setProductToEdit({ ...product }); setEditModalOpen(true); }}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-widest transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => { setProductToDelete(product.id); setDeleteModalOpen(true); }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-rose-200 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-4">Confirm Deletion</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">Are you sure you want to permanently delete this product? This action cannot be reversed.</p>
            <div className="flex space-x-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeleteProduct} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-rose-600/20">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[85vh]">
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-widest border-b border-slate-100 pb-2 shrink-0">Edit Gear</h3>
            
            <form onSubmit={handleUpdateProductSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 mb-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                  <input 
                    required type="text" 
                    value={productToEdit.name} 
                    onChange={e => setProductToEdit({...productToEdit, name: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none text-xs shadow-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price ({CURRENCY.trim()})</label>
                    <input 
                      required type="number" step="0.01" 
                      value={productToEdit.price} 
                      onChange={e => setProductToEdit({...productToEdit, price: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none text-xs font-mono shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                    <select 
                      value={productToEdit.category} 
                      onChange={e => setProductToEdit({...productToEdit, category: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none text-xs cursor-pointer shadow-sm"
                    >
                      <option value="Shirts">Shirts</option>
                      <option value="Boots">Shoes</option>
                      <option value="Retro Kits">Retro Kits</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Team</label>
                    <input 
                      type="text" 
                      value={productToEdit.team || ""} 
                      onChange={e => setProductToEdit({...productToEdit, team: e.target.value || null})} 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none text-xs shadow-sm" 
                      placeholder="None"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tag</label>
                    <select 
                      value={productToEdit.tag || ""} 
                      onChange={e => setProductToEdit({...productToEdit, tag: e.target.value || null})} 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none text-xs cursor-pointer shadow-sm"
                    >
                      <option value="">None</option>
                      <option value="Latest">Latest</option>
                      <option value="Trending">Trending</option>
                      <option value="Sale">Sale</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Image Filenames (Comma separated)</label>
                  <input 
                    required type="text" 
                    value={Array.isArray(productToEdit.images) ? productToEdit.images.map((img: string) => {
                      if (img.startsWith("/uploads/products/")) {
                        return img.substring("/uploads/products/".length);
                      }
                      // If it matches a deep path under assets, show its base name for easy editing
                      if (img.startsWith("/") && img.includes("/assets/")) {
                        const parts = img.split("/");
                        return parts[parts.length - 1];
                      }
                      return img;
                    }).join(", ") : productToEdit.images} 
                    onChange={e => setProductToEdit({...productToEdit, images: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none font-mono text-xs shadow-sm" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Local files automatically resolved recursively in assets/ and uploads/</span>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Sizes (Comma separated)</label>
                  <input 
                    required type="text" 
                    value={Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(", ") : productToEdit.sizes} 
                    onChange={e => setProductToEdit({...productToEdit, sizes: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none font-mono text-xs shadow-sm" 
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                  <textarea 
                    required 
                    value={productToEdit.description || ""} 
                    onChange={e => setProductToEdit({...productToEdit, description: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-kora outline-none h-14 resize-none text-xs shadow-sm" 
                    placeholder="Product description..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-2 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs uppercase tracking-wider">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-kora/20 text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
