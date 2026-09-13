"use client";

import { useState, useEffect } from "react";
import { getFeaturedSectionsAdminData, saveFeaturedSectionsAdmin } from "../actions";
import { CURRENCY } from "@/lib/constants";
import { FaSearch, FaTimes, FaCheck, FaPlus, FaExchangeAlt, FaTrashAlt } from "react-icons/fa";

type SectionId = "club" | "national" | "shoes" | "gear";

interface ProductSummary {
  id: string;
  name: string;
  category: string;
  team: string | null;
  price: string;
  tag: string | null;
  images: string[];
  stock: number;
}

interface FeaturedData {
  config: {
    club: string[];
    national: string[];
    shoes: string[];
    gear: string[];
  };
  categoryProducts: {
    club: ProductSummary[];
    national: ProductSummary[];
    shoes: ProductSummary[];
    gear: ProductSummary[];
  };
}

const SECTIONS: { id: SectionId; label: string; desc: string; icon: string }[] = [
  { id: "club", label: "Club Jerseys", desc: "Top league match shirts", icon: "⚽" },
  { id: "national", label: "National Jerseys", desc: "World Cup & international kits", icon: "🌍" },
  { id: "shoes", label: "Shoes", desc: "Firm ground boots & casual footwear", icon: "👟" },
  { id: "gear", label: "Streetwear & Gear", desc: "Accessories, flags & training gear", icon: "🎒" },
];

