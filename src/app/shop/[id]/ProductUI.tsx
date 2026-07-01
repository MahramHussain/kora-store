"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CURRENCY } from "@/lib/constants";
import Link from "next/link";
import { FaChevronLeft, FaStar, FaTruckFast } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { FiEdit, FiAward, FiThumbsUp, FiFilter, FiX, FiCheck, FiMessageSquare, FiTrash2, FiCornerDownRight } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";

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
    className="w-4.5 h-4.5 text-[#6b00ff] fill-current inline-block shrink-0 align-middle ml-1 select-none"
    viewBox="0 0 22 22"
    aria-label="Verified Account"
  >
    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
  </svg>
);

// Sizing or customization helper constants

const PRESET_PLAYERS: Record<string, Array<{ name: string; number: string }>> = {
  "ARGENTINA AWAY": [{ name: "MESSI", number: "10" }],
  "BRAZIL AWAY": [{ name: "NEYMAR", number: "10" }, { name: "VINI", number: "7" }, { name: "RAPHINHA", number: "11" }],
  "FRANCE AWAY": [{ name: "MBAPPE", number: "10" }, { name: "OLISE", number: "11" }, { name: "DEMBELE", number: "7" }],
  "PORTUGAL AWAY": [{ name: "RONALDO", number: "7" }],
  "SPAIN AWAY": [{ name: "LAMINE YAMAL", number: "19" }, { name: "PEDRI", number: "20" }],
  "ARGENTINA HOME": [{ name: "MESSI", number: "10" }],
  "BRAZIL HOME": [{ name: "NEYMAR", number: "10" }],
  "FRANCE HOME": [{ name: "MBAPPE", number: "10" }, { name: "DEMBELE", number: "7" }],
  "PORTUGAL HOME": [{ name: "RONALDO", number: "7" }],
  "SPAIN HOME": [{ name: "LAMINE YAMAL", number: "19" }, { name: "PEDRI", number: "20" }],
};

const getPresetPlayersForProduct = (productName: string) => {
  const normalized = productName.toUpperCase().replace(/\s+KIT$/i, "").trim();
  return PRESET_PLAYERS[normalized] || [];
};

