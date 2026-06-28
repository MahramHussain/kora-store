"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { CURRENCY } from "@/lib/constants";
import {
  FiBox,
  FiShoppingBag,
  FiUser,
  FiSettings,
  FiLogOut,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiCreditCard,
  FiTag,
  FiActivity,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiArrowRight,
  FiClock,
  FiShield,
  FiAward,
  FiCheck,
  FiGrid
} from "react-icons/fi";

// ── CUSTOM CSS FOOTBALL JERSEYS (Offline friendly, highly creative vectors) ──
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
    <div className="relative w-12 h-12 flex items-center justify-center filter drop-shadow-md transition-transform hover:scale-110">
      {/* Torso */}
      <div
        className="relative w-7 h-9 rounded-t-sm overflow-hidden"
        style={{ backgroundColor: colors.primary }}
      >
        {colors.stripes && (
          <div className="absolute inset-0 flex justify-around">
            <div className="w-1.5 h-full" style={{ backgroundColor: colors.secondary }} />
            <div className="w-1.5 h-full" style={{ backgroundColor: colors.secondary }} />
            <div className="w-1.5 h-full" style={{ backgroundColor: colors.secondary }} />
          </div>
        )}
        {/* Neck collar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-1.5 bg-slate-900/10 rounded-b-full" />
      </div>
      {/* Left Sleeve */}
      <div
        className="absolute top-1 -left-0.5 w-3 h-5 rounded-l-sm origin-top-right -rotate-25"
        style={{ backgroundColor: colors.sleeves || colors.primary }}
      />
      {/* Right Sleeve */}
      <div
        className="absolute top-1 -right-0.5 w-3 h-5 rounded-r-sm origin-top-left rotate-25"
        style={{ backgroundColor: colors.sleeves || colors.primary }}
      />
    </div>
  );
}

function AvatarDisplay({
  imageUrl,
  name,
  selectedAvatar,
  size = "w-14 h-14"
}: {
  imageUrl?: string;
  name: string;
  selectedAvatar: string | null;
  size?: string;
}) {
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

  return (
    <div className={`${size} rounded-full bg-gradient-to-tr from-kora to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0 uppercase`}>
      {name.charAt(0)}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let cls = "";
  let icon = null;

  if (status === "Delivered") {
    cls = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    icon = <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />;
  } else if (status === "Shipped") {
    cls = "bg-blue-50 text-blue-700 border-blue-200/60";
    icon = <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />;
  } else {
    cls = "bg-amber-50 text-amber-700 border-amber-200/60";
    icon = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDuration: "1.5s" }} />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {icon}
      {status}
    </span>
  );
}

