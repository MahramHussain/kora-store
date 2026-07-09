"use client";

import { useState } from "react";
import { CURRENCY } from "@/lib/constants";
import ImageUploader from "@/components/ImageUploader";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"shirts" | "shoes" | "accessories">("shirts");

  // Shared form inputs
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Latest");
  const [images, setImages] = useState<string[]>([]);
  const [isWorldCup, setIsWorldCup] = useState(false);

  // Tab 1: Shirts Specifics
  const [shirtCategory, setShirtCategory] = useState("Shirts"); // "Shirts" or "Retro Kits"
  const [team, setTeam] = useState("");
  const [shirtSizes, setShirtSizes] = useState<Record<string, { checked: boolean; stock: number }>>({
    "S": { checked: true, stock: 10 },
    "M": { checked: true, stock: 10 },
    "L": { checked: true, stock: 10 },
    "XL": { checked: true, stock: 10 },
    "XXL": { checked: false, stock: 10 }
  });

  // Tab 2: Shoes Specifics
  const [shoeSizes, setShoeSizes] = useState<Record<string, { checked: boolean; stock: number }>>({
    "38": { checked: false, stock: 10 },
    "39": { checked: true, stock: 10 },
    "40": { checked: true, stock: 10 },
    "41": { checked: true, stock: 10 },
    "42": { checked: true, stock: 10 },
    "43": { checked: true, stock: 10 },
    "44": { checked: true, stock: 10 },
    "45": { checked: false, stock: 10 }
  });

  // Tab 3: Accessories Specifics
  const [accessorySizes, setAccessorySizes] = useState<Record<string, { checked: boolean; stock: number }>>({
    "One Size": { checked: true, stock: 10 }
  });

  const getTabTheme = () => {
    switch (activeTab) {
      case "shirts":
        return {
          textColor: "text-kora",
          bgColor: "bg-kora",
          borderColor: "border-kora/20",
          btnGradient: "from-kora to-purple-600 hover:from-purple-700 hover:to-kora shadow-kora/25",
          iconColorBg: "bg-kora/10",
          focusRing: "focus:border-kora focus:ring-kora/10",
          accentBar: "from-kora via-purple-500 to-pink-500",
          badgeColor: "bg-purple-50 text-kora border-purple-100"
        };
      case "shoes":
        return {
          textColor: "text-blue-600",
          bgColor: "bg-blue-600",
          borderColor: "border-blue-200",
          btnGradient: "from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-600 shadow-blue-600/25",
          iconColorBg: "bg-blue-50",
          focusRing: "focus:border-blue-500 focus:ring-blue-500/10",
          accentBar: "from-blue-500 via-indigo-500 to-purple-500",
          badgeColor: "bg-blue-50 text-blue-600 border-blue-100"
        };
      case "accessories":
        return {
          textColor: "text-amber-600",
          bgColor: "bg-amber-600",
          borderColor: "border-amber-200",
          btnGradient: "from-amber-600 to-yellow-600 hover:from-yellow-700 hover:to-amber-600 shadow-amber-600/25",
          iconColorBg: "bg-amber-50",
          focusRing: "focus:border-amber-500 focus:ring-amber-500/10",
          accentBar: "from-amber-500 via-yellow-500 to-orange-500",
          badgeColor: "bg-amber-50 text-amber-600 border-amber-100"
        };
    }
  };

  const theme = getTabTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setStatus("❌ Please upload at least one image.");
      return;
    }

    const activeSizesMap =
      activeTab === "shirts" ? shirtSizes :
      activeTab === "shoes" ? shoeSizes :
      accessorySizes;

    const selectedSizes = Object.entries(activeSizesMap)
      .filter(([_, data]) => data.checked)
      .map(([size]) => size);

    if (selectedSizes.length === 0) {
      setStatus("❌ Please select at least one size.");
      return;
    }

    const sizeStocks: Record<string, number> = {};
    selectedSizes.forEach(size => {
      sizeStocks[size] = activeSizesMap[size].stock;
    });

    const category =
      activeTab === "shirts" ? shirtCategory :
      activeTab === "shoes" ? "Boots" :
      "Accessories";

    setStatus("Dropping into Vault...");

    try {
      const response = await fetch("/api/gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          team: activeTab === "shirts" ? team : "",
          price: parseFloat(price) || 0,
          description,
          tag,
          images,
          sizes: selectedSizes,
          sizeStocks,
          isWorldCup
        })
      });

      if (response.ok) {
        setStatus("✅ Gear successfully added to the Vault!");
        // Reset state
        setName("");
        setPrice("");
        setTeam("");
        setDescription("");
        setTag("Latest");
        setImages([]);
        setIsWorldCup(false);
        setShirtSizes({
          "S": { checked: true, stock: 10 },
          "M": { checked: true, stock: 10 },
          "L": { checked: true, stock: 10 },
          "XL": { checked: true, stock: 10 },
          "XXL": { checked: false, stock: 10 }
        });
        setShoeSizes({
          "38": { checked: false, stock: 10 },
          "39": { checked: true, stock: 10 },
          "40": { checked: true, stock: 10 },
          "41": { checked: true, stock: 10 },
          "42": { checked: true, stock: 10 },
          "43": { checked: true, stock: 10 },
          "44": { checked: true, stock: 10 },
          "45": { checked: false, stock: 10 }
        });
        setAccessorySizes({
          "One Size": { checked: true, stock: 10 }
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
      {/* Modern tab selector */}
      <div className="flex bg-white border border-slate-200/80 p-1.5 rounded-2xl mb-6 shadow-xs gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("shirts")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === "shirts"
              ? "bg-purple-50 text-kora border border-purple-100 shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className="text-sm">👕</span> Shirts &amp; Kits
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shoes")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === "shoes"
              ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className="text-sm">👟</span> Shoes &amp; Boots
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("accessories")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === "accessories"
              ? "bg-amber-50 text-amber-600 border border-amber-100 shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className="text-sm">🎒</span> Accessories
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden transition-all duration-500">
        {/* Form header with matching accent bar */}
        <div className="relative px-5 sm:px-8 pt-7 pb-5 border-b border-slate-100">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.accentBar}`} />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span>Vault Ingestion</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${theme.badgeColor}`}>
              {activeTab === "shirts" ? "Shirts" : activeTab === "shoes" ? "Shoes" : "Accessories"}
            </span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Register new football gear directly into the Kora Store central database</p>
        </div>

        <div className="p-5 sm:p-8 space-y-8">
          {/* Section 1: Basic Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} ${theme.textColor} flex items-center justify-center text-xs font-black shrink-0`}>1</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Basic Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {activeTab === "shirts" ? "Kit / Shirt Name" : activeTab === "shoes" ? "Shoes Name" : "Item Name"}
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white ${theme.focusRing} outline-none text-sm font-bold transition-all`}
                  placeholder={
                    activeTab === "shirts" ? "e.g., Real Madrid 11/12 Gold Edition" :
                    activeTab === "shoes" ? "e.g., Predator Edge+ FG Soccer Cleats" :
                    "e.g., Real Madrid Classic Club Scarf"
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Price ({CURRENCY.trim()})</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white ${theme.focusRing} outline-none text-sm font-mono font-bold transition-all`}
                  placeholder="120.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeTab === "shirts" ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={shirtCategory}
                    onChange={e => setShirtCategory(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora outline-none text-sm cursor-pointer font-bold transition-all"
                  >
                    <option value="Shirts">Shirts (Modern)</option>
                    <option value="Retro Kits">Retro Kits</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <input
                    disabled
                    type="text"
                    value={activeTab === "shoes" ? "Shoes / Boots" : "Accessories"}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl p-3.5 text-sm font-bold cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {activeTab === "shirts" ? "Club / National Team" : activeTab === "shoes" ? "Brand / Series" : "Sub-Category"}
                </label>
                <input
                  type="text"
                  value={team}
                  onChange={e => setTeam(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white ${theme.focusRing} outline-none text-sm font-bold transition-all`}
                  placeholder={
                    activeTab === "shirts" ? "e.g., Real Madrid" :
                    activeTab === "shoes" ? "e.g., Adidas" :
                    "e.g., Souvenirs"
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Display Tag</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white outline-none text-sm cursor-pointer font-bold transition-all"
                >
                  <option value="Latest">Latest</option>
                  <option value="Trending">Trending</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Campaign Options */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} ${theme.textColor} flex items-center justify-center text-xs font-black shrink-0`}>2</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Campaigns &amp; Promotion</h3>
            </div>

            <div className="max-w-sm">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200 rounded-xl p-4 w-full h-full select-none transition-colors">
                <input
                  type="checkbox"
                  checked={isWorldCup}
                  onChange={e => setIsWorldCup(e.target.checked)}
                  className={`rounded ${activeTab === "shirts" ? "text-[#6B00FF] focus:ring-[#6B00FF]" : activeTab === "shoes" ? "text-blue-600 focus:ring-blue-600" : "text-amber-600 focus:ring-amber-600"} h-4 w-4 border-slate-300`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">World Cup Campaign</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Highlight this gear in the World Cup catalog section</p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Media Upload */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} ${theme.textColor} flex items-center justify-center text-xs font-black shrink-0`}>3</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Media Assets</h3>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Product Images</label>
              <ImageUploader
                images={images}
                onChange={uploadedUrls => setImages(uploadedUrls)}
              />
            </div>
          </div>

          {/* Section 4: Sizes and Stocks (Tabs-based Dynamic Grid) */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} ${theme.textColor} flex items-center justify-center text-xs font-black shrink-0`}>4</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Inventory Stock Per Size</h3>
            </div>

            {/* TAB 1: SHIRTS SIZE GRID */}
            {activeTab === "shirts" && (
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Available Sizes &amp; Enter Stocks</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  {Object.entries(shirtSizes).map(([size, data]) => (
                    <div
                      key={size}
                      className={`border rounded-2xl p-3.5 flex flex-col items-center justify-between transition-all duration-300 bg-white ${
                        data.checked ? "border-kora/50 ring-2 ring-kora/5" : "border-slate-200/80 bg-slate-50/20"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer w-full justify-center select-none pb-2 border-b border-slate-100">
                        <input
                          type="checkbox"
                          checked={data.checked}
                          onChange={e => setShirtSizes({
                            ...shirtSizes,
                            [size]: { ...data, checked: e.target.checked }
                          })}
                          className="rounded text-kora focus:ring-kora h-4 w-4 border-slate-300"
                        />
                        <span className="text-sm font-black text-slate-900 uppercase">{size}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        disabled={!data.checked}
                        value={data.checked ? data.stock : ""}
                        placeholder="Stock"
                        onChange={e => setShirtSizes({
                          ...shirtSizes,
                          [size]: { ...data, stock: parseInt(e.target.value) || 0 }
                        })}
                        className={`w-full mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs font-mono font-bold focus:bg-white outline-none transition-all ${
                          !data.checked ? "opacity-30 cursor-not-allowed" : "focus:border-kora"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: SHOES SIZE GRID */}
            {activeTab === "shoes" && (
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Available Shoe Sizes &amp; Enter Stocks (EU)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {Object.entries(shoeSizes).map(([size, data]) => (
                    <div
                      key={size}
                      className={`border rounded-2xl p-3.5 flex flex-col items-center justify-between transition-all duration-300 bg-white ${
                        data.checked ? "border-blue-500/50 ring-2 ring-blue-500/5" : "border-slate-200/80 bg-slate-50/20"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer w-full justify-center select-none pb-2 border-b border-slate-100">
                        <input
                          type="checkbox"
                          checked={data.checked}
                          onChange={e => setShoeSizes({
                            ...shoeSizes,
                            [size]: { ...data, checked: e.target.checked }
                          })}
                          className="rounded text-blue-600 focus:ring-blue-600 h-4 w-4 border-slate-300"
                        />
                        <span className="text-sm font-black text-slate-900 uppercase">{size}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        disabled={!data.checked}
                        value={data.checked ? data.stock : ""}
                        placeholder="Stock"
                        onChange={e => setShoeSizes({
                          ...shoeSizes,
                          [size]: { ...data, stock: parseInt(e.target.value) || 0 }
                        })}
                        className={`w-full mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs font-mono font-bold focus:bg-white outline-none transition-all ${
                          !data.checked ? "opacity-30 cursor-not-allowed" : "focus:border-blue-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ACCESSORIES SIZE GRID */}
            {activeTab === "accessories" && (
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Level (One Size)</label>
                <div className="max-w-xs">
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 flex items-center justify-between gap-4">
                    <span className="text-sm font-black text-slate-950 uppercase">One Size</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={accessorySizes["One Size"].stock}
                      onChange={e => setAccessorySizes({
                        "One Size": { checked: true, stock: parseInt(e.target.value) || 0 }
                      })}
                      className="w-24 bg-white border border-slate-200 rounded-xl p-3 text-center text-xs font-mono font-bold focus:border-amber-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Description */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} ${theme.textColor} flex items-center justify-center text-xs font-black shrink-0`}>5</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Product Description</h3>
            </div>

            <div>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 outline-none h-28 resize-none text-sm transition-all"
                placeholder={
                  activeTab === "shirts" ? "Include print durability detail, jersey fabric weave type, fit specifications..." :
                  activeTab === "shoes" ? "Describe comfort padding, stud alignment design, outer shell material performance..." :
                  "Accessory dimensions, materials, styling options..."
                }
              />
            </div>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="px-5 sm:px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex flex-col items-center gap-4">
          <button
            type="submit"
            className={`w-full bg-gradient-to-r ${theme.btnGradient} text-white font-black py-4 rounded-2xl tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] text-xs sm:text-sm`}
          >
            Ingest to Vault
          </button>

          {status && (
            <div className={`w-full text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider ${
              status.startsWith("❌")
                ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                : status.startsWith("✅")
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                : "bg-purple-50 text-kora border border-purple-100"
            }`}>
              {status}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}