export default function FeaturedSectionsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<FeaturedData | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("club");
  const [selectedSlots, setSelectedSlots] = useState<Record<SectionId, (string | null)[]>>({
    club: [null, null, null, null],
    national: [null, null, null, null],
    shoes: [null, null, null, null],
    gear: [null, null, null, null],
  });

  // Modal for selecting a product for a slot
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFeaturedSectionsAdminData();
      setData(res);

      // Pad slot arrays to exactly 4 items
      const padToFour = (arr?: string[]) => {
        const safe = Array.isArray(arr) ? [...arr] : [];
        while (safe.length < 4) safe.push(null as any);
        return safe.slice(0, 4);
      };

      setSelectedSlots({
        club: padToFour(res.config.club),
        national: padToFour(res.config.national),
        shoes: padToFour(res.config.shoes),
        gear: padToFour(res.config.gear),
      });
    } catch (err) {
      console.error("Failed to load featured data:", err);
      setStatusMessage({ type: "error", text: "Failed to load featured sections data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const configToSave = {
        club: selectedSlots.club.filter(Boolean) as string[],
        national: selectedSlots.national.filter(Boolean) as string[],
        shoes: selectedSlots.shoes.filter(Boolean) as string[],
        gear: selectedSlots.gear.filter(Boolean) as string[],
      };

      const res = await saveFeaturedSectionsAdmin(configToSave);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Featured sections saved and storefront updated successfully!" });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ type: "error", text: "Failed to save featured sections." });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Error saving featured sections." });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignProduct = (productId: string) => {
    if (pickerSlotIndex === null) return;
    setSelectedSlots((prev) => {
      const currentArr = [...prev[activeSection]];
      currentArr[pickerSlotIndex] = productId;
      return {
        ...prev,
        [activeSection]: currentArr,
      };
    });
    setPickerSlotIndex(null);
    setSearchQuery("");
  };

  const handleClearSlot = (slotIdx: number) => {
    setSelectedSlots((prev) => {
      const currentArr = [...prev[activeSection]];
      currentArr[slotIdx] = null;
      return {
        ...prev,
        [activeSection]: currentArr,
      };
    });
  };

  // Find product object by ID across all categories
  const getProductById = (id: string | null): ProductSummary | null => {
    if (!id || !data) return null;
    const allProducts = [
      ...data.categoryProducts.club,
      ...data.categoryProducts.national,
      ...data.categoryProducts.shoes,
      ...data.categoryProducts.gear,
    ];
    return allProducts.find((p) => p.id === id) || null;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center">
        <div className="w-10 h-10 border-4 border-kora border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
          Loading Featured Sections...
        </p>
      </div>
    );
  }

  const currentCategoryProducts = data?.categoryProducts[activeSection] || [];
  const filteredCategoryProducts = currentCategoryProducts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || (p.team && p.team.toLowerCase().includes(q));
  });

  return (
    <div className="flex-1 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⭐</span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Homepage Featured Sections
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Curate the exact 4 products displayed on the homepage for each section. Any empty slot will automatically fall back to the top items in that category.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-kora hover:bg-purple-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-kora/25 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-bold border flex items-center justify-between ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)}>
              <FaTimes className="text-xs opacity-60 hover:opacity-100" />
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const assignedCount = selectedSlots[sec.id].filter(Boolean).length;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`p-4 rounded-2xl border text-start transition-all ${
                isActive
                  ? "bg-kora text-white border-kora shadow-md shadow-kora/20 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-kora/50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl">{sec.icon}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {assignedCount}/4 Assigned
                </span>
              </div>
              <h3 className="font-bold text-sm leading-tight">{sec.label}</h3>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${isActive ? "text-purple-100" : "text-slate-400"}`}>
                {sec.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* 4 Slots Grid for Active Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>{SECTIONS.find((s) => s.id === activeSection)?.label}</span>
              <span className="text-xs text-slate-400 font-normal">
                (4 Slot Layout)
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click &quot;Select Product&quot; to pick an existing item from your catalog for each slot.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedSlots((prev) => ({
                ...prev,
                [activeSection]: [null, null, null, null],
              }));
            }}
            className="text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors flex items-center gap-1"
          >
            <FaTrashAlt className="text-[10px]" />
            <span>Clear All 4 Slots</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((slotIdx) => {
            const assignedId = selectedSlots[activeSection][slotIdx];
            const product = getProductById(assignedId);

            return (
              <div
                key={slotIdx}
                className={`relative rounded-2xl border flex flex-col justify-between overflow-hidden transition-all ${
                  product
                    ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm"
                    : "border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-6 flex flex-col items-center justify-center min-h-[280px]"
                }`}
              >
                {/* Slot Badge */}
                <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Slot {slotIdx + 1}
                </div>

                {product ? (
                  <>
                    {/* Product Image */}
                    <div className="relative w-full h-44 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No Image</span>
                      )}
                      {product.tag && (
                        <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-white shadow-sm">
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-kora uppercase tracking-wider">
                          {product.category} {product.team ? `• ${product.team}` : ""}
                        </p>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                          {product.name}
                        </h4>
                        <p className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">
                          {CURRENCY} {product.price}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => setPickerSlotIndex(slotIdx)}
                          className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <FaExchangeAlt className="text-[10px]" />
                          <span>Change</span>
                        </button>
                        <button
                          onClick={() => handleClearSlot(slotIdx)}
                          title="Clear slot (revert to auto-fallback)"
                          className="px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl py-2 text-[11px] font-bold transition-all"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-kora flex items-center justify-center text-lg mb-3">
                      <FaPlus />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                      Auto-filled Slot {slotIdx + 1}
                    </p>
                    <p className="text-[10px] text-slate-400 text-center mt-1 mb-4">
                      Shows newest product by default. Click below to pin a specific item.
                    </p>
                    <button
                      onClick={() => setPickerSlotIndex(slotIdx)}
                      className="bg-kora hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-kora/20"
                    >
                      <FaPlus className="text-[10px]" />
                      <span>Select Product</span>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Picker Modal */}
      {pickerSlotIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Assign Product to Slot {pickerSlotIndex + 1}
                </h3>
                <p className="text-xs text-slate-500">
                  Select a product from {SECTIONS.find((s) => s.id === activeSection)?.label}
                </p>
              </div>
              <button
                onClick={() => {
                  setPickerSlotIndex(null);
                  setSearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title or team..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-kora"
                  autoFocus
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCategoryProducts.length > 0 ? (
                filteredCategoryProducts.map((p) => {
                  const isCurrentlyAssigned = selectedSlots[activeSection].includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {p.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {p.team || p.category} • {CURRENCY} {p.price}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignProduct(p.id)}
                        className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCurrentlyAssigned
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            : "bg-kora hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isCurrentlyAssigned ? "Assigned" : "Select"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No products found matching &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
