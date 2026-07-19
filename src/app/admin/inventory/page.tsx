"use client";

import { useState, useEffect } from "react";
import { CURRENCY, PRESET_PLAYERS } from "@/lib/constants";
import { getProducts, deleteProduct, updateProduct } from "../actions";
import ImageUploader from "@/components/ImageUploader";

const getPresetPlayersForProduct = (productName: string) => {
  const normalized = productName.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
  return PRESET_PLAYERS[normalized] || [];
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  const openEditModal = (product: any) => {
    const sizeStocksMap: Record<string, number> = {};
    if (product.sizeStocks) {
      product.sizeStocks.forEach((s: any) => {
        sizeStocksMap[s.size] = s.quantity;
      });
    }
    const sizes = Array.isArray(product.sizes) 
      ? product.sizes 
      : typeof product.sizes === "string" 
        ? product.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    sizes.forEach((size: string) => {
      if (sizeStocksMap[size] === undefined) {
        sizeStocksMap[size] = product.stock;
      }
    });

    // Load playerStocks
    const playerStocksList: Array<{ name: string; number: string; stock: number }> = [];
    if (product.playerStocks && product.playerStocks.length > 0) {
      product.playerStocks.forEach((p: any) => {
        playerStocksList.push({
          name: p.playerName,
          number: p.playerNumber,
          stock: p.quantity
        });
      });
    } else {
      const presets = getPresetPlayersForProduct(product.name);
      presets.forEach((p: any) => {
        playerStocksList.push({
          name: p.name,
          number: p.number,
          stock: 10
        });
      });
    }

    setProductToEdit({
      ...product,
      sizeStocksMap,
      playerStocks: playerStocksList,
      isSale: product.originalPrice !== null && product.originalPrice !== undefined && product.originalPrice !== ""
    });
    setEditModalOpen(true);
  };

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

    const currentSizes = Array.isArray(productToEdit.sizes) 
      ? productToEdit.sizes 
      : typeof productToEdit.sizes === "string" 
        ? productToEdit.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    const sizeStocks: Record<string, number> = {};
    currentSizes.forEach((size: string) => {
      sizeStocks[size] = productToEdit.sizeStocksMap?.[size] !== undefined 
        ? parseInt(productToEdit.sizeStocksMap[size] as any) || 0 
        : 10;
    });

    const updatedData = {
      name: productToEdit.name,
      price: parseFloat(productToEdit.price) || 0,
      category: productToEdit.category,
      team: productToEdit.team || null,
      tag: productToEdit.tag || null,
      sizes: currentSizes,
      description: productToEdit.description || "",
      images: formattedImages,
      sizeStocks,
      playerStocks: productToEdit.playerStocks || [],
      isWorldCup: !!productToEdit.isWorldCup,
      originalPrice: productToEdit.isSale && productToEdit.originalPrice
        ? (parseFloat(productToEdit.originalPrice) || null)
        : null,
      brand: productToEdit.brand || null,
      gender: productToEdit.gender || null,
      subCategory: productToEdit.subCategory || null,
      soleplate: productToEdit.soleplate || null,
      colorway: productToEdit.colorway || null
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

  // Stock badge renderer (reused for both table and card views)
  const StockBadge = ({ stockCount }: { stockCount: number }) => {
    if (stockCount === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Out of stock
        </span>
      );
    } else if (stockCount <= 3) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Low stock ({stockCount})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        In Stock ({stockCount})
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between sm:items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Product Inventory</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search gear..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 transition-all sm:w-60"
              />
            </div>
            <select 
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-kora cursor-pointer transition-all"
            >
              <option value="All">All Categories</option>
              <option value="Shirts">Shirts</option>
              <option value="Boots">Shoes / Boots</option>
              <option value="Retro Kits">Retro Kits</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>
      </div>
      
      {loadingProducts ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-kora animate-spin" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading vault inventory...</p>
        </div>
      ) : (
        <>
          {/* ═══════ DESKTOP TABLE VIEW (md+) ═══════ */}
          <div className="hidden md:block bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="p-4 font-bold">Details</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Stock Status</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
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
                          <StockBadge stockCount={stockCount} />
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-[240px]">
                            {product.sizeStocks && product.sizeStocks.length > 0 ? (
                              product.sizeStocks.map((s: any) => (
                                <span key={s.id} className="bg-slate-50 border border-slate-200/50 rounded-lg px-1.5 py-0.5 font-mono text-[9px] text-slate-500 font-bold">
                                  {s.size}: <span className={s.quantity === 0 ? "text-rose-500 font-extrabold" : "text-slate-800 font-black"}>{s.quantity}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">No per-size stock</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-slate-900 font-black">{CURRENCY}{parseFloat(product.price).toFixed(2)}</td>

                        <td className="p-4 text-right space-x-3">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="text-xs font-black text-kora hover:text-purple-700 uppercase tracking-widest transition-colors"
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

          {/* ═══════ MOBILE CARD VIEW (<md) ═══════ */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => {
              const stockCount = product.stock !== undefined ? product.stock : 10;
              return (
                <div key={product.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-3.5">
                    {/* Product image */}
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200/50 rounded-xl overflow-hidden flex items-center justify-center p-2 shrink-0">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] text-slate-300 font-black">N/A</span>
                      )}
                    </div>
                    
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 block truncate uppercase text-sm">{product.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">ID: {product.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 shrink-0">{CURRENCY}{parseFloat(product.price).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
                          {product.category === "Boots" ? "Shoes" : product.category === "Flags" ? "Accessories" : product.category}
                        </span>
                        <StockBadge stockCount={stockCount} />
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {product.sizeStocks && product.sizeStocks.length > 0 ? (
                          product.sizeStocks.map((s: any) => (
                            <span key={s.id} className="bg-slate-50 border border-slate-200/50 rounded-lg px-1.5 py-0.5 font-mono text-[9px] text-slate-500 font-bold">
                              {s.size}: <span className={s.quantity === 0 ? "text-rose-500 font-extrabold" : "text-slate-800 font-black"}>{s.quantity}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">No per-size stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="flex-1 py-2.5 bg-kora/5 hover:bg-kora/10 text-kora font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center border border-kora/10"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => { setProductToDelete(product.id); setDeleteModalOpen(true); }}
                      className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100/60 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center border border-rose-200/60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-2xl">📭</div>
                <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">No matching products found.</p>
                <p className="text-slate-300 text-xs mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center mx-auto mb-5 text-2xl">🗑️</div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Confirm Deletion</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed text-center">Are you sure you want to permanently delete this product? This action cannot be reversed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm">Cancel</button>
              <button onClick={handleDeleteProduct} className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-rose-600/20 text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-fade-in-up">
            
            {/* Modal header with gradient accent */}
            <div className="relative px-5 sm:px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kora via-purple-500 to-pink-500 rounded-t-3xl" />
              {/* Mobile drag handle */}
              <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Gear</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Update product details</p>
            </div>
            
            <form onSubmit={handleUpdateProductSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-4 overflow-y-auto px-5 sm:px-6 flex-1 my-4 scrollbar-hide">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                  <input 
                    required type="text" 
                    value={productToEdit.name} 
                    onChange={e => setProductToEdit({...productToEdit, name: e.target.value})} 
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-bold transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price ({CURRENCY.trim()})</label>
                    <input 
                      required type="number" step="0.01" 
                      value={productToEdit.price} 
                      onChange={e => setProductToEdit({...productToEdit, price: e.target.value})} 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-mono font-bold transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select 
                      value={productToEdit.category} 
                      onChange={e => setProductToEdit({...productToEdit, category: e.target.value})} 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora outline-none text-xs cursor-pointer font-bold transition-all"
                    >
                      <option value="Shirts">Shirts</option>
                      <option value="Boots">Shoes / Boots</option>
                      <option value="Retro Kits">Retro Kits</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                {/* Sale Settings Segment */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={!!productToEdit.isSale} 
                      onChange={e => {
                        const checked = e.target.checked;
                        setProductToEdit({
                          ...productToEdit,
                          isSale: checked,
                          originalPrice: checked ? (productToEdit.originalPrice || productToEdit.price || "75") : null,
                          tag: checked ? "On Sale" : (productToEdit.tag === "On Sale" ? null : productToEdit.tag)
                        });
                      }}
                      className="rounded text-kora focus:ring-kora h-4 w-4 border-slate-300"
                    />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Product is On Sale</span>
                  </label>

                  {productToEdit.isSale && (
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200/60 pt-3.5 animate-fade-in space-y-0.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Striked Price ({CURRENCY.trim()})</label>
                        <input 
                          required type="number" step="0.01" 
                          value={productToEdit.originalPrice || ""} 
                          onChange={e => setProductToEdit({...productToEdit, originalPrice: e.target.value})} 
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-mono font-bold transition-all" 
                          placeholder="e.g. 75"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">New Sale Price ({CURRENCY.trim()})</label>
                        <input 
                          required type="number" step="0.01" 
                          value={productToEdit.price || ""} 
                          onChange={e => setProductToEdit({...productToEdit, price: e.target.value})} 
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-mono font-bold transition-all" 
                          placeholder="e.g. 49"
                        />
                      </div>
                      <div className="col-span-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={productToEdit.tag === "On Sale"} 
                            onChange={e => setProductToEdit({...productToEdit, tag: e.target.checked ? "On Sale" : null})} 
                            className="rounded text-kora focus:ring-kora h-4 w-4 border-slate-300"
                          />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Apply "On Sale" tag badge</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Per-Size Stock Editor Grid */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Stock Per Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Array.isArray(productToEdit.sizes)
                      ? productToEdit.sizes
                      : typeof productToEdit.sizes === "string"
                        ? productToEdit.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : []
                    ).map((size: string) => {
                      const qty = productToEdit.sizeStocksMap?.[size] !== undefined ? productToEdit.sizeStocksMap[size] : 0;
                      return (
                        <div key={size} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
                          <span className="text-[11px] font-black text-slate-900 uppercase ml-1 shrink-0">{size}</span>
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setProductToEdit({
                                ...productToEdit,
                                sizeStocksMap: {
                                  ...productToEdit.sizeStocksMap,
                                  [size]: val
                                }
                              });
                            }}
                            className="w-14 bg-slate-50 border border-slate-200 rounded-lg p-1 text-center text-xs font-mono font-bold focus:bg-white focus:border-kora outline-none shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Player Name Stocks Editor */}
                {(productToEdit.category === "Shirts" || productToEdit.category === "Retro Kits") && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Player Name Stocks</label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentPlayers = productToEdit.playerStocks || [];
                          setProductToEdit({
                            ...productToEdit,
                            playerStocks: [...currentPlayers, { name: "", number: "", stock: 10 }]
                          });
                        }}
                        className="py-1 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors border border-purple-200/50 flex items-center gap-1 cursor-pointer"
                      >
                        ➕ Add Player
                      </button>
                    </div>

                    {(!productToEdit.playerStocks || productToEdit.playerStocks.length === 0) ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">No player prints configured. Click "Add Player" to add custom prints.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {productToEdit.playerStocks.map((player: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
                            <div className="flex-1">
                              <input
                                required
                                type="text"
                                placeholder="NAME"
                                value={player.name}
                                onChange={(e) => {
                                  const newList = [...productToEdit.playerStocks];
                                  newList[idx].name = e.target.value.toUpperCase();
                                  setProductToEdit({ ...productToEdit, playerStocks: newList });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="w-14">
                                <input
                                  required
                                  type="text"
                                  placeholder="NO."
                                  value={player.number}
                                  onChange={(e) => {
                                    const newList = [...productToEdit.playerStocks];
                                    newList[idx].number = e.target.value.replace(/[^0-9]/g, "");
                                    setProductToEdit({ ...productToEdit, playerStocks: newList });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <div className="w-16">
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  placeholder="STOCK"
                                  value={player.stock}
                                  onChange={(e) => {
                                    const newList = [...productToEdit.playerStocks];
                                    newList[idx].stock = parseInt(e.target.value) || 0;
                                    setProductToEdit({ ...productToEdit, playerStocks: newList });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-center text-slate-800 focus:outline-none focus:border-purple-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newList = productToEdit.playerStocks.filter((_: any, i: number) => i !== idx);
                                  setProductToEdit({ ...productToEdit, playerStocks: newList });
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/40 transition-colors cursor-pointer text-xs font-bold h-[30px] flex items-center justify-center"
                                title="Remove Player"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200 rounded-xl p-3 w-full select-none transition-colors h-[42px]">
                      <input 
                        type="checkbox" 
                        checked={!!productToEdit.isWorldCup} 
                        onChange={e => setProductToEdit({...productToEdit, isWorldCup: e.target.checked})} 
                        className="rounded text-[#6B00FF] focus:ring-[#6B00FF] h-4 w-4 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">World Cup</span>
                    </label>
                  </div>
                </div>

                {/* Global properties: Gender and Tag */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Gender</label>
                    <select 
                      value={productToEdit.gender || "Unisex"} 
                      onChange={e => setProductToEdit({...productToEdit, gender: e.target.value})} 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora outline-none text-xs cursor-pointer font-bold transition-all"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Display Tag</label>
                    <select 
                      value={productToEdit.tag || ""} 
                      onChange={e => setProductToEdit({...productToEdit, tag: e.target.value || null})} 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora outline-none text-xs cursor-pointer font-bold transition-all"
                    >
                      <option value="">None</option>
                      <option value="Latest">Latest</option>
                      <option value="Trending">Trending</option>
                      <option value="Sale">Sale</option>
                    </select>
                  </div>
                </div>

                {/* Category specific attributes */}
                {(productToEdit.category === "Shirts" || productToEdit.category === "Retro Kits") && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Club / National Team</label>
                    <input 
                      type="text" 
                      value={productToEdit.team || ""} 
                      onChange={e => setProductToEdit({...productToEdit, team: e.target.value || null})} 
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-bold transition-all" 
                      placeholder="e.g., Real Madrid"
                    />
                  </div>
                )}

                {productToEdit.category === "Boots" && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Brand</label>
                      <input 
                        type="text" 
                        value={productToEdit.brand || ""} 
                        onChange={e => setProductToEdit({...productToEdit, brand: e.target.value || null})} 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-bold transition-all" 
                        placeholder="e.g., Nike"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Soleplate</label>
                      <select 
                        value={productToEdit.soleplate || "FG"} 
                        onChange={e => setProductToEdit({...productToEdit, soleplate: e.target.value})} 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora outline-none text-xs cursor-pointer font-bold transition-all"
                      >
                        <option value="FG">FG</option>
                        <option value="SG">SG</option>
                        <option value="AG">AG</option>
                        <option value="TF">TF</option>
                        <option value="IN">IN</option>
                        <option value="Casual">Casual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Colorway</label>
                      <input 
                        type="text" 
                        value={productToEdit.colorway || ""} 
                        onChange={e => setProductToEdit({...productToEdit, colorway: e.target.value || null})} 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-bold transition-all" 
                        placeholder="Colorway"
                      />
                    </div>
                  </div>
                )}

                {(productToEdit.category === "Accessories" || productToEdit.category === "Flags") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Sub-Category</label>
                      <select 
                        value={productToEdit.subCategory || "Socks"} 
                        onChange={e => setProductToEdit({...productToEdit, subCategory: e.target.value})} 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora outline-none text-xs cursor-pointer font-bold transition-all"
                      >
                        <option value="Socks">Socks</option>
                        <option value="Flags">Flags</option>
                        <option value="Bags">Bags</option>
                        <option value="Souvenirs">Souvenirs</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Brand (Optional)</label>
                      <input 
                        type="text" 
                        value={productToEdit.brand || ""} 
                        onChange={e => setProductToEdit({...productToEdit, brand: e.target.value || null})} 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-bold transition-all" 
                        placeholder="None"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Club / Team (Optional)</label>
                      <input 
                        type="text" 
                        value={productToEdit.team || ""} 
                        onChange={e => setProductToEdit({...productToEdit, team: e.target.value || null})} 
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none text-xs font-bold transition-all" 
                        placeholder="None"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Product Images</label>
                  <ImageUploader
                    images={Array.isArray(productToEdit.images) ? productToEdit.images : []}
                    onChange={uploadedUrls => setProductToEdit({ ...productToEdit, images: uploadedUrls })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Available Sizes (Comma separated)</label>
                  <input 
                    required type="text" 
                    value={Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(", ") : productToEdit.sizes} 
                    onChange={e => setProductToEdit({...productToEdit, sizes: e.target.value})} 
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none font-mono text-xs transition-all" 
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea 
                    required 
                    value={productToEdit.description || ""} 
                    onChange={e => setProductToEdit({...productToEdit, description: e.target.value})} 
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none h-20 resize-none text-xs transition-all" 
                    placeholder="Product description..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/30 shrink-0 rounded-b-3xl">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-xs uppercase tracking-wider">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-kora to-purple-600 hover:from-purple-700 hover:to-kora text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-kora/20 text-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
