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

  // 1. Sleek light-themed loading state
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-kora rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Verifying credentials...</p>
      </main>
    );
  }

  // 2. Light-themed Access Denied screen
  if (!isSignedIn || (userEmail !== "mahramh40@gmail.com" && userEmail !== "korastore.ae@gmail.com")) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-md w-full border border-slate-200 bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-500 text-3xl font-bold animate-pulse">
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Access Denied</h1>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-widest mb-4">Restricted Command Center</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              This area is restricted to authorized administrators only. Your email address <span className="text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{userEmail || "anonymous"}</span> is not authorized.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/" className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all uppercase tracking-wider text-xs border border-slate-200 text-center">
              Return Home
            </Link>
            <Link href="/account" className="bg-kora hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all uppercase tracking-wider text-xs text-center shadow-md shadow-kora/20">
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pt-12 pb-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Layout Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Command Center</h1>
            <p className="text-kora font-bold uppercase tracking-widest text-xs">Authorized Administrator Dashboard</p>
          </div>
          <Link href="/shop" className="text-slate-500 hover:text-slate-900 underline underline-offset-4 font-bold text-xs uppercase tracking-wider">
            Go to Vault &rarr;
          </Link>
        </div>

        {/* Dashboard Widgets */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">📦 Total Products</span>
              <span className="text-2xl font-black text-slate-900 mt-2 block">{stats.productCount}</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">🛒 Active Orders</span>
              <span className="text-2xl font-black text-slate-900 mt-2 block">{stats.orderCount}</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">💰 Sales Revenue</span>
              <span className="text-2xl font-black text-emerald-600 mt-2 block">AED {stats.totalEarnings.toFixed(2)}</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">💎 Vault Valuation</span>
              <span className="text-2xl font-black text-slate-900 mt-2 block">AED {stats.totalValue.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <nav className="flex flex-wrap gap-3 mb-10 border-b border-slate-200 pb-6">
          <Link 
            href="/admin" 
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              isActive("/admin")
                ? "bg-kora border-kora text-white shadow-md shadow-kora/20"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            Add New Gear
          </Link>
          <Link 
            href="/admin/orders" 
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              isActive("/admin/orders")
                ? "bg-kora border-kora text-white shadow-md shadow-kora/20"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            Order Fulfillment
          </Link>
          <Link 
            href="/admin/inventory" 
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              isActive("/admin/inventory")
                ? "bg-kora border-kora text-white shadow-md shadow-kora/20"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            Product Inventory
          </Link>
        </nav>

        {/* Dynamic Page Content */}
        <div>{children}</div>

      </div>
    </main>
  );
}
