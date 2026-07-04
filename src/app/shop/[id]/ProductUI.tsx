"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CURRENCY, PRESET_PLAYERS } from "@/lib/constants";
import Link from "next/link";
import { FaChevronLeft, FaStar, FaTruckFast } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { FiEdit, FiAward, FiThumbsUp, FiFilter, FiX, FiCheck, FiMessageSquare, FiTrash2, FiCornerDownRight, FiLock } from "react-icons/fi";
import { useUser, SignInButton } from "@clerk/nextjs";

const JERSEYS: Record<
  string,
  { name: string; primary: string; secondary: string; stripes?: boolean; sleeves?: string }
> = {
  argentina: { name: "Argentina", primary: "#74acdf", secondary: "#ffffff", stripes: true },
  realmadrid: { name: "Real Madrid", primary: "#ffffff", secondary: "#d4af37", sleeves: "#ffffff" },
  alnassr: { name: "Al Nassr", primary: "#ffcc00", secondary: "#0055b8", sleeves: "#ffcc00" },
  portugal: { name: "Portugal", primary: "#bc0000", secondary: "#006600", sleeves: "#bc0000" },
  barcelona: { name: "Barcelona", primary: "#004d98", secondary: "#a50044", stripes: true },
  mancity: { name: "Man City", primary: "#6cabdd", secondary: "#ffffff", sleeves: "#6cabdd" },
  arsenal: { name: "Arsenal", primary: "#ef0107", secondary: "#ffffff", sleeves: "#ffffff" },
  intermiami: { name: "Inter Miami", primary: "#f7b5cd", secondary: "#000000", sleeves: "#f7b5cd" },
};

function MiniJersey({ colors }: { colors: typeof JERSEYS[string] }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center scale-90 select-none">
      {/* Torso */}
      <div
        className="relative w-[56%] h-[75%] rounded-t-[4px] overflow-hidden z-10"
        style={{ backgroundColor: colors.primary }}
      >
        {colors.stripes && (
          <div className="absolute inset-0 flex justify-around">
            <div className="w-[20%] h-full" style={{ backgroundColor: colors.secondary }} />
            <div className="w-[20%] h-full" style={{ backgroundColor: colors.secondary }} />
            <div className="w-[20%] h-full" style={{ backgroundColor: colors.secondary }} />
          </div>
        )}
        {/* Neck collar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[15%] bg-slate-900/15 rounded-b-full" />
      </div>
      {/* Left Sleeve */}
      <div
        className="absolute top-[12%] left-[8%] w-[25%] h-[44%] rounded-l-[2px] origin-top-right -rotate-25"
        style={{ backgroundColor: colors.sleeves || colors.primary }}
      />
      {/* Right Sleeve */}
      <div
        className="absolute top-[12%] right-[8%] w-[25%] h-[44%] rounded-r-[2px] origin-top-left rotate-25"
        style={{ backgroundColor: colors.sleeves || colors.primary }}
      />
    </div>
  );
}

function AvatarDisplay({
  imageUrl,
  name,
  selectedAvatar,
  customProfilePic,
  size = "w-10 h-10"
}: {
  imageUrl?: string;
  name: string;
  selectedAvatar: string | null;
  customProfilePic: string | null;
  size?: string;
}) {
  if (selectedAvatar === "custom_upload" && customProfilePic) {
    return (
      <img src={customProfilePic} alt="Profile" className={`${size} rounded-full border-2 border-kora shadow-md object-cover shrink-0`} />
    );
  }

  if (selectedAvatar && JERSEYS[selectedAvatar]) {
    return (
      <div className={`${size} rounded-full bg-slate-900 border-2 border-kora shadow-md flex items-center justify-center overflow-hidden shrink-0`}>
        <MiniJersey colors={JERSEYS[selectedAvatar]} />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img src={imageUrl} alt="Profile" className={`${size} rounded-full border-2 border-kora/60 shadow-md object-cover shrink-0`} />
    );
  }

  const fallbackInitials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "V";

  return (
    <div className={`${size} rounded-full bg-gradient-to-tr from-kora to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 uppercase`}>
      {fallbackInitials || "V"}
    </div>
  );
}

const VerifiedTick = () => (
  <svg
    className="w-[14px] h-[14px] text-[#0095f6] fill-current inline-block shrink-0 align-middle ml-0.5 select-none"
    viewBox="0 0 22 22"
    aria-label="Verified Account"
  >
    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
  </svg>
);

// Sizing or customization helper constants


const getPresetPlayersForProduct = (productName: string) => {
  const normalized = productName.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
  return PRESET_PLAYERS[normalized] || [];
};

// Custom SVG icon for Name & Number printing (shirt with "00")
function JerseyPrintIcon({ className = "w-6 h-6 text-kora" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      {/* Jersey body shape */}
      <path d="M 36 18 Q 50 26 64 18 L 90 36 L 79 52 L 74 44 L 74 85 L 26 85 L 26 44 L 21 52 L 10 36 Z" />
      {/* Sleeve stripes */}
      <line x1="13" y1="37" x2="23" y2="51" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="87" y1="37" x2="77" y2="51" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom stripes */}
      <line x1="26" y1="76" x2="74" y2="76" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="81" x2="74" y2="81" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Zero rects */}
      <rect x="35" y="32" width="12" height="28" rx="4.5" fill="none" stroke="white" strokeWidth="3.5" />
      <rect x="53" y="32" width="12" height="28" rx="4.5" fill="none" stroke="white" strokeWidth="3.5" />
    </svg>
  );
}

