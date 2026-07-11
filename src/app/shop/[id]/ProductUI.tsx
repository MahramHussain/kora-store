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
import { useTranslation } from "@/context/LanguageContext";

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
  const { t } = useTranslation();
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
            <div className="px-4 py-3 text-xs text-slate-400 italic text-center">{t("no_options_available")}</div>
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
  const { t, language } = useTranslation();
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
  const [sellerNote, setSellerNote] = useState("");
  const { addToCart } = useCart();
  const { user: clerkUser } = useUser();
  const currentUserId = clerkUser?.id;
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress;
  const isAdmin = clerkEmail === "mahramh40@gmail.com" || clerkEmail === "korastore.ae@gmail.com";
  const [isAdded, setIsAdded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const getSizeStock = (size: string): number => {
    if (!product.sizeStocks || product.sizeStocks.length === 0) {
      return product.stock;
    }
    const match = product.sizeStocks.find((s: any) => s.size === size);
    return match ? match.quantity : 0;
  };
  const activeSizeStock = selectedSize ? getSizeStock(selectedSize) : product.stock;

  // Personalization states
  const [personalizationTab, setPersonalizationTab] = useState<"none" | "custom" | "player">("none");
  const [leftSleevePatch, setLeftSleevePatch] = useState("");
  const [rightSleevePatch, setRightSleevePatch] = useState("");
  const hasFifaPatch = leftSleevePatch !== "" || rightSleevePatch !== "";
  const [selectedPresetPlayer, setSelectedPresetPlayer] = useState<{ name: string; number: string } | null>(null);
  const presetPlayers = getPresetPlayersForProduct(product.name);
  const isKit = product.category === "Shirts" || product.category === "Retro Kits";

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
    if (!isKit) return null;

    const playerOptions = presetPlayers.map((player: { name: string; number: string }) => ({
      value: JSON.stringify(player),
      label: `${player.name} (#${player.number})`
    }));

    return (
      <div className="space-y-6 mb-8 text-start">
        {/* Name & Number Printing Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 font-sans shadow-sm">
          <div className="flex items-start gap-4">
            {/* Jersey Icon */}
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-sm shrink-0">
              <JerseyPrintIcon className="w-7 h-7 text-kora" />
            </div>

            <div>
              <h3 className="text-slate-900 font-extrabold text-base leading-tight">{t("name_number_printing")}</h3>
              <p className="text-slate-400 text-xs mt-1">{t("name_number_printing_desc")}</p>
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
                  : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-xs"
              }`}
            >
              <span>{t("player_name_upcharge").replace("{currency}", t("aed"))}</span>
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
              <span>{t("custom_name_upcharge").replace("{currency}", t("aed"))}</span>
            </button>
          </div>

          {/* Player Name Select Dropdown */}
          {personalizationTab === "player" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              {presetPlayers.length > 0 ? (
                <div className="text-start">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2.5 tracking-widest text-start">{t("select_player_print")}</label>
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
                    placeholder={t("select_a_player")}
                  />
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic text-start">{t("no_preset_players")}</p>
              )}
            </div>
          )}

          {/* Custom Name Inputs */}
          {personalizationTab === "custom" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              <div className="flex gap-3 text-start">
                <div className="flex-1 text-start">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-start">{t("name")}</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                    placeholder={t("custom_name_placeholder")}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold tracking-wider text-slate-900 text-start"
                  />
                </div>
                <div className="w-24 text-start">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-start">{t("number")}</label>
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
              <p className="text-[10px] text-slate-400 italic text-start">{t("custom_print_detail")}</p>
              <p className="text-[10px] text-kora font-black uppercase tracking-wider bg-purple-50 border border-purple-100/60 p-2.5 rounded-xl flex items-center justify-between mt-3 text-start">
                <span>{t("custom_player_printing")}</span>
                <span>{t("plus_25").replace("{currency}", t("aed"))}</span>
              </p>
            </div>
          )}
        </div>

        {/* Sleeve Patches Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 font-sans shadow-sm text-start">
          <div className="flex items-center justify-between gap-4 text-start">
            <div className="flex items-center gap-4 text-start">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-sm shrink-0">
                <SleevePatchIcon className="w-7 h-7 text-kora" />
              </div>
              <div className="text-start">
                <h3 className="text-slate-900 font-extrabold text-base leading-tight">{t("sleeve_patches")}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{t("sleeve_patches_desc")}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-xs">
              {t("plus_10").replace("{currency}", t("aed"))}
            </div>
          </div>

          <div className="flex gap-3 mt-5 text-start">
            {/* Right Sleeve Dropdown */}
            <CustomSelect
              value={rightSleevePatch}
              onChange={setRightSleevePatch}
              options={RIGHT_SLEEVE_PATCH_OPTIONS}
              placeholder={t("right_patch")}
              className="flex-1 min-w-0 text-start"
            />

            {/* Left Sleeve Dropdown */}
            <CustomSelect
              value={leftSleevePatch}
              onChange={setLeftSleevePatch}
              options={LEFT_SLEEVE_PATCH_OPTIONS}
              placeholder={t("left_patch")}
              className="flex-1 min-w-0 text-start"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalizationBox = () => {
    if (!isKit) return null;

    const playerOptions = presetPlayers.map((player: { name: string; number: string }) => ({
      value: JSON.stringify(player),
      label: `${player.name} (#${player.number})`
    }));

    return (
      <div className="space-y-4 mb-6 text-start">
        {/* Name & Number Printing Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 font-sans shadow-xs">
          <div className="flex items-start gap-4 text-start">
            {/* Jersey Icon */}
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-xs shrink-0">
              <JerseyPrintIcon className="w-7 h-7 text-kora" />
            </div>

            <div className="text-start">
              <h3 className="text-slate-900 font-extrabold text-[15px] leading-tight">{t("name_number_printing")}</h3>
              <p className="text-slate-400 text-xs mt-1 text-start">{t("name_number_printing_desc")}</p>
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
              <span>{t("player_name_upcharge").replace("{currency}", t("aed"))}</span>
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
              <span>{t("custom_name_upcharge").replace("{currency}", t("aed"))}</span>
            </button>
          </div>

          {/* Player Dropdown */}
          {personalizationTab === "player" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              {presetPlayers.length > 0 ? (
                <div className="text-start">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2.5 tracking-widest text-start">{t("select_player_print")}</label>
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
                    placeholder={t("select_a_player")}
                  />
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic text-start">{t("no_preset_players")}</p>
              )}
            </div>
          )}

          {/* Custom Name Inputs */}
          {personalizationTab === "custom" && (
            <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
              <div className="flex gap-3 text-start">
                <div className="flex-1 text-start">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-start">{t("name")}</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                    placeholder={t("custom_name_placeholder")}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold tracking-wider text-start"
                  />
                </div>
                <div className="w-24 text-start">
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-start">{t("number")}</label>
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
              <p className="text-[10px] text-slate-400 italic text-start">{t("custom_print_detail")}</p>
              <p className="text-[10px] text-kora font-black uppercase tracking-wider bg-purple-50 border border-purple-100/60 p-2.5 rounded-xl flex items-center justify-between mt-3 text-start">
                <span>{t("custom_player_printing")}</span>
                <span>{t("plus_25").replace("{currency}", t("aed"))}</span>
              </p>
            </div>
          )}
        </div>

        {/* Sleeve Patches Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 font-sans shadow-xs text-start">
          <div className="flex items-center justify-between gap-4 text-start">
            <div className="flex items-center gap-4 text-start">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center shadow-xs shrink-0">
                <SleevePatchIcon className="w-7 h-7 text-kora" />
              </div>
              <div className="text-start">
                <h3 className="text-slate-900 font-extrabold text-[15px] leading-tight">{t("sleeve_patches")}</h3>
                <p className="text-slate-400 text-xs mt-1 text-start">{t("sleeve_patches_desc")}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs">
              {t("plus_10").replace("{currency}", t("aed"))}
            </div>
          </div>

          <div className="flex gap-3 mt-5 text-start">
            {/* Right Sleeve Dropdown */}
            <CustomSelect
              value={rightSleevePatch}
              onChange={setRightSleevePatch}
              options={RIGHT_SLEEVE_PATCH_OPTIONS}
              placeholder={t("right_patch")}
              className="flex-1 min-w-0 text-start"
            />

            {/* Left Sleeve Dropdown */}
            <CustomSelect
              value={leftSleevePatch}
              onChange={setLeftSleevePatch}
              options={LEFT_SLEEVE_PATCH_OPTIONS}
              placeholder={t("left_patch")}
              className="flex-1 min-w-0 text-start"
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

  const isPreset = isKit && selectedPresetPlayer !== null;
  const hasCustomPrint = isKit && (customName.trim() !== "" || customNumber.trim() !== "");
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

  // Scroll to top on mount to prevent page loading scrolled down
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Limit quantity if selected size changes or activeSizeStock updates
  useEffect(() => {
    if (selectedSize) {
      const maxStock = getSizeStock(selectedSize);
      if (quantity > maxStock) {
        setQuantity(Math.max(1, maxStock));
      }
    }
  }, [selectedSize]);

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
    const printUpcharge = isKit && hasCustomPrint ? (isPreset ? 15 : 25) : 0;
    const finalPrice = basePrice + (isKit && hasFifaPatch ? 10 : 0) + printUpcharge;

    const patchString = isKit && hasFifaPatch
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
      sellerNote: sellerNote.trim() || undefined,
    });
    
    setIsAdded(true);
    setCustomName("");
    setCustomNumber("");
    setSelectedPresetPlayer(null);
    setLeftSleevePatch("");
    setRightSleevePatch("");
    setPersonalizationTab("none");
    setSellerNote("");
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
    if (!confirm(t("confirm_delete_review"))) return;
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
      {/* ── Back button in normal flow ── */}
      <div className="bg-white border-b border-slate-200/60 px-4 py-3.5 flex items-center justify-between font-sans">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-kora transition-colors uppercase tracking-wider"
        >
          <FaChevronLeft className="text-[10px]" />
          <span>{t("back_to_shop")}</span>
        </Link>
        {/* Stock badge */}
        {product.stock === 0 ? (
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 bg-rose-500 text-white rounded-full shadow-xs">
            {t("sold_out")}
          </span>
        ) : product.stock <= 3 ? (
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 bg-amber-500 text-white rounded-full shadow-xs animate-pulse">
            {t("only_left").replace("{count}", String(product.stock))}
          </span>
        ) : null}
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
            {t("no_image_available")}
          </div>
        )}
      </div>

      {/* ── White card content area ── */}
      <div className="pdp-info-card pdp-mobile-animate">

        {/* Category + Name + Rating row */}
        <div className="mb-4">
          <span className="text-kora text-[10px] font-bold uppercase tracking-widest">{categoryLabel}</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight mt-1 uppercase">
            {t(product.id) !== product.id 
              ? t(product.id) 
              : (language === "ar" && product.nameAr ? product.nameAr : product.name)}
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
              ({product.reviews?.length || 0} {t("reviews")})
            </span>
          </div>
        </div>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
          <div className="flex items-baseline gap-2">
            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through font-medium">
                {t("aed")}{parseFloat(product.originalPrice).toFixed(0)}
              </span>
            )}
            <span className="text-3xl font-black text-slate-900">
              {t("aed")}{parseFloat(product.price)}
            </span>
          </div>
          {product.stock === 0 ? (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full">
              {t("sold_out")}
            </span>
          ) : product.stock <= 3 ? (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full animate-pulse">
              {t("only_left").replace("{count}", String(product.stock))}
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {t("in_stock")}
            </span>
          )}
        </div>

        {/* Style Variation Selector (Boots) */}
        {product.category === "Boots" && images.length > 1 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">{t("style_variation_label")}</p>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">{t("gallery_label")}</p>
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
          <div className="flex items-center justify-between mb-3 text-start">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("select_size")}</p>
            {hasCustomSizeChart ? (
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="text-[10px] font-bold text-kora uppercase tracking-wider cursor-pointer focus:outline-none"
              >
                {t("size_guide")} {language === "ar" ? "←" : "→"}
              </button>
            ) : (
              <Link href="/faq" className="text-[10px] font-bold text-kora uppercase tracking-wider">
                {t("size_guide")} {language === "ar" ? "←" : "→"}
              </Link>
            )}
          </div>
          {product.sizes && product.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-start">
              {product.sizes.map((size: string) => {
                const sizeStock = getSizeStock(size);
                const isSoldOut = sizeStock === 0;
                return (
                  <button
                    key={size}
                    onClick={() => !isSoldOut && setSelectedSize(size)}
                    disabled={isSoldOut}
                    className={`px-3.5 py-2 flex flex-col items-center justify-center min-w-[60px] h-14 border rounded-xl transition-all duration-300 ${
                      isSoldOut
                        ? "opacity-35 bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                        : selectedSize === size
                        ? "bg-kora border-kora text-white shadow-md shadow-kora/25 scale-[1.02]"
                        : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-xs"
                    }`}
                  >
                    <span className="font-extrabold text-sm uppercase">{size}</span>
                    <span className={`text-[8px] mt-0.5 font-bold uppercase ${selectedSize === size ? "text-white/80" : sizeStock <= 3 ? "text-amber-500 font-extrabold" : "text-slate-400"}`}>
                      {isSoldOut ? "Out" : `${sizeStock}`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("one_size")}</p>
          )}
          {selectedSize && (
            <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
              Stock available for size {selectedSize}: <span className="font-bold text-slate-800">{getSizeStock(selectedSize)} units</span>
            </p>
          )}
        </div>

        {/* Custom Printing (Shirts only) */}
        {renderPersonalizationBox()}

        {/* Note For Seller */}
        <div className="mb-6 text-start">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {t("note_for_seller_title")}
          </label>
          <textarea
            value={sellerNote}
            onChange={(e) => setSellerNote(e.target.value)}
            placeholder={t("note_for_seller_item_placeholder")}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-xs resize-none h-20 text-start"
            maxLength={500}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            {t(product.id + "_desc") !== product.id + "_desc" 
              ? t(product.id + "_desc") 
              : (language === "ar" && product.descriptionAr ? product.descriptionAr : (product.description || t("premium_gear_sourced")))}
          </p>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="pdp-trust-badge text-start">
            <FaTruckFast className="text-kora text-base shrink-0" />
            <span>{t("uae_delivery_48")}</span>
          </div>
          <div className="pdp-trust-badge text-start">
            <FaShieldAlt className="text-kora text-base shrink-0" />
            <span>{t("guarantee_7day")}</span>
          </div>
        </div>

        {/* ── Tabs: Details + Reviews ── */}
        <div className="border-t border-slate-100 pt-6 text-start">
          <div className="flex gap-6 border-b border-slate-100 mb-5 text-start">
            <button
              onClick={() => setActiveTab("details")}
              className={`pdp-tab ${activeTab === "details" ? "pdp-tab-active" : ""}`}
            >
              {t("the_intel")}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pdp-tab ${activeTab === "reviews" ? "pdp-tab-active" : ""}`}
            >
              {t("reviews")} ({product.reviews?.length || 0})
            </button>
          </div>

          {activeTab === "details" && (
            <div className="text-slate-500 text-sm leading-relaxed space-y-6 pdp-mobile-animate text-start">
              <p>{t("every_kit_checked")}</p>
              <ul className="space-y-2.5 text-start">
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">{t("fit_label")}:</span> {t("fit_desc_mobile")}</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">{t("material_label")}:</span> {t("material_desc_mobile")}</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">{t("care_label")}:</span> {t("care_desc_mobile")}</li>
              </ul>

              {/* Mobile Policy & Care Details */}
              <div className="grid grid-cols-1 gap-4 mt-6 text-start">
                {/* Wash Care Card */}
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-xs text-start">
                  <div className="flex items-center gap-3 mb-3 text-start">
                    <span className="p-2 bg-white border border-slate-200/50 rounded-xl text-kora text-base">🧼</span>
                    <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">{t("wash_instructions")}</h4>
                  </div>
                  <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside text-start">
                    <li><strong className="text-slate-700">{t("wash_detail_1")}</strong></li>
                    <li>{t("wash_detail_2")}</li>
                    <li>{t("wash_detail_3")}</li>
                    <li>{t("wash_detail_4")}</li>
                    <li>{t("wash_detail_5")}</li>
                  </ul>
                  <p className="text-[10px] text-kora/80 font-semibold italic mt-3 bg-purple-50/50 p-2 border border-purple-100/50 rounded-lg text-start">
                    {t("player_version_care")}
                  </p>
                </div>

                {/* Return Policy Card */}
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-xs text-start">
                  <div className="flex items-center gap-3 mb-3 text-start">
                    <span className="p-2 bg-white border border-slate-200/50 rounded-xl text-kora text-base">🛡️</span>
                    <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">{t("return_policy")}</h4>
                  </div>
                  <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside text-start">
                    <li>{t("policy_detail_1")}</li>
                    <li>{t("policy_detail_2")}</li>
                    <li>{t("policy_detail_3")}</li>
                    <li>{t("policy_detail_4")}</li>
                  </ul>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 flex flex-col gap-1.5 border-t border-slate-200/60 pt-2.5 text-start">
                    <span>⏱️ {t("claim_window_title")}</span>
                    <span className="text-kora">📦 {t("processing_time_title")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 pdp-mobile-animate">
              {/* Mobile Stats Summary */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden text-start">
                <div className="absolute top-0 right-0 w-32 h-32 bg-kora/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex items-center justify-between text-start">
                  <div>
                    <span className="text-[9px] font-black uppercase text-kora tracking-widest block mb-0.5">{t("average_intel_title")}</span>
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
                  <div className="text-right rtl:text-left">
                    <span className="text-[9px] font-black uppercase text-kora tracking-widest block mb-0.5">{t("total_reviews_label")}</span>
                    <span className="text-2xl font-black font-display text-white block leading-none">{product.reviews?.length || 0}</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">{t("verified_ratings_label")}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Rating Filters (Horizontal Scrollable Chips) */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 text-start">
                <button
                  onClick={() => setRatingFilter(null)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    ratingFilter === null
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t("all")} ({product.reviews?.length || 0})
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
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{t("want_review")}</h3>
                  <p className="text-xs text-slate-400 mb-4">{t("review_login_desc")}</p>
                  <SignInButton mode="modal">
                    <button className="w-full bg-slate-900 active:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm">
                      {t("sign_in_review")}
                    </button>
                  </SignInButton>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden text-start">
                  <div className="flex items-center justify-between mb-4 text-start">
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">{t("drop_review")}</h3>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{t("tap_stars")}</span>
                  </div>
                  <div className="mb-4 text-start"><StarPicker size="text-lg" /></div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t("review_textarea_placeholder")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora mb-4 h-24 resize-none text-xs text-start"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !reviewText.trim()}
                    className="w-full bg-slate-900 active:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-40 shadow-md transform-gpu active:scale-95 text-center"
                  >
                    {isSubmitting ? t("submitting_review") : t("submit_review")}
                  </button>
                </div>
              )}

              {/* Active Filter Indicator */}
              {ratingFilter !== null && (
                <div className="flex items-center justify-between bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl text-start">
                  <span className="text-xs text-slate-600 font-bold">
                    {t("showing_only_stars").replace("{rating}", String(ratingFilter)).replace("{count}", String(filteredReviews.length))}
                  </span>
                  <button onClick={() => setRatingFilter(null)} className="text-slate-400 hover:text-slate-900">
                    <FiX className="text-base" />
                  </button>
                </div>
              )}

              {/* Reviews list */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-4 text-start">
                  {filteredReviews.map((review: any) => {
                    const isReviewerAdmin = review.user?.email === "mahramh40@gmail.com" || review.user?.email === "korastore.ae@gmail.com";
                    const reviewerName = isReviewerAdmin ? "Kora Store" : (review.user?.firstName || "Customer");
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
                      <div key={review.id} className="relative bg-white border border-slate-100 rounded-3xl p-5 shadow-xs overflow-hidden pdp-mobile-animate animate-fade-in-up text-start">
                        {review.hasPurchased && !isReviewerAdmin && (
                          <div className="absolute right-4 bottom-4 opacity-[0.03] pointer-events-none select-none hidden sm:block">
                            <span className="text-3xl font-black tracking-widest text-slate-900 uppercase border-[3px] border-slate-900 px-2 py-0.5 rounded-lg transform rotate-12 inline-block">
                              {t("verified_order")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-3 relative z-10 text-start">
                          <div className="flex items-center gap-3 text-start">
                            <AvatarDisplay
                              imageUrl={isReviewerAdmin ? "/icon.png" : review.user?.imageUrl}
                              name={reviewerName}
                              selectedAvatar={isReviewerAdmin ? null : review.user?.selectedAvatar}
                              customProfilePic={isReviewerAdmin ? null : review.user?.customProfilePic}
                              size="w-9 h-9"
                            />
                            <div className="text-start">
                              <div className="flex items-center gap-1.5 flex-wrap text-start">
                                <p className="text-xs font-bold text-slate-900 flex items-center gap-0.5">
                                  {reviewerName}
                                  {isReviewerAdmin && <VerifiedTick />}
                                </p>
                                {review.hasPurchased && !isReviewerAdmin && (
                                  <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                                    <FiCheck className="stroke-[3px]" /> {t("verified_purchaser_label")}
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
                                <span className="text-[9px] text-slate-400 italic ml-1 select-none">{t("edited_label")}</span>
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
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-3 text-start">
                            <div className="flex items-center gap-1 mb-2 text-start">
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
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-kora mb-3 resize-none h-20 text-start"
                            />
                            <div className="flex gap-2 text-start">
                              <button
                                onClick={() => handleEditReview(review.id)}
                                disabled={isEditingSubmitting || !editComment.trim()}
                                className="bg-kora text-white text-[10px] font-bold uppercase py-2 px-4 rounded-xl shadow-xs disabled:opacity-50"
                              >
                                {isEditingSubmitting ? t("saving_label") : t("save")}
                              </button>
                              <button
                                onClick={() => setEditingReviewId(null)}
                                className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase py-2 px-4 rounded-xl hover:border-slate-300"
                              >
                                {t("cancel_label")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed mb-4 text-start">{review.comment}</p>
                        )}

                        {/* Official Admin Reply display */}
                        {review.adminReply && (
                          <div className="mt-4 pl-3.5 border-l-2 border-kora/40 bg-slate-50 p-3 rounded-r-2xl relative overflow-hidden flex gap-2.5 items-start text-start">
                            <img src="/icon.png" alt="Kora Store" className="w-6 h-6 rounded-full border border-kora/30 object-cover shrink-0 mt-0.5" />
                            <div className="flex-1 text-start">
                              <div className="flex items-center gap-1 flex-wrap mb-1 text-start">
                                <span className="text-[9px] font-black uppercase text-kora tracking-wider">{t("official_reply")}</span>
                                <VerifiedTick />
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setReplyingReviewId(review.id);
                                      setReplyText(review.adminReply);
                                    }}
                                    className="text-[9px] text-slate-400 hover:text-kora font-bold uppercase underline ml-auto transition-colors"
                                  >
                                    {t("edit_reply")}
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed text-start">{review.adminReply}</p>
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
                            className="inline-flex items-center gap-1 mt-3 text-[10px] text-slate-400 hover:text-kora font-bold uppercase transition-colors text-start"
                          >
                            <FiCornerDownRight className="text-[11px]" />
                            <span>{t("reply_to_review_label")}</span>
                          </button>
                        )}

                        {/* Admin Reply Text Editor */}
                        {replyingReviewId === review.id && (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-start">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={t("type_reply_placeholder")}
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-kora mb-2 resize-none h-16 bg-white text-start"
                            />
                            <div className="flex gap-2 text-start">
                              <button
                                onClick={() => handleReplyReview(review.id)}
                                disabled={isReplyingSubmitting}
                                className="bg-slate-900 hover:bg-kora text-white text-[10px] font-bold uppercase py-2 px-4 rounded-xl transition-all shadow-xs"
                              >
                                {isReplyingSubmitting ? t("posting_label") : t("post_reply_label")}
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
                                  {t("delete_label")}
                                </button>
                              )}
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase py-2 px-4 rounded-xl"
                              >
                                {t("cancel_label")}
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
                  <p className="text-xs text-slate-400 italic">{t("no_reviews_matching")}</p>
                  {ratingFilter !== null && (
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="mt-3 text-xs text-kora font-bold underline uppercase tracking-wider"
                    >
                      {t("clear_filter_label")}
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
              onClick={() => setQuantity(Math.min(activeSizeStock, quantity + 1))}
              disabled={product.stock === 0 || quantity >= activeSizeStock}
              className="w-10 h-12 flex items-center justify-center text-slate-500 text-lg font-bold active:bg-slate-50 transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || (product.sizes?.length > 0 && (!selectedSize || getSizeStock(selectedSize) === 0)) || isAdded}
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
              ? t("sold_out")
              : (product.sizes?.length > 0 && !selectedSize)
              ? t("select_size")
              : isAdded
              ? `✓ ${t("added_to_cart")}`
              : t("add_to_cart")}
          </button>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  //  DESKTOP LAYOUT  (≥ 768px — completely unchanged from original)
  // ──────────────────────────────────────────────────────────────────────────
  const DesktopView = (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-6 pb-24 px-8 relative overflow-hidden text-start">
      {/* Decorative gradient blobs for ambient background lighting */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-kora/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-2/3 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Sleek Breadcrumb back button */}
        <Link href="/shop" className="group inline-flex items-center gap-2.5 text-slate-400 hover:text-kora transition-colors mb-6 font-bold text-xs uppercase tracking-widest text-start">
          <FaChevronLeft className="transition-transform group-hover:-translate-x-1 rtl:rotate-180" />
          <span>{t("back_to_shop")}</span>
        </Link>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start mb-10 text-start">
          
          {/* LEFT: Image Showcase */}
          <div className="lg:col-span-7 flex gap-6 items-start sticky top-24">
            
            {/* Vertical thumbnails list */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3.5 shrink-0 scrollbar-hide max-h-[600px] overflow-y-auto pr-1 text-start">
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
            <div className="flex-1 flex flex-col gap-6 text-start">
              {/* Main Showcase Box with Zoom-on-Hover */}
              <div 
                className="w-full aspect-[4/5] bg-slate-50 rounded-[32px] border border-slate-200/60 flex items-center justify-center relative overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 p-0 cursor-zoom-in text-start"
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
                  <div className="relative z-10 text-slate-400 font-sans">{t("no_image_available")}</div>
                )}

                {/* Category pill indicator */}
                <div className="absolute top-5 ltr:right-5 rtl:left-5 bg-white/90 backdrop-blur-xs border border-slate-200/50 rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-xs z-20">
                  {categoryLabel}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 gap-4 text-start">
                <div className="bg-slate-50 border border-slate-200/60 rounded-3xl py-7 px-6 flex items-center gap-5 hover:border-kora/20 transition-all duration-300 group shadow-xs text-start">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-kora text-2xl shadow-xs group-hover:scale-110 transition-transform shrink-0">
                    <FaTruckFast />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs sm:text-sm">{t("uae_delivery_48")}</h4>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">{t("local_warehouse_dispatch")}</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 rounded-3xl py-7 px-6 flex items-center gap-5 hover:border-kora/20 transition-all duration-300 group shadow-xs text-start">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-kora text-2xl shadow-xs group-hover:scale-110 transition-transform shrink-0">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs sm:text-sm">{t("guarantee_7day")}</h4>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">{t("pre_shipping_quality_checks")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="lg:col-span-5 flex flex-col text-start">
            
            {/* Category tag */}
            <div className="mb-4">
              <span className="text-kora text-[10px] font-bold uppercase tracking-widest mb-1.5">{categoryLabel}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 mb-3.5 uppercase leading-none font-display text-start">
              {t(product.id) !== product.id 
                ? t(product.id) 
                : (language === "ar" && product.nameAr ? product.nameAr : product.name)}
            </h1>

            {/* Ratings Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 text-start">
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
                ({product.reviews?.length || 0} {t("reviews")})
              </button>
            </div>

            {/* Pricing & Stock Status capsule */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 mb-8 flex items-center justify-between shadow-xs text-start">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t("price_label")}</span>
                <div className="flex items-baseline gap-2">
                  {product.originalPrice && (
                    <span className="text-lg text-slate-400 line-through font-semibold">
                      {t("aed")}{parseFloat(product.originalPrice).toFixed(0)}
                    </span>
                  )}
                  <span className="text-3xl font-extrabold text-slate-900 font-display">
                    {t("aed")}{parseFloat(product.price)}
                  </span>
                </div>
              </div>
              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    {t("sold_out")}
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    {t("only_left").replace("{count}", String(product.stock))}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {t("in_stock")}
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <p className="text-slate-600 leading-relaxed text-sm font-sans mb-8">
              {t(product.id + "_desc") !== product.id + "_desc" 
                ? t(product.id + "_desc") 
                : (language === "ar" && product.descriptionAr ? product.descriptionAr : (product.description || t("premium_gear_sourced")))}
            </p>

            {/* Style Variation Selector (Boots) */}
            {product.category === "Boots" && images.length > 0 && (
              <div className="mb-8 font-sans">
                <h3 className="text-slate-950 font-black uppercase tracking-wider text-xs mb-3.5">
                  {t("style_variation")}
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
            <div className="mb-8 font-sans text-start">
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="text-slate-950 font-black uppercase tracking-wider text-xs">{t("select_size")}</h3>
                {hasCustomSizeChart ? (
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-kora hover:text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group cursor-pointer focus:outline-none"
                  >
                    {t("size_guide")} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </button>
                ) : (
                  <Link href="/faq" className="text-kora hover:text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group">
                    {t("size_guide")} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((size: string) => {
                    const sizeStock = getSizeStock(size);
                    const isSoldOut = sizeStock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => !isSoldOut && setSelectedSize(size)}
                        disabled={isSoldOut}
                        className={`w-16 h-14 rounded-xl font-bold border transition-all duration-300 flex flex-col items-center justify-center ${
                          isSoldOut
                            ? "opacity-35 bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                            : selectedSize === size
                            ? "bg-kora border-kora text-white shadow-md shadow-kora/25 scale-[1.02]"
                            : "bg-white border-slate-200 text-slate-600 hover:border-kora/50 hover:text-kora shadow-sm hover:scale-[1.02]"
                        }`}
                      >
                        <span className="font-extrabold text-sm uppercase">{size}</span>
                        <span className={`text-[8px] mt-0.5 font-bold uppercase ${selectedSize === size ? "text-white/80" : sizeStock <= 3 ? "text-amber-500 font-extrabold" : "text-slate-400"}`}>
                          {isSoldOut ? "Out" : `${sizeStock}`}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <span className="text-slate-500 text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl">One Size</span>
                )}
              </div>
              {selectedSize && (
                <p className="text-[10px] text-slate-400 font-medium mt-3.5">
                  Stock available for size {selectedSize}: <span className="font-bold text-slate-800">{getSizeStock(selectedSize)} units</span>
                </p>
              )}
            </div>

            {/* Custom Personalization (Shirts Only) */}
            {renderDesktopPersonalizationBox()}

            {/* Note For Seller */}
            <div className="mb-8 text-start">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t("note_for_seller_title")}
              </label>
              <textarea
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                placeholder={t("note_for_seller_item_placeholder")}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-xs resize-none h-20 text-start"
                maxLength={500}
              />
            </div>

            {/* Add to Cart Row */}
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
                  onClick={() => setQuantity(Math.min(activeSizeStock, quantity + 1))}
                  disabled={product.stock === 0 || quantity >= activeSizeStock}
                  className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (product.sizes?.length > 0 && (!selectedSize || getSizeStock(selectedSize) === 0)) || isAdded}
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
                  <span>{t("sold_out")}</span>
                ) : !selectedSize && product.sizes?.length > 0 ? (
                  <span>{t("select_size")}</span>
                ) : isAdded ? (
                  <>
                    <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("added_to_cart")}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t("add_to_cart")}</span>
                  </>
                )}
              </button>
            </div>



          </div>
        </div>

        {/* BOTTOM SECTION: DETAILS & REVIEWS TABS */}
        <div id="reviews-section-ref" className="max-w-4xl mx-auto mt-10 pt-8 border-t border-slate-100 text-start">
          <div className="flex gap-8 border-b border-slate-200 mb-8 font-bold uppercase text-start">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-sm tracking-widest transition-all border-b-2 font-black ${
                activeTab === "details" ? "border-kora text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t("the_intel")}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-sm tracking-widest transition-all border-b-2 font-black ${
                activeTab === "reviews" ? "border-kora text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t("reviews")} ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === "details" && (
              <div className="animate-fade-in-up space-y-8 font-sans text-start">
                <p className="text-slate-600 leading-relaxed text-sm text-start">
                  {t("every_kit_checked_desktop")}
                </p>
                
                {/* Specifications Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-start">
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2 text-start">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">{t("fit_cut_title")}</span>
                    <span className="text-slate-800 font-bold text-sm">{t("fit_cut_value")}</span>
                    <p className="text-slate-400 text-xs leading-normal">{t("fit_cut_desc")}</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2 text-start">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">{t("material_title")}</span>
                    <span className="text-slate-800 font-bold text-sm">{t("material_value")}</span>
                    <p className="text-slate-400 text-xs leading-normal">{t("material_desc")}</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2 text-start">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">{t("care_title")}</span>
                    <span className="text-slate-800 font-bold text-sm">{t("care_value")}</span>
                    <p className="text-slate-400 text-xs leading-normal">{t("care_desc")}</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2 text-start">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">{t("origin_title")}</span>
                    <span className="text-slate-800 font-bold text-sm">{t("origin_value")}</span>
                    <p className="text-slate-400 text-xs leading-normal">{t("origin_desc")}</p>
                  </div>
                </div>

                {/* Policy & Care Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-start">
                  {/* Wash Care Card */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs text-start">
                    <div className="flex items-center gap-3 mb-4 text-start">
                      <span className="p-2.5 bg-white border border-slate-200/50 rounded-xl text-kora text-lg">🧼</span>
                      <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">{t("wash_instructions")}</h4>
                    </div>
                    <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside text-start">
                      <li>{t("wash_detail_1")}</li>
                      <li>{t("wash_detail_2")}</li>
                      <li>{t("wash_detail_3")}</li>
                      <li>{t("wash_detail_4")}</li>
                      <li>{t("wash_detail_5")}</li>
                    </ul>
                    <p className="text-[10px] text-kora/80 font-semibold italic mt-3.5 bg-purple-50/50 p-2.5 border border-purple-100/50 rounded-xl text-start">
                      {t("player_version_care")}
                    </p>
                  </div>

                  {/* Return Policy Card */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs text-start">
                    <div className="flex items-center gap-3 mb-4 text-start">
                      <span className="p-2.5 bg-white border border-slate-200/50 rounded-xl text-kora text-lg">🛡️</span>
                      <h4 className="text-slate-900 font-black uppercase tracking-wider text-xs">{t("return_policy")}</h4>
                    </div>
                    <ul className="space-y-2 text-slate-500 text-xs leading-relaxed list-disc list-inside text-start">
                      <li>{t("policy_detail_1")}</li>
                      <li>{t("policy_detail_2")}</li>
                      <li>{t("policy_detail_3")}</li>
                      <li>{t("policy_detail_4")}</li>
                    </ul>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3.5 flex items-center justify-between border-t border-slate-200/60 pt-3 text-start">
                      <span>⏱️ {t("claim_window_title")}</span>
                      <span className="text-kora">{t("processing_time_title")}</span>
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
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">{t("average_intel_title")}</span>
                    <span className="text-6xl font-black text-slate-900 font-display mb-1.5">
                      {avgRatingDisplay || "0.0"}
                    </span>
                    <div className="flex text-yellow-400 text-sm gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      {t("based_on_reviews").replace("{count}", String(product.reviews?.length || 0))}
                    </span>
                  </div>

                  {/* Card 2: Interactive Star Breakdown */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs hover:border-kora/20 transition-all duration-300 flex flex-col justify-center text-start">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3.5 block text-center">{t("rating_breakdown_title")}</span>
                    <div className="space-y-2.5 text-start">
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
                            <span className="w-3 shrink-0 text-left rtl:text-right font-bold">{rating}</span>
                            <FaStar className={`text-[10px] ${isActiveFilter ? "text-kora" : "text-yellow-400"}`} />
                            <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isActiveFilter ? "bg-kora" : "bg-yellow-400"
                                }`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="w-6 text-right rtl:text-left shrink-0 font-medium">({count})</span>
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
                    <h3 className="text-base font-black uppercase text-slate-900 tracking-wide mb-1">{t("sign_in_review")}</h3>
                    <p className="text-slate-400 text-xs mb-5 max-w-xs">{t("review_login_desc")}</p>
                    <SignInButton mode="modal">
                      <button className="bg-slate-900 hover:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3 px-8 rounded-xl transition-all shadow-sm">
                        {t("sign_in_review")}
                      </button>
                    </SignInButton>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl shadow-xs relative overflow-hidden text-start">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-kora/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4 text-start">
                      <div className="text-start">
                        <h3 className="text-base font-black uppercase text-slate-900 tracking-wide">{t("drop_review")}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{t("drop_review_desc")}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t("tap_stars")}</span>
                    </div>
                    <div className="mb-4 text-start"><StarPicker size="text-xl" /></div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder={t("review_textarea_placeholder")}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora mb-4 h-24 resize-none shadow-sm text-sm text-start"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || !reviewText.trim()}
                      className="bg-slate-900 hover:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-kora/25 active:scale-95 transform-gpu"
                    >
                      {isSubmitting ? t("submitting_review") : t("submit_review")}
                    </button>
                  </div>
                )}

                {/* Active Filter Indicator */}
                {ratingFilter !== null && (
                  <div className="flex items-center justify-between bg-slate-50 border border-kora/20 px-5 py-3 rounded-2xl text-start">
                    <div className="flex items-center gap-2.5">
                      <FiFilter className="text-kora text-base" />
                      <span className="text-sm text-slate-700 font-bold">
                        {t("showing_only_stars").replace("{rating}", String(ratingFilter)).replace("{count}", String(filteredReviews.length))}
                      </span>
                    </div>
                    <button
                      onClick={() => setRatingFilter(null)}
                      className="text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      {t("clear_filter_label")} <FiX className="text-base" />
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6 pt-6">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review: any) => {
                      const isReviewerAdmin = review.user?.email === "mahramh40@gmail.com" || review.user?.email === "korastore.ae@gmail.com";
                      const reviewerName = isReviewerAdmin ? "Kora Store" : (review.user?.firstName || "Customer");
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
                                {t("verified_order")}
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
                                      <FiCheck className="stroke-[2px]" /> {t("verified_purchaser_label")}
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
                                  <span className="text-[10px] text-slate-400 italic ml-1.5 select-none">{t("edited_label")}</span>
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
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-4 ml-14 text-start">
                              <div className="flex items-center gap-1.5 mb-3 text-start">
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
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-kora mb-3 resize-none h-24 text-start"
                              />
                              <div className="flex gap-3 text-start">
                                <button
                                  onClick={() => handleEditReview(review.id)}
                                  disabled={isEditingSubmitting || !editComment.trim()}
                                  className="bg-kora hover:bg-purple-700 text-white text-xs font-bold uppercase py-2.5 px-6 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                                >
                                  {isEditingSubmitting ? t("saving_label") : t("save_changes_label")}
                                </button>
                                <button
                                  onClick={() => setEditingReviewId(null)}
                                  className="bg-white border border-slate-205 text-slate-600 text-xs font-bold uppercase py-2.5 px-6 rounded-xl hover:border-slate-350 transition-colors"
                                >
                                  {t("cancel_label")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-600 text-sm leading-relaxed pl-14 mb-4 text-start">{review.comment}</p>
                          )}

                          {/* Official Admin Reply display */}
                          {review.adminReply && (
                            <div className="mt-4 ml-14 pl-4 border-l-2 border-kora/40 bg-slate-50 p-4 rounded-r-2xl relative overflow-hidden flex gap-3.5 items-start animate-fade-in-up text-start">
                              <img src="/icon.png" alt="Kora Store" className="w-8 h-8 rounded-full border border-kora/30 object-cover shrink-0 mt-0.5" />
                              <div className="flex-1 text-start">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1.5 text-start">
                                  <span className="text-[10px] font-black uppercase text-kora tracking-widest">{t("official_reply")}</span>
                                  <VerifiedTick />
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setReplyingReviewId(review.id);
                                        setReplyText(review.adminReply);
                                      }}
                                      className="text-xs text-slate-400 hover:text-kora font-bold uppercase underline ml-auto transition-colors"
                                    >
                                      {t("edit_reply")}
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed text-start">{review.adminReply}</p>
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
                              className="inline-flex items-center gap-1.5 mt-3 ml-14 text-xs text-slate-400 hover:text-kora font-bold uppercase transition-colors text-start"
                            >
                              <FiCornerDownRight className="text-xs" />
                              <span>{t("reply_to_review_label")}</span>
                            </button>
                          )}

                          {/* Admin Reply Text Editor */}
                          {replyingReviewId === review.id && (
                            <div className="mt-3 ml-14 p-4 bg-slate-50 border border-slate-200 rounded-3xl animate-fade-in-up text-start">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={t("type_reply_placeholder")}
                                className="w-full border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-kora mb-3 resize-none h-20 bg-white text-start"
                              />
                              <div className="flex gap-2 text-start">
                                <button
                                  onClick={() => handleReplyReview(review.id)}
                                  disabled={isReplyingSubmitting}
                                  className="bg-slate-900 hover:bg-kora text-white text-xs font-bold uppercase py-2.5 px-6 rounded-xl transition-all shadow-xs"
                                >
                                  {isReplyingSubmitting ? t("posting_label") : t("post_reply_label")}
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
                                    {t("delete_label")}
                                  </button>
                                )}
                                <button
                                  onClick={() => setReplyingReviewId(null)}
                                  className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase py-2.5 px-6 rounded-xl"
                                >
                                  {t("cancel_label")}
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
            <div className="mb-6 text-start">
              <span className="text-[10px] font-black uppercase text-kora tracking-widest bg-kora/10 px-2.5 py-0.5 rounded-sm">{t("official_spec")}</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1 text-start">
                {t(product.id) !== product.id 
                  ? t(product.id) 
                  : (language === "ar" && product.nameAr ? product.nameAr : product.name)} {t("size_chart")}
              </h3>
              <p className="text-slate-400 text-xs mt-1 text-start">{t("size_chart_desc")}</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl text-start">
              <table className="w-full border-collapse text-left rtl:text-right text-xs sm:text-sm">
                <thead>
                  {isChartA ? (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider text-start">
                      <th className="px-4 py-3.5 text-start">{t("size_label")}</th>
                      <th className="px-4 py-3.5 text-start">{t("height_in")}</th>
                      <th className="px-4 py-3.5 text-start">{t("height_cm")}</th>
                      <th className="px-4 py-3.5 text-start">{t("width_in")}</th>
                      <th className="px-4 py-3.5 text-start">{t("width_cm")}</th>
                    </tr>
                  ) : (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider text-start">
                      <th className="px-4 py-3.5 text-start">{t("size_label")}</th>
                      <th className="px-4 py-3.5 text-start">{t("length_in")}</th>
                      <th className="px-4 py-3.5 text-start">{t("width_in")}</th>
                      <th className="px-4 py-3.5 text-start">{t("length_cm")}</th>
                      <th className="px-4 py-3.5 text-start">{t("width_cm")}</th>
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
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-[11px] text-slate-500 leading-relaxed text-start">
              <strong className="text-slate-800">{t("note_label")}:</strong> {t("size_chart_footer_note")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}