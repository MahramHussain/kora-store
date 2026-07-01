"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaStar, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { CURRENCY } from "@/lib/constants";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none p-0 m-0 border-0",
    header: "hidden",
    footer: "hidden",
    formButtonPrimary:
      "bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-kora/15",
    formFieldInput:
      "bg-slate-50 border border-slate-200 text-slate-900 py-3 rounded-xl focus:border-kora focus:ring-1 focus:ring-kora",
    formFieldLabel: "text-slate-600 font-bold text-sm",
    dividerText: "text-slate-400 font-bold uppercase tracking-wider text-xs",
    socialButtonsBlockButton:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold transition-all shadow-sm",
    socialButtonsBlockButtonText: "font-bold",
    identityPreviewText: "text-kora",
    identityPreviewEditButton: "text-slate-400 hover:text-slate-950",
  },
};

export default function AccountUI({ user, orders, banned = false }: { user: any; orders: any[]; banned?: boolean }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [isLogin, setIsLogin] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (banned) {
    return (
      <main className="min-h-[80vh] bg-transparent flex items-center justify-center px-4 font-sans relative overflow-hidden py-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-md w-full bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl text-center space-y-6 relative z-10">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-sm text-rose-500">
            ⚠️
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Vault Access Restricted</h1>
            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mb-4">Account Suspended</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your account has been restricted or shadow-banned by the store administration. You are currently blocked from browsing the vault, writing reviews, and purchasing gear.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => signOut(() => {
                localStorage.removeItem("kora_vault_avatar");
                localStorage.removeItem("kora_vault_custom_profile_pic");
                window.dispatchEvent(new Event("kora_avatar_update"));
                router.push("/");
              })}
              className="w-full bg-slate-900 hover:bg-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all uppercase tracking-wider text-xs shadow-md shadow-slate-900/10 active:scale-95"
            >
              Sign Out &rarr;
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── LOGGED-IN (legacy fallback, redirects to /dashboard in normal flow) ──
  if (user) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 min-h-[70vh] animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12 border-b border-slate-200 pb-6 md:pb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src={user.imageUrl} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-kora shadow-md shadow-kora/15" />
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, <span className="text-kora">{user.firstName || "Member"}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">{user.email}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-2 rounded-full flex items-center justify-center shadow-sm">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Order History</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div key={order.id} onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col hover:border-kora/50 transition-all duration-300 cursor-pointer group">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="text-kora text-xs font-bold uppercase tracking-widest mb-1">Order #{order.referenceNumber || order.id.slice(-6).toUpperCase()}</div>
                          <div className="text-slate-800 font-bold mb-2">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                          <div className="flex -space-x-3">
                            {order.items.slice(0, 3).map((item: any, idx: number) => (
                              <div key={idx} className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                                <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="Gear" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <div className="text-slate-900 font-black text-2xl">{CURRENCY}{parseFloat(order.total).toFixed(2)}</div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === "Processing" ? "order-status-processing" : order.status === "Shipped" ? "order-status-shipped" : "order-status-delivered"}`}>{order.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No recent orders found in the Vault.</p>
                <Link href="/shop" className="inline-block bg-kora hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-md shadow-kora/15">Start Shopping</Link>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm h-max">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Vault Settings</h2>
            <div className="space-y-4 text-sm font-medium">
              {(user?.email === "mahramh40@gmail.com" || user?.email === "korastore.ae@gmail.com") && (
                <Link href="/admin" className="w-full text-left flex items-center justify-between text-kora hover:text-purple-700 transition-colors group font-bold">
                  Command Center <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── LOGGED OUT — Premium Split-Screen Auth Layout ──
  return (
    <main className="min-h-screen bg-white flex flex-col lg:flex-row selection:bg-kora selection:text-white">
      
      {/* ── LEFT BRAND PANEL (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative bg-slate-950 flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-kora/20 blur-[130px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/15 blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />

        {/* Top logo */}
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black tracking-tighter uppercase">
            <span className="text-white">KORA</span><span className="text-kora">STORE</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            UAE&apos;s Premier Football Vault
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
            YOUR GEAR.<br />
            <span className="text-gradient-kora">YOUR VAULT.</span><br />
            <span style={{ WebkitTextStroke: "1.5px rgba(168,85,247,0.5)", WebkitTextFillColor: "transparent" }}>DELIVERED.</span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Kora Store is the UAE&apos;s exclusive destination for premium football jerseys, boots, and accessories. 
            Sign in to track your orders and manage your vault.
          </p>

          {/* Trust pillars */}
          <div className="space-y-4">
            {[
              { icon: <FaTruckFast className="text-purple-400" />, label: "1–3 Day UAE Delivery", sub: "Local stock, zero delays" },
              { icon: <FaShieldAlt className="text-purple-400" />, label: "7-Day Satisfaction Guarantee", sub: "Quality checked before dispatch" },
              { icon: <FaCheckCircle className="text-purple-400" />, label: "100% Premium Quality", sub: "1:1 grade sourced direct" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-bold">{item.label}</div>
                  <div className="text-slate-500 text-xs">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom star row */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => <FaStar key={s} className="text-yellow-400 text-sm" />)}
          </div>
          <p className="text-slate-400 text-xs">Trusted by 500+ UAE fans</p>
        </div>
      </div>

      {/* ── RIGHT AUTH PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-20 bg-slate-50 lg:bg-white min-h-screen lg:min-h-0">
        
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden text-2xl font-black tracking-tighter uppercase mb-10">
          <span className="text-slate-900">KORA</span><span className="text-kora">STORE</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8 relative">
            <div
              className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out"
              style={{ width: "calc(50% - 4px)", left: isLogin ? "4px" : "calc(50%)" }}
            />
            <button
              onClick={() => setIsLogin(true)}
              className={`relative z-10 flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-colors ${isLogin ? "text-slate-900" : "text-slate-400"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`relative z-10 flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-colors ${!isLogin ? "text-slate-900" : "text-slate-400"}`}
            >
              Register
            </button>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {isLogin ? "Welcome back." : "Join the vault."}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin ? "Enter your credentials to access your gear." : "Create your account and start shopping premium."}
            </p>
          </div>

          {/* Clerk form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex justify-center min-h-[380px]">
            {isLogin ? (
              <SignIn fallbackRedirectUrl="/account" appearance={clerkAppearance} />
            ) : (
              <SignUp fallbackRedirectUrl="/account" appearance={clerkAppearance} />
            )}
          </div>

          {/* Trust micro-row */}
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5"><FaShieldAlt className="text-slate-300" /> Secure & encrypted</div>
            <div className="flex items-center gap-1.5"><FaCheckCircle className="text-slate-300" /> No spam, ever</div>
          </div>
        </div>
      </div>
    </main>
  );
}