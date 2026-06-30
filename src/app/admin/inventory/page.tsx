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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

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

    // Process image entries
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
      images: formattedImages,
      stock: parseInt(productToEdit.stock) || 0,
      isWorldCup: !!productToEdit.isWorldCup
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.team && product.team.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === "All" || product.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto font-sans">
      
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight self-start md:self-center">Product Inventory</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search gear..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 placeholder-slate-400 outline-none focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] transition-all shadow-2xs sm:w-60"
          />
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-[#6B00FF] cursor-pointer shadow-2xs transition-all"
          >
            <option value="All">All Categories</option>
            <option value="Shirts">Shirts</option>
            <option value="Boots">Shoes / Boots</option>
            <option value="Retro Kits">Retro Kits</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>
      
      {loadingProducts ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-kora rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading vault inventory...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="p-4 font-bold">Details</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Stock Status</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredProducts.map((product) => {
                  const stockCount = product.stock !== undefined ? product.stock : 10;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-50 border border-slate-200/50 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[9px] text-slate-300 font-black">N/A</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block">ID: {product.id.slice(-6).toUpperCase()}</span>
                            <span className="font-extrabold text-slate-900 block max-w-[240px] truncate uppercase">{product.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-bold">
                        {product.category === "Boots" ? "Shoes" : product.category === "Flags" ? "Accessories" : product.category}
                      </td>

                      {/* Stock indicator badge */}
                      <td className="p-4">
                        {stockCount === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Out of stock
                          </span>
                        ) : stockCount <= 3 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low stock ({stockCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock ({stockCount})
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-900 font-black">{CURRENCY}{parseFloat(product.price).toFixed(2)}</td>

                      <td className="p-4 text-right space-x-3">
                        <button 
                          onClick={() => { setProductToEdit({ ...product }); setEditModalOpen(true); }}
                          className="text-xs font-black text-[#6B00FF] hover:text-purple-700 uppercase tracking-widest transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { setProductToDelete(product.id); setDeleteModalOpen(true); }}
                          className="text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-bold tracking-widest uppercase text-xs">No matching products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
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

      {/* Edit Form Drawer Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-widest border-b border-slate-100 pb-3 shrink-0">Edit Gear</h3>
            
            <form onSubmit={handleUpdateProductSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-4 overflow-y-auto pr-2 flex-1 my-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                  <input 
                    required type="text" 
                    value={productToEdit.name} 
                    onChange={e => setProductToEdit({...productToEdit, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-xs shadow-2xs transition-all font-bold" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price ({CURRENCY.trim()})</label>
                    <input 
                      required type="number" step="0.01" 
                      value={productToEdit.price} 
                      onChange={e => setProductToEdit({...productToEdit, price: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-xs font-mono shadow-2xs transition-all font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select 
                      value={productToEdit.category} 
                      onChange={e => setProductToEdit({...productToEdit, category: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] outline-none text-xs cursor-pointer shadow-2xs transition-all font-bold"
                    >
                      <option value="Shirts">Shirts</option>
                      <option value="Boots">Shoes / Boots</option>
                      <option value="Retro Kits">Retro Kits</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Stock Level</label>
                    <input 
                      required type="number" min="0"
                      value={productToEdit.stock !== undefined ? productToEdit.stock : 10} 
                      onChange={e => setProductToEdit({...productToEdit, stock: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-xs shadow-2xs transition-all font-bold" 
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl p-3 w-full select-none transition-colors h-[42px]">
                      <input 
                        type="checkbox" 
                        checked={!!productToEdit.isWorldCup} 
                        onChange={e => setProductToEdit({...productToEdit, isWorldCup: e.target.checked})} 
                        className="rounded text-[#6B00FF] focus:ring-[#6B00FF] h-4 w-4 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">World Cup Campaign</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Team</label>
                    <input 
                      type="text" 
                      value={productToEdit.team || ""} 
                      onChange={e => setProductToEdit({...productToEdit, team: e.target.value || null})} 
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none text-xs shadow-2xs transition-all font-bold" 
                      placeholder="None"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tag</label>
                    <select 
                      value={productToEdit.tag || ""} 
                      onChange={e => setProductToEdit({...productToEdit, tag: e.target.value || null})} 
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] outline-none text-xs cursor-pointer shadow-2xs transition-all font-bold"
                    >
                      <option value="">None</option>
                      <option value="Latest">Latest</option>
                      <option value="Trending">Trending</option>
                      <option value="Sale">Sale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image Filenames (Comma separated)</label>
                  <input 
                    required type="text" 
                    value={Array.isArray(productToEdit.images) ? productToEdit.images.map((img: string) => {
                      if (img.startsWith("/uploads/products/")) {
                        return img.substring("/uploads/products/".length);
                      }
                      if (img.startsWith("/") && img.includes("/assets/")) {
                        const parts = img.split("/");
                        return parts[parts.length - 1];
                      }
                      return img;
                    }).join(", ") : productToEdit.images} 
                    onChange={e => setProductToEdit({...productToEdit, images: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none font-mono text-xs shadow-2xs transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Available Sizes (Comma separated)</label>
                  <input 
                    required type="text" 
                    value={Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(", ") : productToEdit.sizes} 
                    onChange={e => setProductToEdit({...productToEdit, sizes: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none font-mono text-xs shadow-2xs transition-all" 
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    required 
                    value={productToEdit.description || ""} 
                    onChange={e => setProductToEdit({...productToEdit, description: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-slate-900 focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] outline-none h-20 resize-none text-xs shadow-2xs transition-all" 
                    placeholder="Product description..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs uppercase tracking-wider">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 hover:bg-[#6B00FF] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#6B00FF]/10 text-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