// ── ADAPTIVE STEP-BY-STEP PROGRESS TIMELINE ──
function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { label: "Vault Secured", desc: "Order accepted" },
    { label: "Quality Checks", desc: "1:1 grade verified" },
    { label: "Departed Vault", desc: "On way to Dubai hub" },
    { label: "In Vault Locker", desc: "Delivered to address" }
  ];

  let currentIdx = 0;
  if (status === "Shipped") currentIdx = 2;
  if (status === "Delivered") currentIdx = 3;

  return (
    <div className="w-full py-6 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl my-4">
      {/* PC View Timeline (Horizontal) */}
      <div className="hidden md:flex items-start justify-between relative w-full">
        {/* Background track line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        {/* Active track line */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-kora to-purple-500 transition-all duration-700 -z-0"
          style={{ width: `calc(${(currentIdx / (steps.length - 1)) * 100}% - 48px)` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={idx} className="flex flex-col items-center text-center flex-1 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDone
                    ? "bg-kora text-white shadow-md shadow-kora/20"
                    : isActive
                    ? "bg-white border-2 border-kora text-kora ring-4 ring-kora/10 animate-bounce-slow"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isDone ? <FiCheck className="w-4.5 h-4.5" /> : idx + 1}
              </div>
              <p className={`text-xs font-bold mt-2.5 uppercase tracking-wider ${isActive || isDone ? "text-slate-900" : "text-slate-400"}`}>
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[120px] leading-tight">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile View Timeline (Vertical) */}
      <div className="flex md:hidden flex-col gap-4 relative">
        {/* Vertical background line */}
        <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-slate-200 -z-0" />
        {/* Vertical active line */}
        <div
          className="absolute top-2 left-4 w-0.5 bg-gradient-to-b from-kora to-purple-500 transition-all duration-700 -z-0"
          style={{ height: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={idx} className="flex gap-4 relative z-10 items-start">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isDone
                    ? "bg-kora text-white shadow-md shadow-kora/20"
                    : isActive
                    ? "bg-white border-2 border-kora text-kora ring-4 ring-kora/10"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isDone ? <FiCheck className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="pt-0.5">
                <p className={`text-xs font-bold uppercase tracking-wider ${isActive || isDone ? "text-slate-900" : "text-slate-400"}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardUI({ user, orders }: { user: any; orders: any[] }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState(user.name);
  const [saveStatus, setSaveStatus] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "shipped" | "delivered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Notification Preferences (Client-side toggles)
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefDrops, setPrefDrops] = useState(true);

  // Load custom avatar from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("kora_vault_avatar");
    if (saved) setSelectedAvatar(saved);
  }, []);

  const changeAvatar = (avatarId: string | null) => {
    setSelectedAvatar(avatarId);
    if (avatarId) {
      localStorage.setItem("kora_vault_avatar", avatarId);
    } else {
      localStorage.removeItem("kora_vault_avatar");
    }
  };

  const handleLogout = () => signOut(() => router.push("/"));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) {
      setSaveStatus("❌ Session not loaded. Try again.");
      return;
    }
    setSaveStatus("Saving...");
    try {
      await clerkUser.update({ firstName: nameInput });
      setSaveStatus("✅ Profile updated successfully!");
      setTimeout(() => setSaveStatus(""), 4000);
    } catch (err: any) {
      setSaveStatus("❌ " + (err.errors?.[0]?.message || "Failed to update profile."));
    }
  };

  // Loyalty calculations
  const orderCount = orders.length;
  const totalSpentNum = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const totalSpent = totalSpentNum.toFixed(2);
  const xp = Math.min(1500, orderCount * 250 + Math.floor(totalSpentNum * 0.05));

  let loyaltyRank = "Rookie Vault Collector";
  let rankColorClass = "text-amber-600 bg-amber-500/10 border-amber-500/20";
  let nextRank = "Vault Legend";
  let xpNeeded = 500;
  let percent = (xp / 500) * 100;

  if (orderCount >= 2 && orderCount < 5) {
    loyaltyRank = "Vault Legend";
    rankColorClass = "text-kora bg-kora/10 border-kora/20";
    nextRank = "Elite Collector VIP";
    xpNeeded = 1250;
    percent = ((xp - 500) / (1250 - 500)) * 100;
  } else if (orderCount >= 5) {
    loyaltyRank = "Elite Collector VIP";
    rankColorClass = "text-yellow-600 bg-yellow-500/10 border-yellow-500/20 font-black shadow-sm shadow-yellow-500/5";
    nextRank = "Max Rank Unlocked";
    xpNeeded = 1500;
    percent = 100;
  }
  percent = Math.max(0, Math.min(100, percent));

  const navItems: { id: "overview" | "orders" | "settings"; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "overview", label: "Overview", icon: <FiGrid className="w-5 h-5" />, desc: "Vault overview & stats" },
    { id: "orders", label: "Order History", icon: <FiShoppingBag className="w-5 h-5" />, desc: "History & live tracking" },
    { id: "settings", label: "Settings", icon: <FiSettings className="w-5 h-5" />, desc: "Security & personal details" },
  ];

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.referenceNumber && order.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items.some((item: any) =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-kora selection:text-white pt-20 pb-16 px-4 sm:px-6 md:pt-24 md:pb-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
        
        {/* ── 1. PREMIUM GLASSMORPHIC PROFILE HERO BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#1d1035] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl">
          {/* Decorative design orbs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-kora/15 blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="absolute -bottom-20 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <AvatarDisplay
                imageUrl={clerkUser?.imageUrl || user.imageUrl}
                name={clerkUser?.firstName || user.name}
                selectedAvatar={selectedAvatar}
                size="w-16 h-16 sm:w-20 sm:h-20"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase leading-none">
                    {clerkUser?.firstName || user.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider ${rankColorClass}`}>
                    <FiAward className="w-3 h-3" />
                    {loyaltyRank}
                  </span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 truncate max-w-[280px] sm:max-w-md font-medium">
                  {clerkUser?.emailAddresses[0]?.emailAddress || user.email}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Vault Member since &apos;{user.memberSince}
                </p>
              </div>
            </div>

            {/* Loyalty tier progress meter */}
            <div className="w-full lg:max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vault Loyalty XP</p>
                  <p className="text-lg font-black mt-0.5">{xp} <span className="text-xs text-slate-400 font-normal">/ {xpNeeded} XP</span></p>
                </div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  {nextRank}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-kora to-purple-400 rounded-full transition-all duration-1000"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-2">
                {orderCount >= 5 ? "🎖️ Ultimate Collector status achieved" : `💡 Spend more to unlock ${nextRank}`}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. MAIN LAYOUT CONTAINER (2 Columns on PC, Scroll Nav on Mobile) ── */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Navigation - PC Sidebar / Mobile Tab bar */}
          <div className="w-full lg:w-72 shrink-0">
            {/* Mobile Tab-bar (horizontal scrolling navigation) */}
            <div className="lg:hidden w-full overflow-x-auto scrollbar-hide py-1.5 -mx-4 px-4 sticky top-16 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/50 flex gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap border transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-kora text-white border-kora shadow-md shadow-kora/20"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              
              {(user.email === "mahramh40@gmail.com" || user.email === "korastore.ae@gmail.com") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap bg-white text-kora border border-kora/20 hover:bg-kora/5 transition-all"
                >
                  <FiShield className="w-4 h-4" />
                  Admin Portal
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider whitespace-nowrap bg-white text-rose-500 border border-rose-100 hover:bg-rose-50/50 transition-all"
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* PC Sidebar Navigation */}
            <div className="hidden lg:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm sticky top-28">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-2">Vault Navigation</p>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-left transition-all duration-300 group ${
                        isSelected
                          ? "bg-gradient-to-r from-kora/10 to-purple-500/5 text-kora border-l-4 border-kora pl-3 font-extrabold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent font-bold"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? "bg-kora text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"}`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm leading-none">{item.label}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal group-hover:text-slate-500">{item.desc}</p>
                      </div>
                      {isSelected && <FiChevronRight className="ml-auto text-kora w-4 h-4" />}
                    </button>
                  );
                })}

                {(user.email === "mahramh40@gmail.com" || user.email === "korastore.ae@gmail.com") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-left text-kora border border-dashed border-kora/20 hover:bg-kora/5 transition-all mt-3 font-bold"
                  >
                    <div className="p-1.5 rounded-lg bg-kora/10 text-kora">
                      <FiShield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm leading-none">Command Center</p>
                      <p className="text-[10px] text-kora/70 mt-1 font-normal">Administrator portal</p>
                    </div>
                  </Link>
                )}
              </nav>

              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-left font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100">
                    <FiLogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm leading-none">Secure Logout</p>
                    <p className="text-[10px] text-rose-400 mt-1 font-normal">Disconnect vault session</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── 3. CONTENT AREA ── */}
          <div className="flex-1 min-w-0">

            {/* ── TAB: OVERVIEW ── */}
            {activeTab === "overview" && (
              <div className="animate-fade-in-up space-y-6">
                
                {/* Stats cards grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Value */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 hover-lift relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-kora/5 to-transparent rounded-full -z-0 pointer-events-none" />
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-kora mb-4">
                      <FiCreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Vault Portfolio</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">{CURRENCY}{totalSpent}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Total checkout sum</p>
                  </div>

                  {/* Card 2: Drops */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 hover-lift relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full -z-0 pointer-events-none" />
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                      <FiBox className="w-5 h-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Secured Drops</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">{orderCount}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Successful orders</p>
                  </div>

                  {/* Card 3: Loyalty level */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 hover-lift relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-full -z-0 pointer-events-none" />
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                      <FiAward className="w-5 h-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Vault Tier</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 truncate">
                      {orderCount >= 5 ? "Elite" : orderCount >= 2 ? "Legend" : "Rookie"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Loyalty rank grade</p>
                  </div>

                  {/* Card 4: Address */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 hover-lift relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full -z-0 pointer-events-none" />
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                      <FiMapPin className="w-5 h-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Shipping Region</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 truncate">
                      {orders[0]?.shippingCity || "UAE Vault"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Last delivery location</p>
                  </div>
                </div>

                {/* Latest Mission / Order Card */}
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <FiActivity className="text-kora w-4 h-4 animate-pulse" />
                    Latest Active Drop
                  </h2>

                  {orders.length > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 hover:border-kora/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
                      
                      {/* Floating glow accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-kora/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-black text-slate-900 text-lg">#VAULT-{orders[0].referenceNumber || orders[0].id.slice(-6).toUpperCase()}</h3>
                            <StatusBadge status={orders[0].status} />
                          </div>
                          <p className="text-slate-400 text-xs mt-1">
                            Placed on {new Date(orders[0].createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Value</p>
                          <p className="font-black text-slate-900 text-xl mt-0.5">{CURRENCY}{parseFloat(orders[0].total).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Interactive Stepper */}
                      <div className="py-4">
                        <StatusTimeline status={orders[0].status} />
                      </div>

                      {/* Items previews inside latest order */}
                      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-3.5">
                            {orders[0].items.slice(0, 4).map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-white overflow-hidden flex items-center justify-center p-1.5 shadow-sm group-hover:translate-x-1.5 transition-transform duration-300"
                                style={{ zIndex: 10 - idx }}
                              >
                                <img
                                  src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ))}
                            {orders[0].items.length > 4 && (
                              <div className="w-12 h-12 rounded-2xl bg-kora border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm z-0">
                                +{orders[0].items.length - 4}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 pl-1.5">
                            <p className="font-extrabold text-slate-800 text-sm truncate max-w-[200px] sm:max-w-md">
                              {orders[0].items[0]?.product?.name || "Premium Gear"}
                              {orders[0].items.length > 1 && ` & ${orders[0].items.length - 1} other item(s)`}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Quantity: {orders[0].items.reduce((sum: number, i: any) => sum + i.quantity, 0)} units
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab("orders");
                            setExpandedOrderId(orders[0].id);
                          }}
                          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full hover:bg-kora hover:shadow-lg hover:shadow-kora/25 transition-all duration-300 w-full sm:w-auto justify-center"
                        >
                          Manage Drop
                          <FiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FiBox className="text-2xl text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-sm font-semibold mb-4">Your vault inventory is empty. Secure your first gear drop.</p>
                      <Link href="/shop" className="inline-flex bg-kora text-white font-extrabold px-7 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-purple-700 transition-colors shadow-md shadow-kora/20">
                        Shop The Vault
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: ORDERS ── */}
            {activeTab === "orders" && (
              <div className="animate-fade-in-up space-y-6">
                
                {/* Header with Search and Filter tools */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Order Vault</h1>
                    <p className="text-slate-400 text-xs mt-0.5">{orders.length} total order drops registered</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        placeholder="Search by order ID or gear..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors"
                      />
                      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200/80 rounded-2xl py-2.5 pl-4 pr-10 text-xs font-bold text-slate-700 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors w-full cursor-pointer"
                      >
                        <option value="all">All Drops</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      return (
                        <div
                          key={order.id}
                          className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm ${
                            isExpanded ? "border-kora ring-1 ring-kora/20 shadow-md" : "border-slate-200 hover:border-kora/30"
                          }`}
                        >
                          {/* Order Header / Collapsed View */}
                          <div
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer select-none bg-white transition-colors hover:bg-slate-50/30"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                                <img
                                  src={order.items[0]?.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"}
                                  alt="Product thumbnail"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-black text-slate-900 text-sm sm:text-base">#VAULT-{order.referenceNumber || order.id.slice(-6).toUpperCase()}</h3>
                                  <StatusBadge status={order.status} />
                                </div>
                                <p className="text-slate-400 text-xs mt-1">
                                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  {" · "}{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} items
                                </p>
                                
                                {/* Stacking bubble preview on collapsed */}
                                {!isExpanded && (
                                  <div className="flex -space-x-2 mt-2">
                                    {order.items.slice(0, 4).map((item: any, idx: number) => (
                                      <div key={idx} className="w-7 h-7 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                                        <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="" className="w-full h-full object-contain" />
                                      </div>
                                    ))}
                                    {order.items.length > 4 && (
                                      <div className="w-7 h-7 rounded-full bg-kora border border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                                        +{order.items.length - 4}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</p>
                                <p className="font-black text-slate-900 text-lg mt-0.5">{CURRENCY}{parseFloat(order.total).toFixed(2)}</p>
                              </div>
                              <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-kora hover:text-white transition-colors duration-300 text-slate-400 shrink-0 ${isExpanded ? "rotate-180 bg-kora text-white border-kora" : ""}`}>
                                <FiChevronDown className="w-4.5 h-4.5 transition-transform" />
                              </div>
                            </div>
                          </div>

                          {/* Expanded Drawer Content */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/20 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                              
                              {/* Stepper tracking */}
                              <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <FiActivity className="w-3.5 h-3.5 text-kora" /> Delivery Status Progress
                              </h4>
                              <StatusTimeline status={order.status} />

                              {/* Items list */}
                              <div className="mb-6 mt-6">
                                <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">Secured Products</h4>
                                <div className="space-y-3">
                                  {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 hover:border-kora/20 transition-all duration-300">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                                          <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="Gear" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                          <p className="font-extrabold text-slate-900 text-sm">{item.product?.name || "Premium Gear"}</p>
                                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-1 font-medium">
                                            <span>Size: <strong className="text-slate-700 font-extrabold">{item.size}</strong></span>
                                            {(item.customName || item.customNumber) && (
                                              <>
                                                <span className="text-slate-200">|</span>
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-kora font-bold text-[10px] border border-purple-100">
                                                  Print: {item.customName} {item.customNumber ? `#${item.customNumber}` : ""}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="font-black text-slate-900 text-sm sm:text-base">{CURRENCY}{parseFloat(item.price).toFixed(2)}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Two Columns: Shipping & Invoice */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shipping details card */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                                  {/* Map grid aesthetic */}
                                  <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                                  <div>
                                    <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                      <FiMapPin className="text-kora w-4 h-4" /> Shipping Vault Address
                                    </h4>
                                    
                                    <div className="space-y-3.5">
                                      <div className="flex gap-3 text-xs">
                                        <span className="text-slate-400 w-20 shrink-0 font-bold uppercase tracking-wider text-[9px]">Recipient:</span>
                                        <span className="text-slate-800 font-extrabold text-xs">{order.shippingName || "Vault Shopper"}</span>
                                      </div>
                                      <div className="flex gap-3 text-xs">
                                        <span className="text-slate-400 w-20 shrink-0 font-bold uppercase tracking-wider text-[9px]">Phone:</span>
                                        <span className="text-slate-800 font-extrabold text-xs">{order.shippingPhone || "N/A"}</span>
                                      </div>
                                      <div className="flex gap-3 text-xs">
                                        <span className="text-slate-400 w-20 shrink-0 font-bold uppercase tracking-wider text-[9px]">Address:</span>
                                        <span className="text-slate-800 font-extrabold text-xs">
                                          {order.shippingStreet || "N/A"}, {order.shippingCity || "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex gap-3 text-xs">
                                        <span className="text-slate-400 w-20 shrink-0 font-bold uppercase tracking-wider text-[9px]">Payment:</span>
                                        <span className="text-slate-800 font-extrabold text-xs uppercase flex items-center gap-1.5">
                                          <FiCreditCard className="w-3.5 h-3.5 text-slate-400" />
                                          {order.paymentMethod || "Card"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick support buttons */}
                                  <div className="pt-5 mt-5 border-t border-slate-100 flex flex-wrap gap-2">
                                    <button className="flex-1 min-w-[120px] bg-slate-900 hover:bg-kora text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors text-center">
                                      Track Package
                                    </button>
                                    <button className="flex-1 min-w-[120px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors text-center">
                                      Get Help
                                    </button>
                                  </div>
                                </div>

                                {/* Premium Invoice Receipt */}
                                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-5 relative">
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,transparent_50%,#ffffff_50%)] bg-[size:10px_100%] pointer-events-none" />
                                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <FiTag className="text-kora w-4 h-4" /> Vault Receipt Invoice
                                  </h4>

                                  <div className="space-y-2.5 text-xs">
                                    <div className="flex justify-between text-slate-500 font-semibold">
                                      <span>Items Subtotal</span>
                                      <span className="font-bold">{CURRENCY}{(parseFloat(order.total) - parseFloat(order.shippingFee || "10") + parseFloat(order.discountAmount || "0")).toFixed(2)}</span>
                                    </div>
                                    
                                    {order.promoCode && (
                                      <div className="flex justify-between text-emerald-600 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                                        <span className="flex items-center gap-1.5">🏷️ PROMO ({order.promoCode})</span>
                                        <span>-{CURRENCY}{parseFloat(order.discountAmount || "0").toFixed(2)}</span>
                                      </div>
                                    )}

                                    <div className="flex justify-between text-slate-500 font-semibold">
                                      <span>Delivery Charges</span>
                                      <span className="font-bold">{CURRENCY}{parseFloat(order.shippingFee || "10").toFixed(2)}</span>
                                    </div>

                                    {parseFloat(order.tax || "0") > 0 && (
                                      <div className="flex justify-between text-slate-500 font-semibold">
                                        <span>VAT (5%)</span>
                                        <span className="font-bold">{CURRENCY}{parseFloat(order.tax).toFixed(2)}</span>
                                      </div>
                                    )}

                                    <div className="h-px bg-slate-300 border-t border-dashed my-2" />
                                    
                                    <div className="flex justify-between items-center pt-1">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Total</span>
                                      <span className="text-xl sm:text-2xl font-black text-kora">{CURRENCY}{parseFloat(order.total).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <FiBox className="text-2xl text-slate-300" />
                      </div>
                      <p className="text-slate-500 text-sm font-semibold mb-2">No matching order drops found.</p>
                      <p className="text-slate-400 text-xs mb-4">Try clearing filters or checking other query strings.</p>
                      <button
                        onClick={() => { setStatusFilter("all"); setSearchQuery(""); }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: SETTINGS ── */}
            {activeTab === "settings" && (
              <div className="animate-fade-in-up space-y-6">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Vault Settings</h1>
                  <p className="text-slate-400 text-xs mt-0.5">Manage your personal customer profile and credentials.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Form section */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <form onSubmit={handleSave} className="space-y-5">
                      <div>
                        <label className="block text-slate-500 text-[10px] font-extrabold mb-2 uppercase tracking-widest">First Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm font-semibold"
                            required
                          />
                          <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-extrabold mb-2 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            readOnly
                            defaultValue={user.email}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed shadow-sm font-medium"
                          />
                          <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4.5 h-4.5" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium pl-1">Email is locked and managed via Clerk authentication.</p>
                      </div>

                      {saveStatus && (
                        <div
                          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                            saveStatus.startsWith("✅")
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : saveStatus.startsWith("Saving")
                              ? "bg-purple-50 border-purple-200 text-kora animate-pulse"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}
                        >
                          {saveStatus.startsWith("✅") ? <FiCheckCircle className="w-4 h-4 shrink-0" /> : <FiInfo className="w-4 h-4 shrink-0" />}
                          {saveStatus}
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <button
                          type="submit"
                          className="bg-kora hover:bg-purple-700 text-white font-extrabold py-3.5 px-8 rounded-full transition-all shadow-md shadow-kora/20 text-xs uppercase tracking-wider"
                        >
                          Save Profile Changes
                        </button>
                        <span className="text-[10px] text-slate-400 font-medium">Applies immediately</span>
                      </div>
                    </form>
                  </div>

                  {/* Right side: custom avatar selector & preferences */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Football Avatar Selector */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                      <h4 className="text-[11px] text-slate-900 font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        🏆 Select Football Jersey Avatar
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4">
                        Theme your profile picture bubble with premium 1:1 local jersey skins.
                      </p>

                      <div className="grid grid-cols-4 gap-3">
                        {/* Default selection */}
                        <button
                          onClick={() => changeAvatar(null)}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 ${
                            selectedAvatar === null
                              ? "border-kora bg-kora/5 ring-1 ring-kora/10"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          title="Clerk Avatar"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden font-black text-sm uppercase">
                            {clerkUser?.imageUrl ? (
                              <img src={clerkUser.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (clerkUser?.firstName || user.name).charAt(0)
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 mt-1 truncate max-w-full">Default</span>
                        </button>

                        {/* Jersey selections */}
                        {Object.entries(JERSEYS).map(([id, colors]) => (
                          <button
                            key={id}
                            onClick={() => changeAvatar(id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 ${
                              selectedAvatar === id
                                ? "border-kora bg-kora/5 ring-1 ring-kora/10"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            title={colors.name}
                          >
                            <MiniJersey colors={colors} />
                            <span className="text-[9px] font-bold text-slate-500 mt-1 truncate max-w-full">{colors.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Client Notification preferences card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                      <h4 className="text-[11px] text-slate-900 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        🔔 Vault Alerts & Drops
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-800">Email Notifications</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Receive transaction invoices & delivery status alerts</p>
                          </div>
                          <button
                            onClick={() => setPrefEmail(!prefEmail)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${prefEmail ? "bg-kora" : "bg-slate-200"}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${prefEmail ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-xs font-bold text-slate-800">Limited Gear Drops</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Get early alerts on vintage Restocks & World Cup spotlights</p>
                          </div>
                          <button
                            onClick={() => setPrefDrops(!prefDrops)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${prefDrops ? "bg-kora" : "bg-slate-200"}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${prefDrops ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}