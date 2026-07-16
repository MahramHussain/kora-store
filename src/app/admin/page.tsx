"use client";

import { useState, useEffect } from "react";
import { CURRENCY, PRESET_PLAYERS } from "@/lib/constants";
import ImageUploader from "@/components/ImageUploader";

const getPresetPlayersForProduct = (productName: string) => {
  const normalized = productName.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
  return PRESET_PLAYERS[normalized] || [];
};

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"shirts" | "shoes" | "accessories">("shirts");

  // Shared form inputs
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Latest");
  const [images, setImages] = useState<string[]>([]);
  const [isWorldCup, setIsWorldCup] = useState(false);
  const [gender, setGender] = useState("Unisex");

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

  // Player stocks state
  const [playerStocks, setPlayerStocks] = useState<Array<{ name: string; number: string; stock: number }>>([]);

  // Sync default player stocks when name changes
  useEffect(() => {
    const preset = getPresetPlayersForProduct(name);
    if (preset.length > 0) {
      setPlayerStocks(
        preset.map(p => ({
          name: p.name,
          number: p.number,
          stock: 10
        }))
      );
    } else {
      setPlayerStocks([]);
    }
  }, [name]);

  // Tab 2: Shoes Specifics
  const [brand, setBrand] = useState("");
  const [soleplate, setSoleplate] = useState("FG"); // FG, SG, AG, TF, IN, Casual
  const [colorway, setColorway] = useState("");
  const [shoeSizes, setShoeSizes] = useState<Record<string, { checked: boolean; stock: number }>>({
    "36": { checked: false, stock: 10 },
    "37": { checked: false, stock: 10 },
    "38": { checked: false, stock: 10 },
    "39": { checked: true, stock: 10 },
    "40": { checked: true, stock: 10 },
    "41": { checked: true, stock: 10 },
    "42": { checked: true, stock: 10 },
    "43": { checked: true, stock: 10 },
    "44": { checked: true, stock: 10 },
    "45": { checked: false, stock: 10 },
    "46": { checked: false, stock: 10 },
    "47": { checked: false, stock: 10 }
  });

  // Tab 3: Accessories Specifics
  const [accessoryCategory, setAccessoryCategory] = useState("Accessories"); // "Accessories" or "Flags"
  const [subCategory, setSubCategory] = useState("Socks"); // Socks, Flags, Bags, Souvenirs, Other
  const [accessoryBrand, setAccessoryBrand] = useState("");
  const [accessoryTeam, setAccessoryTeam] = useState("");
  const [accessorySizes, setAccessorySizes] = useState<Record<string, { checked: boolean; stock: number }>>({
    "One Size": { checked: true, stock: 10 },
    "S": { checked: false, stock: 10 },
    "M": { checked: false, stock: 10 },
    "L": { checked: false, stock: 10 },
    "XL": { checked: false, stock: 10 }
  });

  const getTabTheme = () => {
    switch (activeTab) {
      case "shirts":
        return {
          textColor: "text-purple-600",
          bgColor: "bg-purple-600",
          borderColor: "border-purple-200",
          bgLight: "bg-purple-50/50",
          btnGradient: "from-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 shadow-purple-600/25",
          iconColorBg: "bg-purple-100/80 text-purple-700",
          focusRing: "focus:border-purple-500 focus:ring-purple-500/10",
          accentBar: "from-purple-600 via-indigo-500 to-pink-500",
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100"
        };
      case "shoes":
        return {
          textColor: "text-blue-600",
          bgColor: "bg-blue-600",
          borderColor: "border-blue-200",
          bgLight: "bg-blue-50/50",
          btnGradient: "from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-700 shadow-blue-600/25",
          iconColorBg: "bg-blue-100/80 text-blue-700",
          focusRing: "focus:border-blue-500 focus:ring-blue-500/10",
          accentBar: "from-blue-600 via-cyan-500 to-teal-500",
          badgeColor: "bg-blue-50 text-blue-600 border-blue-100"
        };
      case "accessories":
        return {
          textColor: "text-amber-600",
          bgColor: "bg-amber-600",
          borderColor: "border-amber-200",
          bgLight: "bg-amber-50/50",
          btnGradient: "from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-700 shadow-amber-600/25",
          iconColorBg: "bg-amber-100/80 text-amber-700",
          focusRing: "focus:border-amber-500 focus:ring-amber-500/10",
          accentBar: "from-amber-500 via-orange-500 to-yellow-500",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-100"
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
      accessoryCategory;

    setStatus("Dropping into Vault...");

    try {
      const response = await fetch("/api/gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price) || 0,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          description,
          tag,
          images,
          sizes: selectedSizes,
          sizeStocks,
          playerStocks,
          isWorldCup,
          gender,
          // Tab-specific details
          team: activeTab === "shirts" ? team : (activeTab === "accessories" ? accessoryTeam : ""),
          brand: activeTab === "shoes" ? brand : (activeTab === "accessories" ? accessoryBrand : ""),
          soleplate: activeTab === "shoes" ? soleplate : "",
          colorway: activeTab === "shoes" ? colorway : "",
          subCategory: activeTab === "accessories" ? subCategory : ""
        })
      });

      if (response.ok) {
        setStatus("✅ Gear successfully added to the Vault!");
        // Reset state
        setName("");
        setPrice("");
        setOriginalPrice("");
        setDescription("");
        setTag("Latest");
        setImages([]);
        setPlayerStocks([]);
        setIsWorldCup(false);
        setGender("Unisex");
        setTeam("");
        setBrand("");
        setSoleplate("FG");
        setColorway("");
        setAccessoryCategory("Accessories");
        setSubCategory("Socks");
        setAccessoryBrand("");
        setAccessoryTeam("");
        setShirtSizes({
          "S": { checked: true, stock: 10 },
          "M": { checked: true, stock: 10 },
          "L": { checked: true, stock: 10 },
          "XL": { checked: true, stock: 10 },
          "XXL": { checked: false, stock: 10 }
        });
        setShoeSizes({
          "36": { checked: false, stock: 10 },
          "37": { checked: false, stock: 10 },
          "38": { checked: false, stock: 10 },
          "39": { checked: true, stock: 10 },
          "40": { checked: true, stock: 10 },
          "41": { checked: true, stock: 10 },
          "42": { checked: true, stock: 10 },
          "43": { checked: true, stock: 10 },
          "44": { checked: true, stock: 10 },
          "45": { checked: false, stock: 10 },
          "46": { checked: false, stock: 10 },
          "47": { checked: false, stock: 10 }
        });
        setAccessorySizes({
          "One Size": { checked: true, stock: 10 },
          "S": { checked: false, stock: 10 },
          "M": { checked: false, stock: 10 },
          "L": { checked: false, stock: 10 },
          "XL": { checked: false, stock: 10 }
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
    <div className="max-w-4xl mx-auto font-sans px-2 sm:px-0">
      {/* Premium responsive tab selector */}
      <div className="grid grid-cols-3 bg-white border border-slate-200/80 p-1.5 rounded-2xl mb-6 shadow-xs gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("shirts")}
          className={`flex items-center justify-center gap-1.5 sm:gap-2.5 py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === "shirts"
              ? "bg-purple-50 text-purple-700 border border-purple-100 shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className="text-sm">👕</span> <span className="hidden xs:inline">Shirts &amp; Kits</span><span className="xs:hidden">Kits</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shoes")}
          className={`flex items-center justify-center gap-1.5 sm:gap-2.5 py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === "shoes"
              ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className="text-sm">👟</span> <span className="hidden xs:inline">Shoes &amp; Boots</span><span className="xs:hidden">Shoes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("accessories")}
          className={`flex items-center justify-center gap-1.5 sm:gap-2.5 py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === "accessories"
              ? "bg-amber-50 text-amber-700 border border-amber-100 shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className="text-sm">🎒</span> <span className="hidden xs:inline">Accessories</span><span className="xs:hidden">Accessory</span>
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
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} flex items-center justify-center text-[10px] font-black shrink-0`}>1</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Basic Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white ${theme.focusRing} outline-none text-sm font-bold transition-all`}
                  placeholder={
                    activeTab === "shirts" ? "e.g., Real Madrid 11/12 Gold Edition" :
                    activeTab === "shoes" ? "e.g., Predator Edge+ FG Cleats" :
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
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compare-At Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white ${theme.focusRing} outline-none text-sm font-mono font-bold transition-all`}
                  placeholder="Original price if on sale"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white outline-none text-sm cursor-pointer font-bold transition-all"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
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

          {/* Section 2: Tab-specific Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} flex items-center justify-center text-[10px] font-black shrink-0`}>2</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Category Attributes</h3>
            </div>

            {/* TAB 1: SHIRT ATTRIBUTES */}
            {activeTab === "shirts" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kit Category</label>
                  <select
                    value={shirtCategory}
                    onChange={e => setShirtCategory(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-purple-500 outline-none text-sm cursor-pointer font-bold transition-all"
                  >
                    <option value="Shirts">Shirts (Modern)</option>
                    <option value="Retro Kits">Retro Kits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Club / National Team</label>
                  <input
                    required
                    type="text"
                    value={team}
                    onChange={e => setTeam(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-purple-500 outline-none text-sm font-bold transition-all"
                    placeholder="e.g., Real Madrid, Argentina"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: SHOE ATTRIBUTES */}
            {activeTab === "shoes" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                  <input
                    required
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-blue-500 outline-none text-sm font-bold transition-all"
                    placeholder="e.g., Adidas, Nike, Puma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Soleplate / Ground</label>
                  <select
                    value={soleplate}
                    onChange={e => setSoleplate(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-blue-500 outline-none text-sm cursor-pointer font-bold transition-all"
                  >
                    <option value="FG">Firm Ground (FG)</option>
                    <option value="SG">Soft Ground (SG)</option>
                    <option value="AG">Artificial Grass (AG)</option>
                    <option value="TF">Turf (TF)</option>
                    <option value="IN">Indoor (IN)</option>
                    <option value="Casual">Casual / Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Colorway</label>
                  <input
                    required
                    type="text"
                    value={colorway}
                    onChange={e => setColorway(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-blue-500 outline-none text-sm font-bold transition-all"
                    placeholder="e.g., Black/Gold/White"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ACCESSORY ATTRIBUTES */}
            {activeTab === "accessories" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category Type</label>
                  <select
                    value={accessoryCategory}
                    onChange={e => setAccessoryCategory(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-amber-500 outline-none text-sm cursor-pointer font-bold transition-all"
                  >
                    <option value="Accessories">Accessories</option>
                    <option value="Flags">Flags</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sub-Category</label>
                  <select
                    value={subCategory}
                    onChange={e => setSubCategory(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-amber-500 outline-none text-sm cursor-pointer font-bold transition-all"
                  >
                    <option value="Socks">Socks</option>
                    <option value="Flags">Flags</option>
                    <option value="Bags">Bags</option>
                    <option value="Souvenirs">Souvenirs</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Brand (Optional)</label>
                  <input
                    type="text"
                    value={accessoryBrand}
                    onChange={e => setAccessoryBrand(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-amber-500 outline-none text-sm font-bold transition-all"
                    placeholder="e.g., Nike, Puma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Club/Team (Optional)</label>
                  <input
                    type="text"
                    value={accessoryTeam}
                    onChange={e => setAccessoryTeam(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:border-amber-500 outline-none text-sm font-bold transition-all"
                    placeholder="e.g., Barcelona, Arsenal"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Campaigns & Promotions */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} flex items-center justify-center text-[10px] font-black shrink-0`}>3</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Promotion &amp; Campaigns</h3>
            </div>

            <div className="max-w-sm">
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200 rounded-xl p-4 w-full h-full select-none transition-colors">
                <input
                  type="checkbox"
                  checked={isWorldCup}
                  onChange={e => setIsWorldCup(e.target.checked)}
                  className={`rounded ${activeTab === "shirts" ? "text-purple-600 focus:ring-purple-500" : activeTab === "shoes" ? "text-blue-600 focus:ring-blue-500" : "text-amber-600 focus:ring-amber-500"} h-4 w-4 border-slate-300`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">World Cup Campaign</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Highlight this gear in the World Cup catalog section</p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Media Upload */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} flex items-center justify-center text-[10px] font-black shrink-0`}>4</div>
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

          {/* Section 5: Sizes and Stocks */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} flex items-center justify-center text-[10px] font-black shrink-0`}>5</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Inventory &amp; Sizes</h3>
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
                        data.checked ? "border-purple-500/50 ring-2 ring-purple-500/5" : "border-slate-200/80 bg-slate-50/20"
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
                          className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 border-slate-300"
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
                          !data.checked ? "opacity-30 cursor-not-allowed" : "focus:border-purple-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 1: PLAYER STOCKS MANAGEMENT */}
            {activeTab === "shirts" && (
              <div className="space-y-4 border-t border-slate-100 pt-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Player Name Stocks</label>
                    <p className="text-[10px] text-slate-400 mt-0.5">Manage player prints and their respective stock levels</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlayerStocks([...playerStocks, { name: "", number: "", stock: 10 }])}
                    className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100/80 text-purple-700 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors border border-purple-200/50 flex items-center gap-1 cursor-pointer"
                  >
                    <span>➕ Add Player</span>
                  </button>
                </div>

                {playerStocks.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic bg-slate-50/50 border border-slate-200/40 rounded-xl p-3 text-center">No player prints added. Click "Add Player" to add custom prints.</p>
                ) : (
                  <div className="space-y-2">
                    {playerStocks.map((player, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center bg-slate-50/50 border border-slate-200/60 rounded-xl p-2.5">
                        <div className="flex-1">
                          <input
                            required
                            type="text"
                            placeholder="NAME (e.g. MESSI)"
                            value={player.name}
                            onChange={(e) => {
                              const newList = [...playerStocks];
                              newList[idx].name = e.target.value.toUpperCase();
                              setPlayerStocks(newList);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <div className="w-20">
                            <input
                              required
                              type="text"
                              placeholder="NUMBER"
                              value={player.number}
                              onChange={(e) => {
                                const newList = [...playerStocks];
                                newList[idx].number = e.target.value.replace(/[^0-9]/g, "");
                                setPlayerStocks(newList);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              required
                              type="number"
                              min="0"
                              placeholder="STOCK"
                              value={player.stock}
                              onChange={(e) => {
                                const newList = [...playerStocks];
                                newList[idx].stock = parseInt(e.target.value) || 0;
                                setPlayerStocks(newList);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold text-center text-slate-800 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPlayerStocks(playerStocks.filter((_, i) => i !== idx));
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/40 transition-colors cursor-pointer shrink-0 font-bold text-xs h-[38px] flex items-center justify-center"
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

            {/* TAB 2: SHOES SIZE GRID */}
            {activeTab === "shoes" && (
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Available Shoe Sizes &amp; Enter Stocks (EU)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5">
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Available Sizes &amp; Enter Stocks</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  {Object.entries(accessorySizes).map(([size, data]) => (
                    <div
                      key={size}
                      className={`border rounded-2xl p-3.5 flex flex-col items-center justify-between transition-all duration-300 bg-white ${
                        data.checked ? "border-amber-500/50 ring-2 ring-amber-500/5" : "border-slate-200/80 bg-slate-50/20"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer w-full justify-center select-none pb-2 border-b border-slate-100">
                        <input
                          type="checkbox"
                          checked={data.checked}
                          onChange={e => setAccessorySizes({
                            ...accessorySizes,
                            [size]: { ...data, checked: e.target.checked }
                          })}
                          className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 border-slate-300"
                        />
                        <span className="text-sm font-black text-slate-900 uppercase">{size}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        disabled={!data.checked}
                        value={data.checked ? data.stock : ""}
                        placeholder="Stock"
                        onChange={e => setAccessorySizes({
                          ...accessorySizes,
                          [size]: { ...data, stock: parseInt(e.target.value) || 0 }
                        })}
                        className={`w-full mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-xs font-mono font-bold focus:bg-white outline-none transition-all ${
                          !data.checked ? "opacity-30 cursor-not-allowed" : "focus:border-amber-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Description */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${theme.iconColorBg} flex items-center justify-center text-[10px] font-black shrink-0`}>6</div>
              <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Product Description</h3>
            </div>

            <div>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={`w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white ${theme.focusRing} focus:ring-2 outline-none h-28 resize-none text-sm transition-all`}
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
                : "bg-slate-50 text-slate-700 border border-slate-200"
            }`}>
              {status}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}