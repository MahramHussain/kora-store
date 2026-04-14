"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBoxOpen, FaMapLocationDot, FaUserGear, FaArrowRightFromBracket, FaChevronRight } from "react-icons/fa6";
import { useClerk } from "@clerk/nextjs";

export default function DashboardUI({ user, orders }: { user: any, orders: any[] }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");

  const handleLogout = () => {
    // 1. Tell Clerk to securely destroy their session, then send them to the homepage
    signOut(() => router.push("/"));
  };

  // 2. Automatically calculate their total lifetime spend from the database!
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2);

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-6 sticky top-32 shadow-2xl">
            
            {/* User Profile Snippet */}
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-bold text-white text-lg leading-tight">{user.name}</h2>
                <p className="text-xs text-slate-400">Vault Member since '{user.memberSince}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "overview" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FaBoxOpen className="text-lg" /> Overview
              </button>
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "orders" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FaMapLocationDot className="text-lg" /> Order History
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "settings" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FaUserGear className="text-lg" /> Settings
              </button>
            </nav>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3 mt-8 rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <FaArrowRightFromBracket className="text-lg" /> Secure Log Out
            </button>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-white mb-8">Welcome back, {user.name}.</h1>
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-6 shadow-lg">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Vault Value</p>
                  <p className="text-4xl font-black text-white">${totalSpent}</p>
                </div>
                <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-6 shadow-lg">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Secured Drops</p>
                  <p className="text-4xl font-black text-white">{orders.length}</p>
                </div>
              </div>

              {/* Latest Order Mini-View */}
              <h2 className="text-xl font-bold text-white mb-4">Latest Mission</h2>
              {orders.length > 0 ? (
                <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-lg group">
                  <div className="w-24 h-24 shrink-0 bg-white/5 rounded-xl p-3 flex items-center justify-center">
                    <img 
                      src={orders[0].items[0]?.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} 
                      alt="Order Thumbnail" 
                      className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" 
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-white text-lg">#VAULT-{orders[0].id.slice(-6).toUpperCase()}</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Placed on {new Date(orders[0].createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      orders[0].status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {orders[0].status}
                    </span>
                  </div>
                  <button onClick={() => setActiveTab("orders")} className="shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors text-slate-400">
                    <FaChevronRight />
                  </button>
                </div>
              ) : (
                <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-8 text-center shadow-lg">
                  <p className="text-slate-500">No missions yet. Your vault is empty.</p>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-white mb-8">Order History</h1>
              <div className="space-y-4">
                {orders.length > 0 ? orders.map((order, i) => (
                  <div key={i} className="bg-[#0a0514] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-purple-500/50 transition-colors shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 shrink-0 bg-white/5 rounded-xl p-2 flex items-center justify-center">
                        <img 
                          src={order.items[0]?.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} 
                          alt="Thumbnail" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">#VAULT-{order.id.slice(-6).toUpperCase()}</h3>
                        <p className="text-slate-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="font-black text-white text-lg">${order.total}</p>
                        <p className={`text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'text-emerald-500' : 'text-purple-400'}`}>
                          {order.status}
                        </p>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm font-bold underline underline-offset-4">Details</button>
                    </div>
                  </div>
                )) : (
                   <p className="text-slate-500 italic">No orders found.</p>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-white mb-8">Account Settings</h1>
              <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-8 shadow-lg max-w-2xl">
                <form className="space-y-6">
                  <div>
                    <label className="block text-slate-400 text-sm font-bold mb-2">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-bold mb-2">Email Address</label>
                    {/* Make email readonly since Clerk manages the core identity! */}
                    <input type="email" readOnly defaultValue={user.email} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-500 focus:outline-none cursor-not-allowed" />
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <button type="button" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}