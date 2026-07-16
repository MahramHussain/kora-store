"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getAdminStats } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // 1. Premium loading state
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="relative w-12 h-12 mb-5">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-kora animate-spin" />
        </div>
        <p className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[11px]">Verifying credentials</p>
      </main>
    );
  }

  // 2. Access Denied screen
  if (!isSignedIn || (userEmail !== "mahramh40@gmail.com" && userEmail !== "korastore.ae@gmail.com")) {
    return (
      <main className="min-h-screen bg-white font-sans flex items-center justify-center px-5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-rose-500/5 to-kora/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-md w-full bg-white border border-slate-200/80 p-7 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-50 to-rose-100/80 border border-rose-200/60 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-sm">
            🔒
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Access Denied</h1>
            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-[0.2em] mb-4">Restricted Command Center</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              This area is restricted to authorized administrators only. Your email address <span className="text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">{userEmail || "anonymous"}</span> is not authorized.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/" className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl transition-all uppercase tracking-wider text-xs border border-slate-200 text-center hover:shadow-sm">
              Return Home
            </Link>
            <Link href="/account" className="bg-kora hover:bg-purple-700 text-white font-black py-3.5 rounded-2xl transition-all uppercase tracking-wider text-xs text-center shadow-lg shadow-kora/25">
              Switch Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [stats, setStats] = useState<{ productCount: number; orderCount: number; totalValue: number; totalEarnings: number } | null>(null);

  useEffect(() => {
    if (isSignedIn && (userEmail === "mahramh40@gmail.com" || userEmail === "korastore.ae@gmail.com")) {
      getAdminStats().then(data => setStats(data));
    }
  }, [isSignedIn, userEmail, pathname]);

  // Helper to determine if a route is active
  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/admin", label: "Add New Gear", desc: "Register product", icon: "✚" },
    { href: "/admin/analytics", label: "Site Analytics", desc: "Traffic & engagement", icon: "📈" },
    { href: "/admin/orders", label: "Order Fulfillment", desc: "Manage shipments", icon: "📦" },
    { href: "/admin/inventory", label: "Product Inventory", desc: "Stock management", icon: "📋" },
    { href: "/admin/users", label: "User Accounts", desc: "Access & Ban control", icon: "👥" },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-800 pt-20 pb-20 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ═══════════ DESKTOP SIDEBAR ═══════════ */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-24 space-y-5">

              {/* Brand & Navigation Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                {/* Brand header */}
                <div className="p-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kora to-purple-600 flex items-center justify-center shadow-md shadow-kora/25">
                      <span className="text-white text-sm font-black">K</span>
                    </div>
                    <div>
                      <h1 className="text-[15px] font-black text-slate-900 uppercase tracking-tight leading-none">Command Center</h1>
                      <p className="text-kora font-bold uppercase tracking-[0.15em] text-[9px] mt-1">Admin Dashboard</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="p-2.5 space-y-0.5">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                          active
                            ? "bg-gradient-to-r from-kora/10 to-purple-500/5 text-kora font-extrabold shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 transition-colors ${
                          active ? "bg-kora text-white shadow-sm" : "bg-slate-100 group-hover:bg-slate-200"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] leading-none truncate">{item.label}</p>
                          <p className={`text-[10px] mt-0.5 font-normal ${active ? "text-kora/60" : "text-slate-400"}`}>{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-2.5 pt-0">
                  <div className="h-px bg-slate-100 mx-2 mb-1.5" />
                  <Link href="/shop" className="flex items-center gap-3 px-3.5 py-3 text-slate-500 hover:text-kora text-xs font-bold uppercase tracking-wider transition-all rounded-2xl hover:bg-slate-50 group">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-kora/10 flex items-center justify-center transition-colors shrink-0">
                      <span className="text-sm">🏪</span>
                    </div>
                    <span>Go to Store</span>
                  </Link>
                </div>
              </div>

              {/* Quick Stats Card */}
              {stats && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Quick Overview</h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-xs">📦</div>
                        <span className="text-xs text-slate-500 font-semibold">Products</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{stats.productCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-xs">🛒</div>
                        <span className="text-xs text-slate-500 font-semibold">Active Orders</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{stats.orderCount}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-xs">💰</div>
                        <span className="text-xs text-slate-500 font-semibold">Revenue</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600 whitespace-nowrap shrink-0 text-right">AED {stats.totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-xs">💎</div>
                        <span className="text-xs text-slate-500 font-semibold">Valuation</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 whitespace-nowrap shrink-0 text-right">AED {stats.totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ═══════════ MAIN CONTENT AREA ═══════════ */}
          <div className="flex-1 min-w-0">

            {/* ═══ MOBILE HEADER + NAV ═══ */}
            <div className="lg:hidden mb-6">
              {/* Mobile Title */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kora to-purple-600 flex items-center justify-center shadow-md shadow-kora/25 shrink-0">
                    <span className="text-white text-sm font-black">K</span>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Command Center</h1>
                    <p className="text-kora font-bold uppercase tracking-[0.15em] text-[9px] mt-1">Admin Dashboard</p>
                  </div>
                </div>
                <Link href="/shop" className="text-slate-400 hover:text-kora text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0">
                  Store &rarr;
                </Link>
              </div>

              {/* Mobile Stats Row (horizontal scroll) */}
              {stats && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 mb-4">
                  <div className="min-w-[130px] bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm shrink-0 flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">📦 Products</span>
                    <span className="text-lg font-black text-slate-900 mt-1.5 block">{stats.productCount}</span>
                  </div>
                  <div className="min-w-[130px] bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm shrink-0 flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">🛒 Orders</span>
                    <span className="text-lg font-black text-slate-900 mt-1.5 block">{stats.orderCount}</span>
                  </div>
                  <div className="min-w-[130px] bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm shrink-0 flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">💰 Revenue</span>
                    <span className="text-lg font-black text-emerald-600 mt-1.5 block">AED {stats.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="min-w-[130px] bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm shrink-0 flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">💎 Valuation</span>
                    <span className="text-lg font-black text-slate-900 mt-1.5 block">AED {stats.totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all shrink-0 ${
                      isActive(item.href)
                        ? "bg-kora border-kora text-white shadow-md shadow-kora/20"
                        : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Stats Row */}
            {stats && (
              <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-kora/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg mb-3">📦</div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Products</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.productCount}</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-kora/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg mb-3">🛒</div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Orders</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.orderCount}</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-kora/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg mb-3">💰</div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sales Revenue</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">AED {stats.totalEarnings.toFixed(2)}</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-kora/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full pointer-events-none" />
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg mb-3">💎</div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Vault Valuation</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">AED {stats.totalValue.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Dynamic Page Content */}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