export default function ProductUI({ product }: { product: any }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
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
  const [hasFifaPatch, setHasFifaPatch] = useState(false);
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

    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 mb-8 font-sans shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center text-slate-800 shadow-sm shrink-0">
            <svg className="w-6 h-6 text-kora" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .54-.438.976-.977.976H5.216c-.732 0-1.393.479-1.579 1.186L2.01 12.872a1.082 1.082 0 00.938 1.348h2.091c.484 0 .903.327 1.018.799l2.128 8.79c.121.5.57.844 1.086.844h5.474c.516 0 .965-.344 1.086-.844l2.128-8.79c.115-.472.534-.799 1.018-.799h2.091a1.082 1.082 0 00.938-1.348l-1.627-6.362c-.186-.707-.847-1.186-1.579-1.186h-3.557c-.539 0-.977-.436-.977-.976V3.104c0-.573-.464-1.037-1.036-1.037H10.786c-.572 0-1.036.464-1.036 1.037z" />
            </svg>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-kora tracking-widest bg-kora/10 px-2.5 py-0.5 rounded-sm">Bespoke Lab</span>
            <h3 className="text-slate-900 font-extrabold text-base leading-tight mt-1">Kit Personalisation</h3>
            <p className="text-slate-400 text-xs mt-0.5">Add custom name & number, or official sleeve patches</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setPersonalizationTab(personalizationTab === "custom" ? "none" : "custom");
              setSelectedPresetPlayer(null);
              setCustomName("");
              setCustomNumber("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 ${
              personalizationTab === "custom"
                ? "bg-kora border-kora text-white shadow-md shadow-kora/25"
                : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-xs"
            }`}
          >
            <FiEdit className="text-sm shrink-0" />
            <span>Add Name & Number</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPersonalizationTab(personalizationTab === "player" ? "none" : "player");
              setSelectedPresetPlayer(null);
              setCustomName("");
              setCustomNumber("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 ${
              personalizationTab === "player"
                ? "bg-kora border-kora text-white shadow-md shadow-kora/25"
                : "bg-white border-slate-200 text-slate-700 hover:border-kora/50 hover:text-kora hover:shadow-xs"
            }`}
          >
            <FiAward className="text-sm shrink-0" />
            <span>Add Player/Patches</span>
          </button>
        </div>

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
                  placeholder="e.g. MESSI"
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
            <p className="text-[10px] text-slate-400 italic">Bespoke hot-pressed vinyl printing. Handcrafted in-house.</p>
            <p className="text-[10px] text-kora font-black uppercase tracking-wider bg-purple-50 border border-purple-100/60 p-2.5 rounded-xl flex items-center justify-between mt-3">
              <span>✨ Custom Player Printing</span>
              <span>+25 DHS</span>
            </p>
          </div>
        )}

        {personalizationTab === "player" && (
          <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
            {presetPlayers.length > 0 && (
              <div className="pb-3 border-b border-slate-200/60">
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-3 tracking-widest">Select Player Print (+15 DHS)</label>
                <div className="grid grid-cols-2 gap-2">
                  {presetPlayers.map((player: { name: string; number: string }) => {
                    const isSelected = selectedPresetPlayer?.name === player.name;
                    return (
                      <button
                        key={player.name}
                        type="button"
                        onClick={() => handleSelectPresetPlayer(player)}
                        className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-98 flex items-center justify-between ${
                          isSelected
                            ? "bg-kora border-kora text-white shadow-sm shadow-kora/25"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate">{player.name}</span>
                        <span className={`text-[10px] ml-1.5 shrink-0 ${isSelected ? "text-purple-200" : "text-slate-400"}`}>#{player.number}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Sleeve Badge (Optional)</label>
              <button
                type="button"
                onClick={() => setHasFifaPatch(!hasFifaPatch)}
                className={`w-full py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-98 flex items-center justify-between shadow-xs hover:shadow-sm ${
                  hasFifaPatch
                    ? "bg-kora border-kora text-white shadow-sm shadow-kora/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <FiAward className={`text-base shrink-0 ${hasFifaPatch ? "text-white" : "text-kora"}`} />
                  <div>
                    <span className="block font-bold">FIFA World Cup Badge Set</span>
                    <span className={`block text-[10px] font-medium ${hasFifaPatch ? "text-purple-200" : "text-slate-400"}`}>Official right and left sleeve badges</span>
                  </div>
                </div>
                <span className={hasFifaPatch ? "text-white font-extrabold" : "text-kora font-black"}>+10 DHS</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPersonalizationBox = () => {
    if (product.category !== "Shirts") return null;

    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 mb-6 font-sans shadow-xs">
        <div className="flex items-start gap-4">
          {/* Jersey Icon */}
          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200/60 flex items-center justify-center text-slate-800 shadow-xs shrink-0">
            <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .54-.438.976-.977.976H5.216c-.732 0-1.393.479-1.579 1.186L2.01 12.872a1.082 1.082 0 00.938 1.348h2.091c.484 0 .903.327 1.018.799l2.128 8.79c.121.5.57.844 1.086.844h5.474c.516 0 .965-.344 1.086-.844l2.128-8.79c.115-.472.534-.799 1.018-.799h2.091a1.082 1.082 0 00.938-1.348l-1.627-6.362c-.186-.707-.847-1.186-1.579-1.186h-3.557c-.539 0-.977-.436-.977-.976V3.104c0-.573-.464-1.037-1.036-1.037H10.786c-.572 0-1.036.464-1.036 1.037z" />
            </svg>
          </div>

          <div>
            <h3 className="text-slate-900 font-extrabold text-[15px] leading-tight">Personalise your kit</h3>
            <p className="text-slate-400 text-xs mt-1">Add your name and number or select sleeve patches</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={() => {
              setPersonalizationTab(personalizationTab === "custom" ? "none" : "custom");
              setSelectedPresetPlayer(null);
              setCustomName("");
              setCustomNumber("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 ${
              personalizationTab === "custom"
                ? "bg-[#6B00FF] border-[#6B00FF] text-white shadow-md shadow-[#6B00FF]/25"
                : "bg-white border-slate-200 text-slate-700 hover:border-[#6B00FF]/50 hover:text-[#6B00FF] hover:shadow-sm hover:shadow-[#6B00FF]/10"
            }`}
          >
            <FiEdit className="text-sm shrink-0" />
            <span>Add your own</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPersonalizationTab(personalizationTab === "player" ? "none" : "player");
              setSelectedPresetPlayer(null);
              setCustomName("");
              setCustomNumber("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 transform-gpu hover:-translate-y-0.5 active:scale-95 ${
              personalizationTab === "player"
                ? "bg-[#6B00FF] border-[#6B00FF] text-white shadow-md shadow-[#6B00FF]/25"
                : "bg-white border-slate-200 text-slate-700 hover:border-[#6B00FF]/50 hover:text-[#6B00FF] hover:shadow-sm hover:shadow-[#6B00FF]/10"
            }`}
          >
            <FiAward className="text-sm shrink-0" />
            <span>Player/Patches</span>
          </button>
        </div>

        {/* Sub-panels */}
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
                  placeholder="e.g. MESSI"
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
            <p className="text-[10px] text-[#6B00FF] font-black uppercase tracking-wider bg-purple-50 border border-purple-100/60 p-2.5 rounded-xl flex items-center justify-between mt-3">
              <span>✨ Custom Player Printing</span>
              <span>+25 DHS</span>
            </p>
          </div>
        )}

        {personalizationTab === "player" && (
          <div className="mt-5 pt-5 border-t border-slate-200/60 space-y-4 animate-fade-in-up">
            {presetPlayers.length > 0 && (
              <div className="pb-3 border-b border-slate-200/60">
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2.5 tracking-widest">Select Player Print (+15 DHS)</label>
                <div className="grid grid-cols-2 gap-2">
                  {presetPlayers.map((player: { name: string; number: string }) => {
                    const isSelected = selectedPresetPlayer?.name === player.name;
                    return (
                      <button
                        key={player.name}
                        type="button"
                        onClick={() => handleSelectPresetPlayer(player)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#6B00FF] border-[#6B00FF] text-white shadow-sm shadow-[#6B00FF]/20"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="truncate">{player.name}</span>
                        <span className={`text-[10px] ml-1 shrink-0 ${isSelected ? "text-purple-200" : "text-slate-400"}`}>#{player.number}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Sleeve Patch Toggle inside Player Panel */}
            <div className="pt-2">
              <label className="block text-[9px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Sleeve Badge (Optional)</label>
              <button
                type="button"
                onClick={() => setHasFifaPatch(!hasFifaPatch)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-98 flex items-center justify-between ${
                  hasFifaPatch
                    ? "bg-[#6B00FF] border-[#6B00FF] text-white shadow-sm shadow-[#6B00FF]/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>Fifa patch right and left sleeve</span>
                <span className={hasFifaPatch ? "text-white font-extrabold" : "text-[#6B00FF] font-black"}>+10 DHS</span>
              </button>
            </div>
          </div>
        )}
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

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice.toFixed(2),
      image: product.images?.[activeImageIndex] || product.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png",
      size: selectedSize,
      quantity: quantity,
      customName: finalName || undefined,
      customNumber: finalNumber || undefined,
    });
    
    setIsAdded(true);
    setCustomName("");
    setCustomNumber("");
    setSelectedPresetPlayer(null);
    setHasFifaPatch(false);
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
            <Link href="/faq" className="text-[10px] font-bold text-kora uppercase tracking-wider">
              Size Guide →
            </Link>
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
            <div className="text-slate-500 text-sm leading-relaxed space-y-4 pdp-mobile-animate">
              <p>Every kit is rigorously quality-checked before dispatch. We bypass traditional retail to bring you absolute 1:1 specifications.</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Fit:</span> Standard athletic cut. Size up for Player Issue versions.</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Material:</span> 100% Recycled Polyester with advanced sweat-wicking tech.</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Care:</span> Machine wash cold, inside out. Do not tumble dry.</li>
              </ul>
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
                    <span className="text-[9px] font-black uppercase text-kora tracking-widest block mb-0.5">RECOMMENDED</span>
                    <span className="text-2xl font-black font-display text-emerald-400 block leading-none">{recommendPercent}%</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">Based on {product.reviews?.length || 0} reviews</span>
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
                      <div key={review.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs pdp-mobile-animate animate-fade-in-up">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <AvatarDisplay
                              imageUrl={review.user?.imageUrl}
                              name={reviewerName}
                              selectedAvatar={review.user?.selectedAvatar}
                              customProfilePic={review.user?.customProfilePic}
                              size="w-9 h-9"
                            />
                            <div>
                              <div className="flex items-center gap-1 flex-wrap">
                                <p className="text-xs font-bold text-slate-900 flex items-center">
                                  {reviewerName}
                                  {isReviewerAdmin && <VerifiedTick />}
                                </p>
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                  Verified
                                </span>
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
                          <div className="mt-4 pl-3.5 border-l-2 border-kora/40 bg-slate-50 p-3 rounded-r-2xl relative overflow-hidden">
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

                        {/* Helpfulness Bar */}
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-bold mt-3">
                          <span>Helpful?</span>
                          <button
                            onClick={handleHelpfulClick}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                              votes.voted === 'yes'
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                : "bg-slate-50 border-slate-200 text-slate-500 active:scale-95"
                            }`}
                          >
                            <FiThumbsUp className="text-[11px]" />
                            <span>Yes ({votes.yes})</span>
                          </button>
                        </div>
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

            {/* Main Showcase Box with Zoom-on-Hover */}
            <div 
              className="flex-1 aspect-[4/5] bg-slate-50 rounded-[32px] border border-slate-200/60 flex items-center justify-center relative overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 p-0 cursor-zoom-in"
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
                <Link href="/faq" className="text-kora hover:text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group">
                  Size Guide <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
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

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200/50 flex items-center justify-center shrink-0">
                  <FaTruckFast className="text-lg text-kora" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">UAE Delivery within 48 Hours</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Priority local shipping</span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200/50 flex items-center justify-center shrink-0">
                  <FaShieldAlt className="text-lg text-kora" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">7-Day Guarantee</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Hassle-free vault returns</span>
                </div>
              </div>
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
                    <span className="text-slate-800 font-bold text-sm">Machine Wash</span>
                    <p className="text-slate-400 text-xs leading-normal">Wash cold, inside out. Hang dry only to protect printed graphics and patches.</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-kora tracking-widest">ORIGIN</span>
                    <span className="text-slate-800 font-bold text-sm">Vault Standard</span>
                    <p className="text-slate-400 text-xs leading-normal">Bypassing traditional retail margins to source the highest authentic grade direct.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in-up space-y-10 font-sans">
                {/* 3-Column Reviews Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  
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

                  {/* Card 3: Recommendation Percentage */}
                  <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-xs hover:border-kora/20 transition-all duration-300">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">SATISFACTION RATE</span>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* Circular Progress (Vector SVG) */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="6" fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * recommendPercent) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="absolute text-xl font-black text-slate-900 font-display">{recommendPercent}%</span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-3">
                      of members recommend this gear
                    </span>
                  </div>

                </div>

                {/* Drop a Review Box */}
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
                        <div key={review.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-slate-200/80 animate-fade-in-up">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3.5">
                              <AvatarDisplay
                                imageUrl={review.user?.imageUrl}
                                name={reviewerName}
                                selectedAvatar={review.user?.selectedAvatar}
                                customProfilePic={review.user?.customProfilePic}
                                size="w-11 h-11"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-slate-900 font-bold font-sans text-sm flex items-center">
                                    {reviewerName}
                                    {isReviewerAdmin && <VerifiedTick />}
                                  </p>
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    Verified Purchaser
                                  </span>
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
                            <div className="mt-4 ml-14 pl-4 border-l-2 border-kora/40 bg-slate-50 p-4 rounded-r-2xl relative overflow-hidden animate-fade-in-up">
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

                          {/* Helpfulness Bar */}
                          <div className="flex items-center gap-3 pl-14 pt-3 border-t border-slate-50 text-xs text-slate-400 font-bold mt-4">
                            <span>Was this review helpful?</span>
                            <button
                              onClick={handleHelpfulClick}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                                votes.voted === 'yes'
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 active:scale-95"
                              }`}
                            >
                              <FiThumbsUp className="text-xs" />
                              <span>Yes ({votes.yes})</span>
                            </button>
                          </div>
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
    </>
  );
}