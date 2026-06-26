"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBoxOpen, FaMapLocationDot, FaUserGear, FaArrowRightFromBracket, FaChevronRight } from "react-icons/fa6";
import { useClerk, useUser } from "@clerk/nextjs";
import { CURRENCY } from "@/lib/constants";

export default function DashboardUI({ user, orders }: { user: any, orders: any[] }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Local state for profile update
  const [nameInput, setNameInput] = useState(user.name);
  const [saveStatus, setSaveStatus] = useState("");

  const handleLogout = () => {
    signOut(() => router.push("/"));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) {
      setSaveStatus("❌ Session not loaded. Try again.");
      return;
    }
    setSaveStatus("Saving changes...");
    try {
      await clerkUser.update({
        firstName: nameInput,
      });
      setSaveStatus("✅ Profile updated successfully!");
    } catch (err: any) {
      console.error("[PROFILE_UPDATE_ERROR]", err);
      setSaveStatus("❌ " + (err.errors?.[0]?.message || "Failed to update profile."));
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-kora selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-32 shadow-md">
            
            {/* User Profile Snippet */}
            <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-kora shadow-md shadow-kora/15" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white font-black text-2xl shadow-md">
                  {(clerkUser?.firstName || user.name).charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-lg leading-tight truncate">{clerkUser?.firstName || user.name}</h2>
                <p className="text-xs text-slate-500">Vault Member since '{user.memberSince}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "overview" ? "bg-kora text-white shadow-md shadow-kora/15" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FaBoxOpen className="text-lg" /> Overview
              </button>
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "orders" ? "bg-kora text-white shadow-md shadow-kora/15" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FaMapLocationDot className="text-lg" /> Order History
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === "settings" ? "bg-kora text-white shadow-md shadow-kora/15" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FaUserGear className="text-lg" /> Settings
              </button>

              {/* Admin command center quick link */}
              {(user.email === "mahramh40@gmail.com" || user.email === "korastore.ae@gmail.com") && (
                <Link 
                  href="/admin"
                  className="flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-kora hover:bg-kora/10 hover:text-purple-700 transition-all border border-kora/20 mt-2"
                >
                  <FaUserGear className="text-lg" /> Command Center
                </Link>
              )}
            </nav>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3 mt-8 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors"
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
              <h1 className="text-3xl font-black text-slate-900 mb-8">Welcome back, {clerkUser?.firstName || user.name}.</h1>
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Vault Value</p>
                  <p className="text-4xl font-black text-slate-900">{CURRENCY}{totalSpent}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Secured Drops</p>
                  <p className="text-4xl font-black text-slate-900">{orders.length}</p>
                </div>
              </div>

              {/* Latest Order Mini-View */}
              <h2 className="text-xl font-bold text-slate-900 mb-4">Latest Mission</h2>
              {orders.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm group hover:border-kora/40 transition-colors">
                  <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-2xl p-3 flex items-center justify-center border border-slate-100">
                    <img 
                      src={orders[0].items[0]?.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} 
                      alt="Order Thumbnail" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain opacity-90 group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-slate-900 text-lg">#VAULT-{orders[0].id.slice(-6).toUpperCase()}</h3>
                    <p className="text-slate-500 text-sm mb-2">
                      Placed on {new Date(orders[0].createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      orders[0].status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-purple-50 text-kora border-purple-200'
                    }`}>
                      {orders[0].status}
                    </span>
                  </div>
                  <button onClick={() => setActiveTab("orders")} className="shrink-0 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-kora hover:text-white transition-colors text-slate-400">
                    <FaChevronRight />
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
                  <p className="text-slate-400 font-medium">No missions yet. Your vault is empty.</p>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-slate-900 mb-8">Order History</h1>
              <div className="space-y-4">
                {orders.length > 0 ? orders.map((order, i) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div 
                      key={order.id} 
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col hover:border-kora/40 transition-all duration-300 cursor-pointer shadow-sm group"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
                        <div className="flex items-center gap-6 self-start sm:self-center">
                          <div className="w-16 h-16 shrink-0 bg-slate-50 rounded-2xl p-2 flex items-center justify-center border border-slate-100">
                            <img 
                              src={order.items[0]?.product?.images?.[0] || order.items[0]?.image || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} 
                              alt="Thumbnail" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">#VAULT-{order.referenceNumber || order.id.slice(-6).toUpperCase()}</h3>
                            <p className="text-slate-500 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left sm:text-right font-sans">
                            <p className="font-black text-slate-900 text-lg">{CURRENCY}{parseFloat(order.total).toFixed(2)}</p>
                            <p className={`text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'text-emerald-600' : 'text-kora'}`}>
                              {order.status}
                            </p>
                          </div>
                          <span className="text-kora hover:text-purple-700 text-sm font-bold underline underline-offset-4">
                            {isExpanded ? "Collapse" : "Details"}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Order Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-200 text-sm font-sans animate-fade-in-up w-full text-left" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Order Items List */}
                          <div className="mb-6 pb-6 border-b border-slate-200">
                            <h4 className="text-kora text-xs font-bold uppercase tracking-wider mb-3">Secured Items</h4>
                            <div className="space-y-3">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                                      <img src={item.product?.images?.[0] || item.image || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="Gear" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.product?.name || "Premium Gear"}</p>
                                      <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                                        Size: <span className="font-bold text-slate-700">{item.size}</span>
                                        {(item.customName || item.customNumber) && (
                                          <>
                                            <span className="mx-1.5">•</span>
                                            Print: <span className="font-bold text-kora">{item.customName || "—"} {item.customNumber ? `#${item.customNumber}` : ""}</span>
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right font-sans">
                                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{CURRENCY}{parseFloat(item.price).toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            {/* Left: Shipping Intel */}
                            <div className="space-y-3">
                              <h4 className="text-kora text-xs font-bold uppercase tracking-wider mb-2">Shipping Intel</h4>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Recipient:</span> <span className="text-slate-800 font-bold">{order.shippingName || "Vault Shopper"}</span></p>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Phone:</span> <span className="text-slate-800 font-bold">{order.shippingPhone || "N/A"}</span></p>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Address:</span> <span className="text-slate-800 font-bold">{order.shippingStreet || "N/A"}, {order.shippingCity || "N/A"}</span></p>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Payment:</span> <span className="text-slate-800 font-bold uppercase">{order.paymentMethod || "Card"}</span></p>
                            </div>

                            {/* Right: Invoice Summary */}
                            <div className="space-y-3 bg-slate-50 rounded-2xl p-5 border border-slate-200 relative overflow-hidden h-max">
                              <h4 className="text-kora text-xs font-bold uppercase tracking-wider mb-2">Invoice Breakdown</h4>
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>Items Subtotal</span>
                                <span>{CURRENCY}{(parseFloat(order.total) - parseFloat(order.shippingFee || "10") + parseFloat(order.discountAmount || "0")).toFixed(2)}</span>
                              </div>
                              {order.promoCode && (
                                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                                  <span>Promo Discount ({order.promoCode})</span>
                                  <span>-{CURRENCY}{parseFloat(order.discountAmount || "0").toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>Priority Delivery</span>
                                <span>{CURRENCY}{parseFloat(order.shippingFee || "10").toFixed(2)}</span>
                              </div>
                              <div className="h-px bg-slate-200 my-2"></div>
                              <div className="flex justify-between items-center text-base font-bold text-slate-800">
                                <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Total AED</span>
                                <span className="text-2xl font-black text-kora">{CURRENCY}{parseFloat(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                   <p className="text-slate-500 italic">No orders found.</p>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-slate-900 mb-8">Account Settings</h1>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-slate-500 text-sm font-bold mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={nameInput} 
                      onChange={e => setNameInput(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-sm font-bold mb-2">Email Address</label>
                    <input type="email" readOnly defaultValue={user.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-400 focus:outline-none cursor-not-allowed shadow-sm" />
                  </div>

                  {saveStatus && (
                    <p className={`text-sm font-bold ${saveStatus.startsWith("✅") ? "text-emerald-600" : saveStatus.startsWith("❌") ? "text-rose-600" : "text-kora"}`}>
                      {saveStatus}
                    </p>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <button type="submit" className="bg-kora hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md shadow-kora/15">
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