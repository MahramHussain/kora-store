"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBoxOpen, FaMapLocationDot, FaUserGear,
  FaArrowRightFromBracket, FaChevronRight, FaChevronDown, FaTruckFast,
} from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import { useClerk, useUser } from "@clerk/nextjs";
import { CURRENCY } from "@/lib/constants";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Delivered"
      ? "order-status-delivered"
      : status === "Shipped"
      ? "order-status-shipped"
      : "order-status-processing";
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {status}
    </span>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const steps = ["Processing", "Shipped", "Delivered"];
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4 mb-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i <= idx ? "bg-kora text-white shadow-md shadow-kora/30" : "bg-slate-100 text-slate-300 border border-slate-200"}`}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${i <= idx ? "text-kora" : "text-slate-300"}`}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${i < idx ? "bg-kora" : "bg-slate-100"}`} />
          )}
        </div>
      ))}
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

  const handleLogout = () => signOut(() => router.push("/"));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) { setSaveStatus("❌ Session not loaded. Try again."); return; }
    setSaveStatus("Saving...");
    try {
      await clerkUser.update({ firstName: nameInput });
      setSaveStatus("✅ Profile updated successfully!");
    } catch (err: any) {
      setSaveStatus("❌ " + (err.errors?.[0]?.message || "Failed to update profile."));
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total), 0).toFixed(2);

  const navItems: { id: "overview" | "orders" | "settings"; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FaBoxOpen className="text-lg" /> },
    { id: "orders", label: "Order History", icon: <FaMapLocationDot className="text-lg" /> },
    { id: "settings", label: "Settings", icon: <FaUserGear className="text-lg" /> },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-kora selection:text-white pt-20 pb-16 px-4 sm:px-6 md:pt-24 md:pb-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12">

        {/* ── SIDEBAR ── */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden sticky top-28 shadow-sm">

            {/* Gradient profile header */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 pb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-kora/30 to-purple-900/20 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-4">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-14 h-14 rounded-full border-2 border-kora/60 shadow-lg" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-kora to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {(clerkUser?.firstName || user.name).charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-black text-white text-base leading-tight truncate">{clerkUser?.firstName || user.name}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Member since &apos;{user.memberSince}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 text-[9px] font-bold uppercase tracking-wider">Vault Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="p-3 space-y-1 -mt-4 relative z-10">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === item.id
                      ? "bg-kora text-white shadow-md shadow-kora/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {activeTab === item.id && <FaChevronRight className="ml-auto text-xs opacity-60" />}
                </button>
              ))}

              {(user.email === "mahramh40@gmail.com" || user.email === "korastore.ae@gmail.com") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-bold text-sm text-kora border border-kora/20 hover:bg-kora/5 transition-all mt-2"
                >
                  <FaUserGear className="text-lg" />
                  Command Center
                </Link>
              )}
            </nav>

            {/* Divider + logout */}
            <div className="px-3 pb-3">
              <div className="h-px bg-slate-100 mb-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <FaArrowRightFromBracket className="text-lg" />
                Secure Log Out
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="flex-1 min-w-0">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Welcome back, {clerkUser?.firstName || user.name}.
                </h1>
                <p className="text-slate-400 text-sm mt-1">Here&apos;s a snapshot of your vault activity.</p>
              </div>

              {/* KPI stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="stat-card">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Total Vault Value</p>
                  <p className="text-4xl font-black text-slate-900">{CURRENCY}{totalSpent}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <FaTruckFast className="text-kora text-sm" />
                    <span className="text-xs text-slate-400 font-medium">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Secured Drops</p>
                  <p className="text-4xl font-black text-slate-900">{orders.length}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <FaBoxOpen className="text-purple-500 text-sm" />
                    <span className="text-xs text-slate-400 font-medium">All time</span>
                  </div>
                </div>

                <div className="stat-card sm:col-span-2 lg:col-span-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Vault Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-2xl font-black text-emerald-600">Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <FaShieldAlt className="text-emerald-500 text-sm" />
                    <span className="text-xs text-slate-400 font-medium">Member since &apos;{user.memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Latest order */}
              <div>
                <h2 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-wide">Latest Mission</h2>
                {orders.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 group hover:border-kora/30 transition-all shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="w-20 h-20 shrink-0 bg-slate-50 rounded-2xl p-3 flex items-center justify-center border border-slate-100">
                        <img
                          src={orders[0].items[0]?.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"}
                          alt="Order"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h3 className="font-black text-slate-900">#VAULT-{orders[0].id.slice(-6).toUpperCase()}</h3>
                            <p className="text-slate-400 text-sm">{new Date(orders[0].createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={orders[0].status} />
                            <span className="font-black text-slate-900">{CURRENCY}{parseFloat(orders[0].total).toFixed(2)}</span>
                          </div>
                        </div>
                        <StatusTimeline status={orders[0].status} />
                      </div>
                      <button onClick={() => setActiveTab("orders")} className="shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-kora hover:text-white transition-colors text-slate-400">
                        <FaChevronRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
                    <FaBoxOpen className="text-4xl text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium mb-4">Your vault is empty. Start your first mission.</p>
                    <Link href="/shop" className="inline-block bg-kora text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-purple-700 transition-colors shadow-md shadow-kora/20">
                      Shop The Vault
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="animate-fade-in-up">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
                <p className="text-slate-400 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-4">
                {orders.length > 0 ? orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-kora/30 transition-all shadow-sm"
                    >
                      {/* Order header row */}
                      <div
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer"
                      >
                        <div className="flex items-center gap-4 sm:gap-5">
                          <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-2xl p-2 flex items-center justify-center border border-slate-100">
                            <img
                              src={order.items[0]?.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"}
                              alt="Thumbnail"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-sm">#VAULT-{order.referenceNumber || order.id.slice(-6).toUpperCase()}</h3>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {" · "}{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} items
                            </p>
                            <div className="flex -space-x-2 mt-2">
                              {order.items.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="w-7 h-7 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                                  <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="w-7 h-7 rounded-full bg-kora border border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                                  +{order.items.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:ml-auto">
                          <div className="text-right">
                            <p className="font-black text-slate-900 text-lg">{CURRENCY}{parseFloat(order.total).toFixed(2)}</p>
                            <StatusBadge status={order.status} />
                          </div>
                          <FaChevronDown className={`text-slate-300 text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {/* Expandable details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 p-5 sm:p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                          <StatusTimeline status={order.status} />

                          {/* Items */}
                          <div className="mb-6 mt-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-kora mb-3">Secured Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                                      <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="Gear" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.product?.name || "Premium Gear"}</p>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Size: <span className="font-bold text-slate-600">{item.size}</span>
                                        {(item.customName || item.customNumber) && (
                                          <> · Print: <span className="font-bold text-kora">{item.customName} {item.customNumber ? `#${item.customNumber}` : ""}</span></>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{CURRENCY}{parseFloat(item.price).toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Shipping */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-kora mb-2">Shipping Info</h4>
                              {[
                                ["Recipient", order.shippingName || "Vault Shopper"],
                                ["Phone", order.shippingPhone || "N/A"],
                                ["Address", `${order.shippingStreet || "N/A"}, ${order.shippingCity || "N/A"}`],
                                ["Payment", order.paymentMethod || "Card"],
                              ].map(([label, val]) => (
                                <div key={label} className="flex gap-3 text-xs">
                                  <span className="text-slate-400 w-20 shrink-0">{label}:</span>
                                  <span className="text-slate-800 font-bold">{val}</span>
                                </div>
                              ))}
                            </div>

                            {/* Invoice */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-kora mb-2">Invoice</h4>
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>Subtotal</span>
                                <span>{CURRENCY}{(parseFloat(order.total) - parseFloat(order.shippingFee || "10") + parseFloat(order.discountAmount || "0")).toFixed(2)}</span>
                              </div>
                              {order.promoCode && (
                                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                                  <span>Promo ({order.promoCode})</span>
                                  <span>-{CURRENCY}{parseFloat(order.discountAmount || "0").toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>Delivery</span>
                                <span>{CURRENCY}{parseFloat(order.shippingFee || "10").toFixed(2)}</span>
                              </div>
                              <div className="h-px bg-slate-200 my-1" />
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</span>
                                <span className="text-xl font-black text-kora">{CURRENCY}{parseFloat(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
                    <FaBoxOpen className="text-4xl text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium mb-4">No orders yet. The vault awaits.</p>
                    <Link href="/shop" className="inline-block bg-kora text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-purple-700 transition-colors shadow-md shadow-kora/20">
                      Shop The Vault
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="animate-fade-in-up">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-400 text-sm mt-1">Manage your Vault profile.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-slate-500 text-sm font-bold mb-2 uppercase tracking-wider">First Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-sm font-bold mb-2 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      readOnly
                      defaultValue={user.email}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-slate-400 cursor-not-allowed shadow-sm font-medium"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Email is managed via Clerk authentication.</p>
                  </div>

                  {saveStatus && (
                    <p className={`text-sm font-bold ${saveStatus.startsWith("✅") ? "text-emerald-600" : saveStatus.startsWith("❌") ? "text-rose-600" : "text-kora"}`}>
                      {saveStatus}
                    </p>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                    <button
                      type="submit"
                      className="bg-kora hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md shadow-kora/15 text-sm uppercase tracking-wider"
                    >
                      Save Changes
                    </button>
                    <span className="text-xs text-slate-400">Changes apply immediately</span>
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