// Custom SVG icon for sleeve patches (folded corner badge)
function SleevePatchIcon({ className = "w-6 h-6 text-kora" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {/* Main badge body */}
      <path d="M19 3H5c-1.1 0-2 .9-2 2v10.5l5.5 5.5H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      {/* Fold curve separator */}
      <path d="M3 15.5C5.5 15.5 8 18 8 20.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type CustomSelectOption = {
  value: string;
  label: string;
  image?: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  className?: string;
};

function CustomSelect({ value, onChange, options, placeholder, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-w-0 bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-2 px-3 text-slate-700 font-bold focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-all flex items-center justify-between shadow-xs cursor-pointer text-xs text-left min-h-[44px]"
      >
        <div className="flex-1 min-w-0 flex items-center gap-2.5 overflow-hidden">
          {selectedOption?.image && (
            <img src={selectedOption.image} alt={selectedOption.label} className="w-7 h-7 object-contain rounded-md border border-slate-200/60 shrink-0 bg-white" />
          )}
          <span className={`truncate block ${selectedOption ? "text-slate-900 font-bold" : "text-slate-400"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto animate-fade-in origin-top">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic text-center">No options available</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 flex items-center gap-2.5 text-xs font-bold transition-colors ${
                  opt.value === value
                    ? "bg-kora text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {opt.image && (
                  <img src={opt.image} alt={opt.label} className="w-8 h-8 object-contain rounded-md border border-slate-200/60 shrink-0 bg-white" />
                )}
                <span className="flex-1 min-w-0 truncate">{opt.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const RIGHT_SLEEVE_PATCH_OPTIONS: CustomSelectOption[] = [
  {
    value: "",
    label: "Right Patch"
  },
  {
    value: "FIFA Black Patch (Right Sleeve)",
    label: "FIFA Black Patch (Right Sleeve)",
    image: "/assets/Patches/Right Sleeve/FIFA-BLACK-RIGHT-SLEEVE.jpg"
  },
  {
    value: "FIFA Black Patch (Right Sleeve) (Transfer)",
    label: "FIFA Black Patch (Right Sleeve) (Transfer)",
    image: "/assets/Patches/Right Sleeve/FIFA-BLACK-RIGHT-SLEEVE-transfer.jpg"
  },
  {
    value: "FIFA Champions Gold Patch (Right Sleeve)",
    label: "FIFA Champions Gold Patch (Right Sleeve)",
    image: "/assets/Patches/Right Sleeve/FIFA-CHAMPIONS-GOLD-RIGHT-SLEEVE.jpg"
  },
  {
    value: "FIFA Champions Gold Patch (Right Sleeve) (Transfer)",
    label: "FIFA Champions Gold Patch (Right Sleeve) (Transfer)",
    image: "/assets/Patches/Right Sleeve/FIFA-CHAMPION-GOLD-RIGHT-SLEEVE-transfer.jpg"
  },
  {
    value: "FIFA Champions White Patch (Right Sleeve)",
    label: "FIFA Champions White Patch (Right Sleeve)",
    image: "/assets/Patches/Right Sleeve/FIFA-CHAMPIONS-WHITE-RIGHT-SLEEVE.jpg"
  },
  {
    value: "FIFA Champions White Patch (Right Sleeve) (Transfer)",
    label: "FIFA Champions White Patch (Right Sleeve) (Transfer)",
    image: "/assets/Patches/Right Sleeve/FIFA-CHAMPION-WHITE-RIGHT-SLEEVE-transfer.jpg"
  },
  {
    value: "FIFA White Patch (Right Sleeve)",
    label: "FIFA White Patch (Right Sleeve)",
    image: "/assets/Patches/Right Sleeve/FIFA-WHITE-RIGHT-SLEEVE.jpg"
  },
  {
    value: "FIFA White Patch (Right Sleeve) (Transfer)",
    label: "FIFA White Patch (Right Sleeve) (Transfer)",
    image: "/assets/Patches/Right Sleeve/FIFA-WHITE-RIGHT-SLEEVE-transfer.jpg"
  }
];

const LEFT_SLEEVE_PATCH_OPTIONS: CustomSelectOption[] = [
  {
    value: "",
    label: "Left Patch"
  },
  {
    value: "Football Unites The World Blue 3D Patch (Left Sleeve)",
    label: "Football Unites The World Blue 3D Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-FTBL-UNITES-THE-WRLD-BLUE-3D-transfer.jpg"
  },
  {
    value: "Football Unites The World Blue Patch (Left Sleeve)",
    label: "Football Unites The World Blue Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-FTBL-UNITES-THE-WRLD-BLUE-transfer.jpg"
  },
  {
    value: "Football Unites The World White Patch (Left Sleeve)",
    label: "Football Unites The World White Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-FTBL-UNITES-THE-WRLD-WHITE-transfer.jpg"
  },
  {
    value: "Unite For Education Grey Patch (Left Sleeve)",
    label: "Unite For Education Grey Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-UNITE-FOR-EDUCATION-GREY-transfer.jpg"
  },
  {
    value: "Unite For Education Purple Patch (Left Sleeve)",
    label: "Unite For Education Purple Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-UNITE-FOR-EDUCATION-PURPLE-transfer.jpg"
  },
  {
    value: "Unite For Education White Patch (Left Sleeve)",
    label: "Unite For Education White Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-UNITE-FOR-EDUCATION-WHITE-transfer.jpg"
  },
  {
    value: "Unite For Peace Blue Patch (Left Sleeve)",
    label: "Unite For Peace Blue Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-UNITE-FOR-PEACE-BLUE-transfer.jpg"
  },
  {
    value: "Unite For Peace Light Blue Patch (Left Sleeve)",
    label: "Unite For Peace Light Blue Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-UNITE-FOR-PEACE-LIGHT-BLUE-transfer.jpg"
  },
  {
    value: "Unite For Peace White Patch (Left Sleeve)",
    label: "Unite For Peace White Patch (Left Sleeve)",
    image: "/assets/Patches/Left Sleeve/LEFT-SLEEVE-UNITE-FOR-PEACE-WHITE-transfer.jpg"
  }
];

export default function ProductUI({ product }: { product: any }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const normalizedName = product.name.toUpperCase().replace(/\s+KIT.*$/i, "").trim();
  const isChartA = ["PORTUGAL HOME", "PORTUGAL AWAY", "SPAIN AWAY", "FRANCE HOME"].includes(normalizedName);
  const isChartB = ["ARGENTINA HOME", "ARGENTINA AWAY", "FRANCE AWAY", "SPAIN HOME", "BRAZIL AWAY", "URUGUAY AWAY"].includes(normalizedName);
  const hasCustomSizeChart = isChartA || isChartB;
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { yes: number; voted: 'yes' | null }>>({});
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);
  const [isReplyingSubmitting, setIsReplyingSubmitting] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user: clerkUser } = useUser();
  const currentUserId = clerkUser?.id;
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress;
  const isAdmin = clerkEmail === "mahramh40@gmail.com" || clerkEmail === "korastore.ae@gmail.com";
  const [isAdded, setIsAdded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Personalization states
  const [personalizationTab, setPersonalizationTab] = useState<"none" | "custom" | "player">("none");
  const [leftSleevePatch, setLeftSleevePatch] = useState("");
  const [rightSleevePatch, setRightSleevePatch] = useState("");
  const hasFifaPatch = leftSleevePatch !== "" || rightSleevePatch !== "";
  const [selectedPresetPlayer, setSelectedPresetPlayer] = useState<{ name: string; number: string } | null>(null);
  const presetPlayers = getPresetPlayersForProduct(product.name);

  const handleSelectPresetPlayer = (player: { name: string; number: string }) => {
    if (selectedPresetPlayer?.name === player.name) {
      setSelectedPresetPlayer(null);
      setCustomName("");
      setCustomNumber("");
    } else {
      setSelectedPresetPlayer(player);
      setCustomName(player.name);
      setCustomNumber(player.number);
    }
  };

  // Zoom states for desktop main image
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const renderDesktopPersonalizationBox = () => {
    if (product.category !== "Shirts") return null;

    const playerOptions = presetPlayers.map((player: { name: string; number: string }) => ({
      value: JSON.stringify(player),
      label: `${player.name} (#${player.number})`
    }));

    return (
      <div className="space-y-6 mb-8">
        {/* Name & Number Printing Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 font-sans shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-sm shrink-0">
              <JerseyPrintIcon className="w-7 h-7 text-kora" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase text-kora tracking-widest bg-kora/10 px-2.5 py-0.5 rounded-sm">Bespoke Lab</span>
              <h3 className="text-slate-900 font-extrabold text-base leading-tight mt-1">Name & Number printing</h3>
              <p className="text-slate-400 text-xs mt-0.5">Add the name of your favorite player or any custom name available in official font</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setPersonalizationTab(personalizationTab === "player" ? "none" : "player");
                setSelectedPresetPlayer(null);
                setCustomName("");
                setCustomNumber("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 uppercase ${
                personalizationTab === "player"
                  ? "bg-kora border-kora text-white shadow-md shadow-kora/25"
                  : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-xs"
              }`}
            >
              <span>Player Name (+15 {CURRENCY.trim().toLowerCase()})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPersonalizationTab(personalizationTab === "custom" ? "none" : "custom");
                setSelectedPresetPlayer(null);
                setCustomName("");
                setCustomNumber("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 uppercase ${
                personalizationTab === "custom"
                  ? "bg-kora border-kora text-white shadow-md shadow-kora/25"
                  : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-xs"
              }`}
            >
              <span>Custom Name (+25 {CURRENCY.trim().toLowerCase()})</span>
            </button>
          </div>

          {/* Player Name Select Dropdown */}
          {personalizationTab === "player" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              {presetPlayers.length > 0 ? (
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2.5 tracking-widest">Select Player Print</label>
                  <CustomSelect
                    value={selectedPresetPlayer ? JSON.stringify(selectedPresetPlayer) : ""}
                    onChange={(val) => {
                      if (!val) {
                        setSelectedPresetPlayer(null);
                        setCustomName("");
                        setCustomNumber("");
                      } else {
                        const player = JSON.parse(val);
                        setSelectedPresetPlayer(player);
                        setCustomName(player.name);
                        setCustomNumber(player.number);
                      }
                    }}
                    options={playerOptions}
                    placeholder="Select a player..."
                  />
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No preset players available for this product.</p>
              )}
            </div>
          )}

          {/* Custom Name Inputs */}
          {personalizationTab === "custom" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Name on Back</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                    placeholder="e.g. ADNAN"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-990 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold tracking-wider text-slate-900"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Number</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-990 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold text-center text-slate-900"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">Bespoke hot-pressed vinyl printing. Handcrafted in-house.</p>
              <p className="text-[10px] text-kora font-black uppercase tracking-wider bg-purple-50 border border-purple-100/60 p-2.5 rounded-xl flex items-center justify-between mt-3">
                <span>✨ Custom Player Printing</span>
                <span>+25 {CURRENCY.trim().toLowerCase()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Sleeve Patches Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 font-sans shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-sm shrink-0">
                <SleevePatchIcon className="w-7 h-7 text-kora" />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-base leading-tight">Sleeve Patches</h3>
                <p className="text-slate-400 text-xs mt-0.5">Add the official sleeve patch</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-xs">
              +10 {CURRENCY.trim().toLowerCase()}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            {/* Right Sleeve Dropdown */}
            <CustomSelect
              value={rightSleevePatch}
              onChange={setRightSleevePatch}
              options={RIGHT_SLEEVE_PATCH_OPTIONS}
              placeholder="Right Patch"
              className="flex-1 min-w-0"
            />

            {/* Left Sleeve Dropdown */}
            <CustomSelect
              value={leftSleevePatch}
              onChange={setLeftSleevePatch}
              options={LEFT_SLEEVE_PATCH_OPTIONS}
              placeholder="Left Patch"
              className="flex-1 min-w-0"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalizationBox = () => {
    if (product.category !== "Shirts") return null;

    const playerOptions = presetPlayers.map((player: { name: string; number: string }) => ({
      value: JSON.stringify(player),
      label: `${player.name} (#${player.number})`
    }));

    return (
      <div className="space-y-4 mb-6">
        {/* Name & Number Printing Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 font-sans shadow-xs">
          <div className="flex items-start gap-4">
            {/* Jersey Icon */}
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-xs shrink-0">
              <JerseyPrintIcon className="w-7 h-7 text-kora" />
            </div>

            <div>
              <h3 className="text-slate-900 font-extrabold text-[15px] leading-tight">Name & Number printing</h3>
              <p className="text-slate-400 text-xs mt-1">Add the name of your favorite player or any custom name available in official font</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => {
                setPersonalizationTab(personalizationTab === "player" ? "none" : "player");
                setSelectedPresetPlayer(null);
                setCustomName("");
                setCustomNumber("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 uppercase ${
                personalizationTab === "player"
                  ? "bg-kora border-kora text-white shadow-md shadow-kora/25"
                  : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-sm hover:shadow-kora/10"
              }`}
            >
              <span>Player Name (+15 {CURRENCY.trim().toLowerCase()})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPersonalizationTab(personalizationTab === "custom" ? "none" : "custom");
                setSelectedPresetPlayer(null);
                setCustomName("");
                setCustomNumber("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 uppercase ${
                personalizationTab === "custom"
                  ? "bg-kora border-kora text-white shadow-md shadow-kora/25"
                  : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-sm hover:shadow-kora/10"
              }`}
            >
              <span>Custom Name (+25 {CURRENCY.trim().toLowerCase()})</span>
            </button>
          </div>

          {/* Player Dropdown */}
          {personalizationTab === "player" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              {presetPlayers.length > 0 ? (
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2.5 tracking-widest">Select Player Print</label>
                  <CustomSelect
                    value={selectedPresetPlayer ? JSON.stringify(selectedPresetPlayer) : ""}
                    onChange={(val) => {
                      if (!val) {
                        setSelectedPresetPlayer(null);
                        setCustomName("");
                        setCustomNumber("");
                      } else {
                        const player = JSON.parse(val);
                        setSelectedPresetPlayer(player);
                        setCustomName(player.name);
                        setCustomNumber(player.number);
                      }
                    }}
                    options={playerOptions}
                    placeholder="Select a player..."
                  />
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No preset players available for this product.</p>
              )}
            </div>
          )}

          {/* Custom Name Inputs */}
          {personalizationTab === "custom" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Name</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                    placeholder="e.g. ADNAN"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold tracking-wider"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Number</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold text-center"
                  />
                </div>
              </div>
              <p className="text-[10px] text-kora font-black uppercase tracking-wider bg-purple-50 border border-purple-100/60 p-2.5 rounded-xl flex items-center justify-between mt-3">
                <span>✨ Custom Player Printing</span>
                <span>+25 {CURRENCY.trim().toLowerCase()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Sleeve Patches Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 font-sans shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-xs shrink-0">
                <SleevePatchIcon className="w-7 h-7 text-kora" />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-[15px] leading-tight">Sleeve Patches</h3>
                <p className="text-slate-400 text-xs mt-1">Add the official sleeve patch</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs">
              +10 {CURRENCY.trim().toLowerCase()}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            {/* Right Sleeve Dropdown */}
            <CustomSelect
              value={rightSleevePatch}
              onChange={setRightSleevePatch}
              options={RIGHT_SLEEVE_PATCH_OPTIONS}
              placeholder="Right Patch"
              className="flex-1 min-w-0"
            />

            {/* Left Sleeve Dropdown */}
            <CustomSelect
              value={leftSleevePatch}
              onChange={setLeftSleevePatch}
              options={LEFT_SLEEVE_PATCH_OPTIONS}
              placeholder="Left Patch"
              className="flex-1 min-w-0"
            />
          </div>
        </div>
      </div>
    );
  };

  const galleryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute average rating from reviews
  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0) / product.reviews.length)
    : 0;
  const avgRatingDisplay = avgRating > 0 ? avgRating.toFixed(1) : null;

  // Percentage of positive reviews (4 or 5 stars)
  const positiveReviewsCount = product.reviews
    ? product.reviews.filter((r: any) => (r.rating || 5) >= 4).length
    : 0;
  const recommendPercent = product.reviews && product.reviews.length > 0
    ? Math.round((positiveReviewsCount / product.reviews.length) * 100)
    : 100;

  const isPreset = selectedPresetPlayer !== null;
  const hasCustomPrint = customName.trim() !== "" || customNumber.trim() !== "";
  const printUpcharge = hasCustomPrint ? (isPreset ? 15 : 25) : 0;

  // Filter reviews based on current rating selection
  const filteredReviews = product.reviews
    ? product.reviews.filter((r: any) => ratingFilter === null || r.rating === ratingFilter)
    : [];

  // Redirect banned or shadow-banned users immediately to account block page
  useEffect(() => {
    if (clerkUser) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(dbUser => {
          if (dbUser) {
            const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
            const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
            if (isBanned || isShadowBanned) {
              router.push("/account?banned=true");
            }
          }
        })
        .catch(err => console.error("Error checking ban status:", err));
    }
  }, [clerkUser, router]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync gallery scroll to activeImageIndex (for thumbnail clicks on mobile)
  const scrollToSlide = useCallback((idx: number) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  }, []);

  // Listen to swipe scroll and update dot indicator
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveImageIndex(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    let finalName = "";
    let finalNumber = "";
    
    if (customName.trim()) {
      finalName = customName.trim();
    }
    if (customNumber.trim()) {
      finalNumber = customNumber.trim();
    }

    const basePrice = parseFloat(product.price);
    const hasCustomPrint = finalName !== "" || finalNumber !== "";
    const isPreset = selectedPresetPlayer !== null;
    const printUpcharge = hasCustomPrint ? (isPreset ? 15 : 25) : 0;
    const finalPrice = basePrice + (hasFifaPatch ? 10 : 0) + printUpcharge;

    const patchString = hasFifaPatch
      ? [
          leftSleevePatch ? `Left: ${leftSleevePatch}` : "",
          rightSleevePatch ? `Right: ${rightSleevePatch}` : ""
        ].filter(Boolean).join(", ")
      : undefined;

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice.toFixed(2),
      image: product.images?.[activeImageIndex] || product.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png",
      size: selectedSize,
      quantity: quantity,
      customName: finalName || undefined,
      customNumber: finalNumber || undefined,
      playerName: selectedPresetPlayer?.name || undefined,
      patch: patchString || (hasFifaPatch ? "FIFA World Cup Badge Set" : undefined),
    });
    
    setIsAdded(true);
    setCustomName("");
    setCustomNumber("");
    setSelectedPresetPlayer(null);
    setLeftSleevePatch("");
    setRightSleevePatch("");
    setPersonalizationTab("none");
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating: selectedRating, comment: reviewText }),
      });
      setReviewText("");
      setSelectedRating(5);
      router.refresh();
    } catch (error) {
      console.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete review.");
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const handleEditReview = async (reviewId: string) => {
    if (!editComment.trim()) return;
    setIsEditingSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          action: "edit",
          comment: editComment,
          rating: editRating,
        }),
      });
      if (res.ok) {
        setEditingReviewId(null);
        setEditComment("");
        router.refresh();
      } else {
        alert("Failed to save changes.");
      }
    } catch (error) {
      console.error("Edit review error:", error);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleReplyReview = async (reviewId: string) => {
    setIsReplyingSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          action: "reply",
          replyText: replyText.trim() || null,
        }),
      });
      if (res.ok) {
        setReplyingReviewId(null);
        setReplyText("");
        router.refresh();
      } else {
        alert("Failed to save reply.");
      }
    } catch (error) {
      console.error("Post reply error:", error);
    } finally {
      setIsReplyingSubmitting(false);
    }
  };

  // Reusable interactive star picker
  const StarPicker = ({ size = "text-xl" }: { size?: string }) => (
    <div className={`flex gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setSelectedRating(star)}
          className="star-interactive focus:outline-none"
          aria-label={`Rate ${star} stars`}
        >
          <FaStar
            className={`transition-colors ${
              star <= (hoverRating || selectedRating)
                ? "text-yellow-400"
                : "text-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const images: string[] = product.images && product.images.length > 0 ? product.images : [];
  const categoryLabel =
    product.category === "Boots" ? "Shoes" : product.category === "Flags" ? "Accessories" : product.category;

  // ──────────────────────────────────────────────────────────────────────────
  //  MOBILE LAYOUT  (< 768px — isMobile is derived from CSS media query)
  // ──────────────────────────────────────────────────────────────────────────
  const MobileView = (
    <div className="block md:hidden min-h-screen bg-slate-50 font-sans selection:bg-kora selection:text-white">
      {/* ── Back button overlay ── */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-safe">
        <div className="flex items-center justify-between py-3">
          <Link
            href="/shop"
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/50 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
          >
            <FaChevronLeft className="text-sm" />
          </Link>
          {/* Stock badge */}
          {product.stock === 0 ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-rose-500 text-white rounded-full shadow">
              Sold Out
            </span>
          ) : product.stock <= 3 ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-amber-500 text-white rounded-full shadow animate-pulse">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Full-bleed swipeable image gallery ── */}
      <div className="relative w-full" style={{ height: "min(420px, 58vw + 100px)" }}>
        {images.length > 0 ? (
          <>
            <div
              ref={galleryRef}
              className="pdp-gallery-track w-full h-full"
            >
              {images.map((img, idx) => (
                <div key={idx} className="pdp-gallery-slide h-full" style={{ minWidth: "100%" }}>
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="pdp-dots absolute bottom-2 left-0 right-0">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSlide(idx)}
                    className={`pdp-dot ${idx === activeImageIndex ? "pdp-dot-active" : ""}`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image count badge */}
            {images.length > 1 && (
              <span className="absolute top-16 right-4 text-[10px] font-bold bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeImageIndex + 1}/{images.length}
              </span>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
            No Image Available
          </div>
        )}
      </div>

      {/* ── White card content area ── */}
      <div className="pdp-info-card pdp-mobile-animate">

        {/* Category + Name + Rating row */}
        <div className="mb-4">
          <span className="text-kora text-[10px] font-bold uppercase tracking-widest">{categoryLabel}</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight mt-1 uppercase">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex text-yellow-400 text-xs gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400" : "text-slate-200"} />
              ))}
            </div>
            {avgRatingDisplay ? (
              <span className="text-xs font-black text-slate-700">{avgRatingDisplay}</span>
            ) : null}
            <span className="text-xs text-slate-400 font-medium">
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>
        </div>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
          <span className="text-3xl font-black text-slate-900">
            {CURRENCY}{parseFloat(product.price) + (hasFifaPatch ? 10 : 0) + printUpcharge}
          </span>
          {product.stock === 0 ? (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full">
              Sold Out
            </span>
          ) : product.stock <= 3 ? (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full animate-pulse">
              Only {product.stock} left!
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {/* Style Variation Selector (Boots) */}
        {product.category === "Boots" && images.length > 1 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Style / Variation</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all active:scale-90 ${
                    activeImageIndex === i
                      ? "border-kora shadow-md shadow-kora/20"
                      : "border-slate-200"
                  }`}
                >
                  <img src={img} alt={`Variation ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Thumbnail row for non-boots */}
        {product.category !== "Boots" && images.length > 1 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Gallery</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all active:scale-90 ${
                    activeImageIndex === i
                      ? "border-kora shadow-md shadow-kora/20"
                      : "border-slate-200"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Size</p>
            {hasCustomSizeChart ? (
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="text-[10px] font-bold text-kora uppercase tracking-wider cursor-pointer focus:outline-none"
              >
                Size Guide →
              </button>
            ) : (
              <Link href="/faq" className="text-[10px] font-bold text-kora uppercase tracking-wider">
                Size Guide →
              </Link>
            )}
          </div>
          {product.sizes && product.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => product.stock > 0 && setSelectedSize(size)}
                  disabled={product.stock === 0}
                  className={`pdp-size-pill px-3 ${
                    product.stock === 0
                      ? "pdp-size-pill-disabled"
                      : selectedSize === size
                      ? "pdp-size-pill-active"
                      : ""
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">One Size</p>
          )}
        </div>

        {/* Custom Printing (Shirts only) */}
        {renderPersonalizationBox()}

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            {product.description || "Premium gear sourced directly from Kora Store's exclusive vault."}
          </p>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="pdp-trust-badge">
            <FaTruckFast className="text-kora text-base shrink-0" />
            <span>UAE Delivery within 48 Hours</span>
          </div>
          <div className="pdp-trust-badge">
            <FaShieldAlt className="text-kora text-base shrink-0" />
            <span>7-Day Guarantee</span>
          </div>
        </div>

        {/* ── Tabs: Details + Reviews ── */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex gap-6 border-b border-slate-100 mb-5">
            <button
              onClick={() => setActiveTab("details")}
              className={`pdp-tab ${activeTab === "details" ? "pdp-tab-active" : ""}`}
            >
              The Intel
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pdp-tab ${activeTab === "reviews" ? "pdp-tab-active" : ""}`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          {activeTab === "details" && (
            <div className="text-slate-500 text-sm leading-relaxed space-y-6 pdp-mobile-animate">
              <p>Every kit is rigorously quality-checked before dispatch. We bypass traditional retail to bring you absolute 1:1 specifications.</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Fit:</span> Standard athletic cut. Size up for Player Issue versions.</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Material:</span> 100% Recycled Polyester with advanced sweat-wicking tech.</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Care:</span> Hand Wash Only. Do not use washing machine or tumble dryer.</li>
              </ul>

              {/* Mobile Policy & Care Details */}
              <div className="grid grid-cols-1 gap-4 mt-6">
                {/* Wash Care Card */}
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-white border border-slate-200/50 rounded-xl text-kora text-base">🧼</span>
                    <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Wash & Care Instructions</h4>
                  </div>
                  <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside">
                    <li><strong className="text-slate-700">Hand wash only</strong> using cold water.</li>
                    <li>Use a small amount of mild detergent.</li>
                    <li>Wash gently. <strong className="text-slate-700">Do not scrub</strong> prints or logos.</li>
                    <li><strong className="text-slate-700">Do not use</strong> a washing machine or tumble dryer.</li>
                    <li>Air dry in the shade. Do not wring or twist.</li>
                  </ul>
                  <p className="text-[10px] text-kora/80 font-semibold italic mt-3 bg-purple-50/50 p-2 border border-purple-100/50 rounded-lg">
                    *Player Version Jerseys: Require extra care due to lightweight performance fabric and heat-pressed details.
                  </p>
                </div>

                {/* Return Policy Card */}
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-white border border-slate-200/50 rounded-xl text-kora text-base">🛡️</span>
                    <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Vault Return Policy</h4>
                  </div>
                  <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside">
                    <li><strong className="text-rose-600">Custom Printed Jerseys:</strong> Jerseys with printed names or numbers are <strong className="text-rose-600">non-returnable and non-exchangeable</strong>.</li>
                    <li><strong className="text-slate-700">Non-Printed Jerseys:</strong> Exchange only if unused, unwashed, in original packaging, and tags attached.</li>
                    <li><strong className="text-slate-700">Exchange Fee:</strong> A flat 25 AED delivery fee applies to all exchange requests.</li>
                    <li><strong className="text-slate-700">Refund Policy:</strong> Refund processed only if you receive a damaged item.</li>
                  </ul>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
                    <span>⏱️ Claim Window: Within 48 hours</span>
                    <span className="text-kora">3-4 days processing</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 pdp-mobile-animate">
              {/* Mobile Stats Summary */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-kora/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-kora tracking-widest block mb-0.5">Average Intel</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black font-display leading-none">{avgRatingDisplay || "0.0"}</span>
                      <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                    </div>
                    <div className="flex text-yellow-400 text-[10px] gap-0.5 mt-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400" : "text-slate-700"} />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-kora tracking-widest block mb-0.5">TOTAL REVIEWS</span>
                    <span className="text-2xl font-black font-display text-white block leading-none">{product.reviews?.length || 0}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">Verified Ratings</span>
                  </div>
                </div>
              </div>

              {/* Mobile Rating Filters (Horizontal Scrollable Chips) */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                <button
                  onClick={() => setRatingFilter(null)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    ratingFilter === null
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  All ({product.reviews?.length || 0})
                </button>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = product.reviews ? product.reviews.filter((r: any) => r.rating === rating).length : 0;
                  return (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        ratingFilter === rating
                          ? "bg-kora border-kora text-white shadow-sm shadow-kora/25"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        {rating} <FaStar className="text-[10px] text-yellow-500 fill-yellow-500" />
                      </span>
                      <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Review input */}
              {!clerkUser ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6 text-center shadow-xs">
                  <FiLock className="mx-auto text-slate-400 text-2xl mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Want to drop a review?</h3>
                  <p className="text-xs text-slate-400 mb-4">You must be logged in to share your kit experience.</p>
                  <SignInButton mode="modal">
                    <button className="w-full bg-slate-900 active:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm">
                      Sign In to Review
                    </button>
                  </SignInButton>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">Drop a Review</h3>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Tap stars to rate</span>
                  </div>
                  <div className="mb-4"><StarPicker size="text-lg" /></div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How was the fit and quality? Add your experience to the vault."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora mb-4 h-24 resize-none text-xs"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !reviewText.trim()}
                    className="w-full bg-slate-900 active:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-40 shadow-md transform-gpu active:scale-95"
                  >
                    {isSubmitting ? "Dropping Intel..." : "Submit Review"}
                  </button>
                </div>
              )}

              {/* Active Filter Indicator */}
              {ratingFilter !== null && (
                <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl">
                  <span className="text-xs text-slate-600 font-bold">
                    Showing only {ratingFilter}-star reviews ({filteredReviews.length})
                  </span>
                  <button onClick={() => setRatingFilter(null)} className="text-slate-400 hover:text-slate-900">
                    <FiX className="text-base" />
                  </button>
                </div>
              )}

              {/* Reviews list */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review: any) => {
                    const isReviewerAdmin = review.user?.email === "mahramh40@gmail.com" || review.user?.email === "korastore.ae@gmail.com";
                    const reviewerName = isReviewerAdmin ? "Kora Store" : (review.user?.firstName || "Vault Member");
                    const helpfulKey = review.id;
                    const votes = helpfulVotes[helpfulKey] || { yes: review.id.charCodeAt(0) % 6, voted: null };

                    const isEditing = editingReviewId === review.id;

                    const handleHelpfulClick = () => {
                      if (votes.voted === 'yes') return;
                      setHelpfulVotes({
                        ...helpfulVotes,
                        [helpfulKey]: { yes: votes.yes + 1, voted: 'yes' }
                      });
                    };

                    return (
                      <div key={review.id} className="relative bg-white border border-slate-100 rounded-3xl p-5 shadow-xs overflow-hidden pdp-mobile-animate animate-fade-in-up">
                        {review.hasPurchased && !isReviewerAdmin && (
                          <div className="absolute right-4 bottom-4 opacity-[0.03] pointer-events-none select-none hidden sm:block">
                            <span className="text-3xl font-black tracking-widest text-slate-900 uppercase border-[3px] border-slate-900 px-2 py-0.5 rounded-lg transform rotate-12 inline-block">
                              VERIFIED ORDER
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <AvatarDisplay
                              imageUrl={isReviewerAdmin ? "/icon.png" : review.user?.imageUrl}
                              name={reviewerName}
                              selectedAvatar={isReviewerAdmin ? null : review.user?.selectedAvatar}
                              customProfilePic={isReviewerAdmin ? null : review.user?.customProfilePic}
                              size="w-9 h-9"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-slate-900 flex items-center gap-0.5">
                                  {reviewerName}
                                  {isReviewerAdmin && <VerifiedTick />}
                                </p>
                                {review.hasPurchased && !isReviewerAdmin && (
                                  <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                                    <FiCheck className="stroke-[3px]" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex text-yellow-400 text-[10px] gap-0.5 mt-0.5">
                                {[...Array(review.rating || 5)].map((_, i) => <FaStar key={i} />)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(review.createdAt).toLocaleDateString()}
                              {review.edited && (
                                <span className="text-[9px] text-slate-400 italic ml-1 select-none">(edited)</span>
                              )}
                            </span>
                            
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                                title="Delete Review"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            )}

                            {review.userId === currentUserId && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingReviewId(review.id);
                                  setEditRating(review.rating);
                                  setEditComment(review.comment);
                                }}
                                className="text-slate-400 hover:text-kora p-1 transition-colors"
                                title="Edit Review"
                              >
                                <FiEdit className="text-xs" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Review Edit Block */}
                        {isEditing ? (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-3">
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  className="focus:outline-none hover:scale-110 transition-transform"
                                >
                                  <FaStar className={`text-base ${star <= editRating ? "text-yellow-400" : "text-slate-200"}`} />
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-kora mb-3 resize-none h-20"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditReview(review.id)}
                                disabled={isEditingSubmitting || !editComment.trim()}
                                className="bg-kora text-white text-[10px] font-bold uppercase py-2 px-4 rounded-xl shadow-xs disabled:opacity-50"
                              >
                                {isEditingSubmitting ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={() => setEditingReviewId(null)}
                                className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase py-2 px-4 rounded-xl hover:border-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed mb-4">{review.comment}</p>
                        )}

                        {/* Official Admin Reply display */}
                        {review.adminReply && (
                          <div className="mt-4 pl-3.5 border-l-2 border-kora/40 bg-slate-50 p-3 rounded-r-2xl relative overflow-hidden flex gap-2.5 items-start">
                            <img src="/icon.png" alt="Kora Store" className="w-6 h-6 rounded-full border border-kora/30 object-cover shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-1 flex-wrap mb-1">
                                <span className="text-[9px] font-black uppercase text-kora tracking-wider">OFFICIAL VAULT REPLY</span>
                                <VerifiedTick />
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setReplyingReviewId(review.id);
                                      setReplyText(review.adminReply);
                                    }}
                                    className="text-[9px] text-slate-400 hover:text-kora font-bold uppercase underline ml-auto transition-colors"
                                  >
                                    Edit Reply
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{review.adminReply}</p>
                            </div>
                          </div>
                        )}

                        {/* Admin Reply Action button if no reply exists */}
                        {isAdmin && !review.adminReply && replyingReviewId !== review.id && (
                          <button
                            onClick={() => {
                              setReplyingReviewId(review.id);
                              setReplyText("");
                            }}
                            className="inline-flex items-center gap-1 mt-3 text-[10px] text-slate-400 hover:text-kora font-bold uppercase transition-colors"
                          >
                            <FiCornerDownRight className="text-[11px]" />
                            <span>Reply to review</span>
                          </button>
                        )}

                        {/* Admin Reply Text Editor */}
                        {replyingReviewId === review.id && (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type official shop reply..."
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-kora mb-2 resize-none h-16 bg-white"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReplyReview(review.id)}
                                disabled={isReplyingSubmitting}
                                className="bg-slate-900 hover:bg-kora text-white text-[10px] font-bold uppercase py-2 px-4 rounded-xl transition-all shadow-xs"
                              >
                                {isReplyingSubmitting ? "Posting..." : "Post Reply"}
                              </button>
                              {review.adminReply && (
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this reply?")) {
                                      setReplyText("");
                                      setIsReplyingSubmitting(true);
                                      fetch("/api/reviews", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ reviewId: review.id, action: "reply", replyText: null })
                                      }).then(() => {
                                        setReplyingReviewId(null);
                                        router.refresh();
                                      }).finally(() => setIsReplyingSubmitting(false));
                                    }
                                  }}
                                  className="bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase py-2 px-4 rounded-xl"
                                >
                                  Delete
                                </button>
                              )}
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase py-2 px-4 rounded-xl"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}


                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <p className="text-xs text-slate-400 italic">No {ratingFilter ? `${ratingFilter}-star ` : ""}reviews found.</p>
                  {ratingFilter !== null && (
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="mt-3 text-xs text-kora font-bold underline uppercase tracking-wider"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom CTA bar ── */}
      <div className="pdp-sticky-cta">
        <div className="flex gap-3 items-center">
          {/* Quantity selector */}
          <div className={`flex items-center border border-slate-200 rounded-xl h-12 overflow-hidden shrink-0 ${product.stock === 0 ? "opacity-40" : ""}`}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={product.stock === 0}
              className="w-10 h-12 flex items-center justify-center text-slate-500 text-lg font-bold active:bg-slate-50 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-black text-slate-900 text-sm">{product.stock === 0 ? 0 : quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={product.stock === 0 || quantity >= product.stock}
              className="w-10 h-12 flex items-center justify-center text-slate-500 text-lg font-bold active:bg-slate-50 transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Add to vault button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || (!selectedSize && product.sizes?.length > 0) || isAdded}
            className={`flex-1 h-12 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              product.stock === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isAdded
                ? "bg-emerald-500 text-white"
                : selectedSize || !product.sizes?.length
                ? "bg-kora text-white active:bg-purple-700 shadow-lg shadow-kora/30"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {product.stock === 0
              ? "Sold Out"
              : !selectedSize && product.sizes?.length > 0
              ? "Select a Size"
              : isAdded
              ? "✓ Added to Vault!"
              : "Add to Vault"}
          </button>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  //  DESKTOP LAYOUT  (≥ 768px — completely unchanged from original)
  // ──────────────────────────────────────────────────────────────────────────
  const DesktopView = (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-6 pb-24 px-8 relative overflow-hidden">
      {/* Decorative gradient blobs for ambient background lighting */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-kora/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-2/3 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Sleek Breadcrumb back button */}
        <Link href="/shop" className="group inline-flex items-center gap-2.5 text-slate-400 hover:text-kora transition-colors mb-6 font-bold text-xs uppercase tracking-widest">
          <FaChevronLeft className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Vault</span>
        </Link>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start mb-10">
          
          {/* LEFT: Image Showcase */}
          <div className="lg:col-span-7 flex gap-6 items-start sticky top-24">
            
            {/* Vertical thumbnails list */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3.5 shrink-0 scrollbar-hide max-h-[600px] overflow-y-auto pr-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-20 h-20 rounded-2xl border bg-slate-50 flex items-center justify-center overflow-hidden transition-all duration-300 relative group ${
                      activeImageIndex === i
                        ? "border-kora border-2 shadow-md shadow-kora/20 scale-[1.02]"
                        : "border-slate-200/80 hover:border-slate-300 hover:scale-[1.02]"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${i + 1}`} 
                      className="w-14 h-14 object-contain transition-opacity duration-300 group-hover:opacity-100" 
                    />
                    <div className={`absolute inset-0 bg-kora/5 transition-opacity duration-300 ${activeImageIndex === i ? "opacity-100" : "opacity-0"}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Right side of Left Column: Main Showcase & Trust Badges */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Main Showcase Box with Zoom-on-Hover */}
              <div 
                className="w-full aspect-[4/5] bg-slate-50 rounded-[32px] border border-slate-200/60 flex items-center justify-center relative overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 p-0 cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-kora/10 via-transparent to-pink-500/5 opacity-40 z-0"></div>
                {images.length > 0 ? (
                  <img
                    src={images[activeImageIndex] || images[0]}
                    alt={product.name}
                    className="relative z-10 w-full h-full object-cover transition-transform duration-200 select-none pointer-events-none"
                    style={
                      isZooming
                        ? {
                            transform: "scale(1.8)",
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : { transform: "scale(1)", transformOrigin: "center" }
                    }
                  />
                ) : (
                  <div className="relative z-10 text-slate-400 font-sans">No Image Available</div>
                )}

                {/* Category pill indicator */}
                <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-xs border border-slate-200/50 rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-xs z-20">
                  {categoryLabel}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-col gap-5 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-5 p-6 bg-slate-50 border border-slate-200/50 rounded-3xl shadow-xs">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm">
                    <FaTruckFast className="text-2xl text-kora" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-slate-800 uppercase tracking-widest leading-tight">UAE Delivery within 48 Hours</span>
                    <span className="block text-xs text-slate-400 font-medium mt-1">Priority local shipping directly to your doorstep</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-6 bg-slate-50 border border-slate-200/50 rounded-3xl shadow-xs">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm">
                    <FaShieldAlt className="text-2xl text-kora" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-slate-800 uppercase tracking-widest leading-tight">7-Day Satisfaction Guarantee</span>
                    <span className="block text-xs text-slate-400 font-medium mt-1">Hassle-free vault returns and quality-checked replacements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Category tag */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-kora/10 border border-kora/20 text-kora text-[10px] font-black tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-kora animate-pulse"></span>
                {categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-slate-900 mb-3.5 uppercase leading-none font-display">
              {product.name}
            </h1>

            {/* Ratings Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex text-yellow-400 text-sm gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" : "text-slate-200"} />
                ))}
              </div>
              {avgRatingDisplay && (
                <span className="text-sm font-black text-slate-900 font-display">{avgRatingDisplay}</span>
              )}
              <button 
                onClick={() => {
                  setActiveTab("reviews");
                  const reviewsEl = document.getElementById("reviews-section-ref");
                  if (reviewsEl) {
                    reviewsEl.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs text-slate-500 hover:text-kora font-bold underline underline-offset-4 transition-colors uppercase tracking-wider"
              >
                ({product.reviews?.length || 0} Reviews)
              </button>
            </div>

            {/* Pricing & Stock Status capsule */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 mb-8 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Price</span>
                <span className="text-3xl font-extrabold text-slate-900 font-display">
                  {CURRENCY}{parseFloat(product.price) + (hasFifaPatch ? 10 : 0) + printUpcharge}
                </span>
              </div>
              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Sold Out
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Only {product.stock} Left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <p className="text-slate-600 leading-relaxed text-sm font-sans mb-8">
              {product.description || "Premium gear sourced directly from Kora Store's exclusive vault."}
            </p>

            {/* Style Variation Selector (Boots) */}
            {product.category === "Boots" && images.length > 0 && (
              <div className="mb-8 font-sans">
                <h3 className="text-slate-950 font-black uppercase tracking-wider text-xs mb-3.5">
                  Select Style / Variation
                </h3>
                <div className="flex flex-wrap gap-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center p-1 bg-slate-50 overflow-hidden transition-all duration-300 relative group ${
                        activeImageIndex === i
                          ? "border-kora shadow-md shadow-kora/20 scale-105"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={img} alt={`Style ${i + 1}`} className="w-full h-full object-contain" />
                      <div className={`absolute inset-0 bg-kora/5 transition-opacity ${activeImageIndex === i ? "opacity-100" : "opacity-0"}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-8 font-sans">
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="text-slate-950 font-black uppercase tracking-wider text-xs">Select Size</h3>
                {hasCustomSizeChart ? (
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-kora hover:text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group cursor-pointer focus:outline-none"
                  >
                    Size Guide <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </button>
                ) : (
                  <Link href="/faq" className="text-kora hover:text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group">
                    Size Guide <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={product.stock === 0}
                      className={`w-14 h-12 rounded-xl font-bold text-sm border transition-all duration-300 relative flex items-center justify-center ${
                        product.stock === 0
                          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                          : selectedSize === size
                          ? "bg-kora border-kora text-white shadow-md shadow-kora/25 scale-[1.02]"
                          : "bg-white border-slate-200 text-slate-600 hover:border-kora/50 hover:text-kora shadow-sm hover:scale-[1.02]"
                      }`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl">One Size</span>
                )}
              </div>
            </div>

            {/* Custom Personalization (Shirts Only) */}
            {renderDesktopPersonalizationBox()}

            {/* Add to Vault Row */}
            <div className="flex gap-4 mb-8 h-14 font-sans">
              {/* Quantity */}
              <div className={`flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl px-2.5 w-32 shrink-0 shadow-sm ${product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all text-lg font-bold disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="font-bold text-slate-900 text-sm">{product.stock === 0 ? 0 : quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock === 0 || quantity >= product.stock}
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Add to Vault button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (!selectedSize && product.sizes?.length > 0) || isAdded}
                className={`flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md h-full flex items-center justify-center gap-2 transform-gpu active:scale-98 ${
                  product.stock === 0
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    : isAdded
                    ? "bg-emerald-500 text-white shadow-emerald-500/25"
                    : selectedSize || !product.sizes?.length
                    ? "bg-slate-900 text-white hover:bg-kora hover:scale-[1.01] shadow-lg hover:shadow-kora/25"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {product.stock === 0 ? (
                  <span>Sold Out</span>
                ) : !selectedSize && product.sizes?.length > 0 ? (
                  <span>Select a Size</span>
                ) : isAdded ? (
                  <>
                    <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Added to Vault!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Add to Vault</span>
                  </>
                )}
              </button>
            </div>



          </div>
        </div>

        {/* BOTTOM SECTION: DETAILS & REVIEWS TABS */}
        <div id="reviews-section-ref" className="max-w-4xl mx-auto mt-10 pt-8 border-t border-slate-100">
          <div className="flex gap-8 border-b border-slate-200 mb-8 font-bold uppercase">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-sm tracking-widest transition-all border-b-2 font-black ${
                activeTab === "details" ? "border-kora text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              The Intel
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-sm tracking-widest transition-all border-b-2 font-black ${
                activeTab === "reviews" ? "border-kora text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === "details" && (
              <div className="animate-fade-in-up space-y-8 font-sans">
                <p className="text-slate-600 leading-relaxed text-sm">
                  Every kit inside Kora Store is rigorously quality-checked before dispatch. We bypass traditional retail channels to bring you absolute 1:1 specifications.
                </p>
                
                {/* Specifications Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">FIT & CUT</span>
                    <span className="text-slate-800 font-bold text-sm">Athletic Cut</span>
                    <p className="text-slate-400 text-xs leading-normal">Standard athletic fit. Size up if selecting a Player Issue version for a looser fit.</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">MATERIAL</span>
                    <span className="text-slate-800 font-bold text-sm">100% Polyester</span>
                    <p className="text-slate-400 text-xs leading-normal">Recycled high-performance polyester with advanced sweat-wicking knit technology.</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">CARE</span>
                    <span className="text-slate-800 font-bold text-sm">Hand Wash Only</span>
                    <p className="text-slate-400 text-xs leading-normal">Wash cold, do not use washing machine or dryer. Shade dry only to preserve prints.</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">ORIGIN</span>
                    <span className="text-slate-800 font-bold text-sm">Vault Standard</span>
                    <p className="text-slate-400 text-xs leading-normal">Bypassing traditional retail margins to source the highest authentic grade direct.</p>
                  </div>
                </div>

                {/* Policy & Care Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Wash Care Card */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="p-2.5 bg-white border border-slate-200/50 rounded-xl text-kora text-lg">🧼</span>
                      <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Wash & Care Instructions</h4>
                    </div>
                    <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside">
                      <li><strong className="text-slate-700">Hand wash only</strong> using cold water.</li>
                      <li>Use a small amount of mild detergent.</li>
                      <li>Wash gently. <strong className="text-slate-700">Do not scrub</strong> the prints or logos.</li>
                      <li><strong className="text-slate-700">Do not use</strong> a washing machine or tumble dryer.</li>
                      <li>Air dry in the shade. Do not wring or twist the jersey.</li>
                    </ul>
                    <p className="text-[10px] text-kora/80 font-semibold italic mt-3.5 bg-purple-50/50 p-2.5 border border-purple-100/50 rounded-xl">
                      *Player Version Jerseys: Require extra care due to lightweight performance fabric and heat-pressed details.
                    </p>
                  </div>

                  {/* Return Policy Card */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="p-2.5 bg-white border border-slate-200/50 rounded-xl text-kora text-lg">🛡️</span>
                      <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">Vault Return Policy</h4>
                    </div>
                    <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside">
                      <li><strong className="text-rose-600">Custom Printed Jerseys:</strong> Jerseys with printed names or numbers are <strong className="text-rose-600">non-returnable and non-exchangeable</strong>.</li>
                      <li><strong className="text-slate-700">Non-Printed Jerseys:</strong> Exchange only if unused, unwashed, in original packaging, and tags attached.</li>
                      <li><strong className="text-slate-700">Exchange Fee:</strong> A flat 25 AED delivery fee applies to all exchange requests.</li>
                      <li><strong className="text-slate-700">Refund Policy:</strong> Refund processed only if you receive a damaged item.</li>
                    </ul>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3.5 flex items-center justify-between border-t border-slate-200/60 pt-3">
                      <span>⏱️ Claim Window: Within 48 hours</span>
                      <span className="text-kora">3-4 days processing</span>
                    </p>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in-up space-y-10 font-sans">
                {/* 2-Column Reviews Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  
                  {/* Card 1: Average Score */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:border-kora/20 transition-all duration-300">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">AVERAGE INTEL</span>
                    <span className="text-6xl font-black text-slate-900 font-display mb-1.5">
                      {avgRatingDisplay || "0.0"}
                    </span>
                    <div className="flex text-yellow-400 text-sm gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      Based on {product.reviews?.length || 0} reviews
                    </span>
                  </div>

                  {/* Card 2: Interactive Star Breakdown */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs hover:border-kora/20 transition-all duration-300 flex flex-col justify-center">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3.5 block text-center">RATING BREAKDOWN</span>
                    <div className="space-y-2.5">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = product.reviews ? product.reviews.filter((r: any) => r.rating === rating).length : 0;
                        const percent = product.reviews?.length ? (count / product.reviews.length) * 100 : 0;
                        const isActiveFilter = ratingFilter === rating;

                        return (
                          <button
                            key={rating}
                            onClick={() => setRatingFilter(isActiveFilter ? null : rating)}
                            className={`flex items-center gap-3 text-xs text-slate-500 w-full hover:bg-slate-100/80 p-1.5 rounded-lg transition-all ${
                              isActiveFilter ? "bg-kora/5 text-kora font-black animate-pulse" : ""
                            }`}
                          >
                            <span className="w-3 shrink-0 text-left font-bold">{rating}</span>
                            <FaStar className={`text-[10px] ${isActiveFilter ? "text-kora" : "text-yellow-400"}`} />
                            <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isActiveFilter ? "bg-kora" : "bg-yellow-400"
                                }`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="w-6 text-right shrink-0 font-medium">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Drop a Review Box */}
                {!clerkUser ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center shadow-xs flex flex-col items-center justify-center min-h-[220px]">
                    <FiLock className="text-slate-400 text-3xl mb-3 animate-pulse" />
                    <h3 className="text-base font-black uppercase text-slate-900 tracking-wide mb-1">Join the Vault to Review</h3>
                    <p className="text-slate-400 text-xs mb-5 max-w-xs">Sign in to share your rating and order feedback with other members.</p>
                    <SignInButton mode="modal">
                      <button className="bg-slate-900 hover:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3 px-8 rounded-xl transition-all shadow-sm">
                        Sign In to Review
                      </button>
                    </SignInButton>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-kora/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-black uppercase text-slate-900 tracking-wide">Drop a Review</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Share your kit experience with the vault community.</p>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Tap stars to rate</span>
                    </div>
                    <div className="mb-4"><StarPicker size="text-xl" /></div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="How was the fit and quality? Add your experience to the vault."
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora mb-4 h-24 resize-none shadow-sm text-sm"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || !reviewText.trim()}
                      className="bg-slate-900 hover:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-kora/25 active:scale-95 transform-gpu"
                    >
                      {isSubmitting ? "Dropping Intel..." : "Submit Review"}
                    </button>
                  </div>
                )}

                {/* Active Filter Indicator */}
                {ratingFilter !== null && (
                  <div className="flex items-center justify-between bg-slate-50 border border-kora/20 px-5 py-3 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <FiFilter className="text-kora text-base" />
                      <span className="text-sm text-slate-700 font-bold">
                        Showing only {ratingFilter}-star reviews ({filteredReviews.length} found)
                      </span>
                    </div>
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      Clear Filter <FiX className="text-base" />
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6 pt-6">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review: any) => {
                      const isReviewerAdmin = review.user?.email === "mahramh40@gmail.com" || review.user?.email === "korastore.ae@gmail.com";
                      const reviewerName = isReviewerAdmin ? "Kora Store" : (review.user?.firstName || "Vault Member");
                      const helpfulKey = review.id;
                      const votes = helpfulVotes[helpfulKey] || { yes: review.id.charCodeAt(0) % 6, voted: null };

                      const isEditing = editingReviewId === review.id;

                      const handleHelpfulClick = () => {
                        if (votes.voted === 'yes') return;
                        setHelpfulVotes({
                          ...helpfulVotes,
                          [helpfulKey]: { yes: votes.yes + 1, voted: 'yes' }
                        });
                      };

                      return (
                        <div key={review.id} className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-200/80 overflow-hidden animate-fade-in-up">
                          {review.hasPurchased && !isReviewerAdmin && (
                            <div className="absolute right-6 bottom-4 opacity-[0.03] pointer-events-none select-none">
                              <span className="text-4xl font-black tracking-widest text-slate-900 uppercase border-4 border-slate-900 px-3 py-1 rounded-xl transform rotate-12 inline-block">
                                VERIFIED ORDER
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3.5">
                              <AvatarDisplay
                                imageUrl={isReviewerAdmin ? "/icon.png" : review.user?.imageUrl}
                                name={reviewerName}
                                selectedAvatar={isReviewerAdmin ? null : review.user?.selectedAvatar}
                                customProfilePic={isReviewerAdmin ? null : review.user?.customProfilePic}
                                size="w-11 h-11"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-slate-900 font-bold font-sans text-sm flex items-center gap-0.5">
                                    {reviewerName}
                                    {isReviewerAdmin && <VerifiedTick />}
                                  </p>
                                  {review.hasPurchased && !isReviewerAdmin && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      <FiCheck className="stroke-[2px]" /> Verified Purchaser
                                    </span>
                                  )}
                                </div>
                                <div className="flex text-yellow-400 text-xs gap-0.5 mt-1">
                                  {[...Array(review.rating || 5)].map((_, i) => <FaStar key={i} />)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 font-sans font-medium">
                                {new Date(review.createdAt).toLocaleDateString()}
                                {review.edited && (
                                  <span className="text-[10px] text-slate-400 italic ml-1.5 select-none">(edited)</span>
                                )}
                              </span>

                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                                  title="Delete Review"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              )}

                              {review.userId === currentUserId && !isEditing && (
                                <button
                                  onClick={() => {
                                    setEditingReviewId(review.id);
                                    setEditRating(review.rating);
                                    setEditComment(review.comment);
                                  }}
                                  className="text-slate-400 hover:text-kora p-1 transition-colors"
                                  title="Edit Review"
                                >
                                  <FiEdit className="text-sm" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inline Review Edit Block */}
                          {isEditing ? (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-4 ml-14">
                              <div className="flex items-center gap-1.5 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="focus:outline-none hover:scale-110 transition-transform"
                                  >
                                    <FaStar className={`text-lg ${star <= editRating ? "text-yellow-400" : "text-slate-200"}`} />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-kora mb-3 resize-none h-24"
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleEditReview(review.id)}
                                  disabled={isEditingSubmitting || !editComment.trim()}
                                  className="bg-kora hover:bg-purple-700 text-white text-xs font-bold uppercase py-2.5 px-6 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                                >
                                  {isEditingSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                  onClick={() => setEditingReviewId(null)}
                                  className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase py-2.5 px-6 rounded-xl hover:border-slate-300 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-600 text-sm leading-relaxed pl-14 mb-4">{review.comment}</p>
                          )}

                          {/* Official Admin Reply display */}
                          {review.adminReply && (
                            <div className="mt-4 ml-14 pl-4 border-l-2 border-kora/40 bg-slate-50 p-4 rounded-r-2xl relative overflow-hidden flex gap-3.5 items-start animate-fade-in-up">
                              <img src="/icon.png" alt="Kora Store" className="w-8 h-8 rounded-full border border-kora/30 object-cover shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                  <span className="text-[10px] font-black uppercase text-kora tracking-widest">OFFICIAL VAULT REPLY</span>
                                  <VerifiedTick />
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setReplyingReviewId(review.id);
                                        setReplyText(review.adminReply);
                                      }}
                                      className="text-xs text-slate-400 hover:text-kora font-bold uppercase underline ml-auto transition-colors"
                                    >
                                      Edit Reply
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">{review.adminReply}</p>
                              </div>
                            </div>
                          )}

                          {/* Admin Reply Action button if no reply exists */}
                          {isAdmin && !review.adminReply && replyingReviewId !== review.id && (
                            <button
                              onClick={() => {
                                setReplyingReviewId(review.id);
                                setReplyText("");
                              }}
                              className="inline-flex items-center gap-1.5 mt-3 ml-14 text-xs text-slate-400 hover:text-kora font-bold uppercase transition-colors"
                            >
                              <FiCornerDownRight className="text-xs" />
                              <span>Reply to review</span>
                            </button>
                          )}

                          {/* Admin Reply Text Editor */}
                          {replyingReviewId === review.id && (
                            <div className="mt-3 ml-14 p-4 bg-slate-50 border border-slate-200 rounded-3xl animate-fade-in-up">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type official shop reply..."
                                className="w-full border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-kora mb-3 resize-none h-20 bg-white"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReplyReview(review.id)}
                                  disabled={isReplyingSubmitting}
                                  className="bg-slate-900 hover:bg-kora text-white text-xs font-bold uppercase py-2.5 px-6 rounded-xl transition-all shadow-xs"
                                >
                                  {isReplyingSubmitting ? "Posting..." : "Post Reply"}
                                </button>
                                {review.adminReply && (
                                  <button
                                    onClick={() => {
                                      if (confirm("Delete this reply?")) {
                                        setReplyText("");
                                        setIsReplyingSubmitting(true);
                                        fetch("/api/reviews", {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ reviewId: review.id, action: "reply", replyText: null })
                                        }).then(() => {
                                          setReplyingReviewId(null);
                                          router.refresh();
                                        }).finally(() => setIsReplyingSubmitting(false));
                                      }
                                    }}
                                    className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase py-2.5 px-6 rounded-xl"
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  onClick={() => setReplyingReviewId(null)}
                                  className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase py-2.5 px-6 rounded-xl"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 border border-dashed border-slate-200 bg-slate-50/50 rounded-3xl">
                      <p className="text-slate-400 italic text-sm">No {ratingFilter ? `${ratingFilter}-star ` : ""}reviews found.</p>
                      {ratingFilter !== null && (
                        <button
                          onClick={() => setRatingFilter(null)}
                          className="mt-4 text-xs bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-kora transition-colors uppercase tracking-wider"
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );

  return (
    <>
      {/* Mobile layout — shown only on screens < 768px */}
      <div className="block md:hidden">
        {MobileView}
      </div>
      {/* Desktop layout — shown only on screens ≥ 768px */}
      <div className="hidden md:block">
        {DesktopView}
      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSizeChartOpen(false)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white rounded-[32px] border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden p-6 sm:p-8 animate-fade-in-up z-10 font-sans">
            {/* Close Button */}
            <button
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase text-kora tracking-widest bg-kora/10 px-2.5 py-0.5 rounded-sm">Official Spec</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">{product.name} Size Chart</h3>
              <p className="text-slate-400 text-xs mt-1">Detailed flat-lay measurements to help you find your perfect fit.</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  {isChartA ? (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="px-4 py-3.5">Size</th>
                      <th className="px-4 py-3.5">Height (in)</th>
                      <th className="px-4 py-3.5">Height (cm)</th>
                      <th className="px-4 py-3.5">Width (in)</th>
                      <th className="px-4 py-3.5">Width (cm)</th>
                    </tr>
                  ) : (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="px-4 py-3.5">Size</th>
                      <th className="px-4 py-3.5">Length (in)</th>
                      <th className="px-4 py-3.5">Width (in)</th>
                      <th className="px-4 py-3.5">Length (cm)</th>
                      <th className="px-4 py-3.5">Width (cm)</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {isChartA ? (
                    <>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">S</td>
                        <td className="px-4 py-3">28 in</td>
                        <td className="px-4 py-3">71.1 cm</td>
                        <td className="px-4 py-3">18 in</td>
                        <td className="px-4 py-3">45.7 cm</td>
                      </tr>
                      <tr className="bg-slate-50/30 hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">M</td>
                        <td className="px-4 py-3">28.5 in</td>
                        <td className="px-4 py-3">72.4 cm</td>
                        <td className="px-4 py-3">19 in</td>
                        <td className="px-4 py-3">48.3 cm</td>
                      </tr>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">L</td>
                        <td className="px-4 py-3">29 in</td>
                        <td className="px-4 py-3">73.7 cm</td>
                        <td className="px-4 py-3">20 in</td>
                        <td className="px-4 py-3">50.8 cm</td>
                      </tr>
                      <tr className="bg-slate-50/30 hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">XL</td>
                        <td className="px-4 py-3">29.5 in</td>
                        <td className="px-4 py-3">74.9 cm</td>
                        <td className="px-4 py-3">21 in</td>
                        <td className="px-4 py-3">53.3 cm</td>
                      </tr>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">XXL</td>
                        <td className="px-4 py-3">30 in</td>
                        <td className="px-4 py-3">76.2 cm</td>
                        <td className="px-4 py-3">22 in</td>
                        <td className="px-4 py-3">55.9 cm</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">S</td>
                        <td className="px-4 py-3">27</td>
                        <td className="px-4 py-3">19</td>
                        <td className="px-4 py-3">68.6 cm</td>
                        <td className="px-4 py-3">48.3 cm</td>
                      </tr>
                      <tr className="bg-slate-50/30 hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">M</td>
                        <td className="px-4 py-3">27.5</td>
                        <td className="px-4 py-3">19.5</td>
                        <td className="px-4 py-3">69.9 cm</td>
                        <td className="px-4 py-3">49.5 cm</td>
                      </tr>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">L</td>
                        <td className="px-4 py-3">29.5</td>
                        <td className="px-4 py-3">20.5</td>
                        <td className="px-4 py-3">74.9 cm</td>
                        <td className="px-4 py-3">52.1 cm</td>
                      </tr>
                      <tr className="bg-slate-50/30 hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">XL</td>
                        <td className="px-4 py-3">30</td>
                        <td className="px-4 py-3">21</td>
                        <td className="px-4 py-3">76.2 cm</td>
                        <td className="px-4 py-3">53.3 cm</td>
                      </tr>
                      <tr className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3 text-kora font-black">XXL</td>
                        <td className="px-4 py-3">31</td>
                        <td className="px-4 py-3">22</td>
                        <td className="px-4 py-3">78.7 cm</td>
                        <td className="px-4 py-3">55.9 cm</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer info */}
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-800">Note:</strong> These measurements are taken when the jersey is laid flat. Sizing is standard athletic fit. If you prefer a looser style or select a Player Issue kit, we suggest ordering one size larger than your usual fit.
            </div>
          </div>
        </div>
      )}
    </>
  );
}