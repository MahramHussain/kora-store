"use client";

import { useState } from "react";
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { CURRENCY } from "@/lib/constants";

export default function AccountUI({ user, orders }: { user: any, orders: any[] }) {
  const [isLogin, setIsLogin] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // ==========================================
  // STATE 1: LOGGED IN (FALLBACK/LEGACY DASHBOARD VIEW - NOW LIGHT THEME)
  // ==========================================
  if (user) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 min-h-[70vh] animate-fade-in-up">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12 border-b border-slate-200 pb-6 md:pb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-kora shadow-md shadow-kora/15"
            />
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, <span className="text-kora">{user.firstName || 'Member'}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 p-2 rounded-full flex items-center justify-center shadow-sm">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order History Card */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Order History</h2>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div 
                      key={order.id} 
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col hover:border-kora/50 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="text-kora text-xs font-bold uppercase tracking-widest mb-1">
                            Order #{order.referenceNumber || order.id.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-slate-800 font-bold mb-2">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex -space-x-3">
                            {order.items.slice(0, 3).map((item: any, idx: number) => (
                              <div key={idx} className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                                <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="Gear" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-10 h-10 rounded-full bg-kora border border-white flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <div className="text-slate-900 font-black text-2xl">{CURRENCY}{parseFloat(order.total).toFixed(2)}</div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              order.status === 'Processing' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 
                              order.status === 'Shipped' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                              'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-xs text-slate-400 group-hover:text-kora transition-colors">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Order Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-200 text-sm font-sans animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Order Items List */}
                          <div className="mb-6 pb-6 border-b border-slate-200">
                            <h4 className="text-kora text-xs font-bold uppercase tracking-wider mb-3">Secured Items</h4>
                            <div className="space-y-3">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center gap-4 bg-slate-50/50 border border-slate-200/60 rounded-xl p-3 shadow-xs">
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Shipping Intel */}
                            <div className="space-y-3">
                              <h4 className="text-kora text-xs font-bold uppercase tracking-wider mb-2">Shipping Intel</h4>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Recipient:</span> <span className="text-slate-800 font-bold">{order.shippingName || "Vault Shopper"}</span></p>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Phone:</span> <span className="text-slate-800 font-bold">{order.shippingPhone || "N/A"}</span></p>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Address:</span> <span className="text-slate-800 font-bold">{order.shippingStreet || "N/A"}, {order.shippingCity || "N/A"}</span></p>
                              <p className="flex justify-between md:justify-start md:gap-4"><span className="text-slate-500 min-w-[80px]">Payment:</span> <span className="text-slate-800 font-bold uppercase">{order.paymentMethod || "Card"}</span></p>
                            </div>

                          {/* Right: Invoice Summary */}
                          <div className="space-y-3 bg-slate-50 rounded-2xl p-5 border border-slate-200 relative overflow-hidden">
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
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No recent orders found in the Vault.</p>
                <Link href="/shop" className="inline-block bg-kora hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-md shadow-kora/15">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Account Settings Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm h-max">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Vault Settings</h2>
            <div className="space-y-4 text-sm font-medium">
              <button className="w-full text-left flex items-center justify-between text-slate-600 hover:text-kora transition-colors group">
                <div className="flex flex-col gap-1">
                  <span>Shipping Address</span>
                  <span className="text-xs text-slate-400">Default: Dibba Al-Fujairah, UAE</span>
                </div>
                <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="h-px bg-slate-100 w-full"></div>
              <button className="w-full text-left flex items-center justify-between text-slate-600 hover:text-kora transition-colors group">
                Payment Methods <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="h-px bg-slate-100 w-full"></div>
              <button className="w-full text-left flex items-center justify-between text-slate-600 hover:text-kora transition-colors group">
                Notification Preferences <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              {(user?.email === "mahramh40@gmail.com" || user?.email === "korastore.ae@gmail.com") && (
                <>
                  <div className="h-px bg-slate-100 w-full"></div>
                  <Link href="/admin" className="w-full text-left flex items-center justify-between text-kora hover:text-purple-700 transition-colors group font-bold">
                    Command Center <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // STATE 2: LOGGED OUT (SHOW CUSTOM LOGIN UI - LIGHT THEME OVERHAUL)
  // ==========================================
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-kora selection:text-white pt-24 pb-16 px-4 sm:px-6 md:pt-32 md:pb-24 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kora/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            THE <span className="text-kora drop-shadow-[0_0_8px_rgba(107,0,255,0.25)]">VAULT.</span>
          </h1>
          <p className="text-slate-500 font-medium">
            {isLogin ? "Enter your credentials to access your gear." : "Join the ultimate premium football community."}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden flex justify-center min-h-[400px]">
          {isLogin ? (
            <SignIn fallbackRedirectUrl="/account" appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0 m-0",
                header: "hidden", 
                footer: "hidden", 
                formButtonPrimary: "bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-kora/15",
                formFieldInput: "bg-white border border-slate-200 text-slate-900 py-3 rounded-xl focus:border-kora focus:ring-1 focus:ring-kora",
                formFieldLabel: "text-slate-500 font-bold",
                dividerText: "text-slate-400 font-bold uppercase tracking-wider",
                socialButtonsBlockButton: "border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold transition-all shadow-sm",
                socialButtonsBlockButtonText: "font-bold",
                identityPreviewText: "text-kora",
                identityPreviewEditButton: "text-slate-400 hover:text-slate-950"
              }
            }} />
          ) : (
            <SignUp fallbackRedirectUrl="/account" appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0 m-0",
                header: "hidden",
                footer: "hidden",
                formButtonPrimary: "bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-kora/15",
                formFieldInput: "bg-white border border-slate-200 text-slate-900 py-3 rounded-xl focus:border-kora focus:ring-1 focus:ring-kora",
                formFieldLabel: "text-slate-500 font-bold",
                dividerText: "text-slate-400 font-bold uppercase tracking-wider",
                socialButtonsBlockButton: "border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold transition-all shadow-sm",
                socialButtonsBlockButtonText: "font-bold",
              }
            }} />
          )}
        </div>

        <div className="text-center mt-8 relative z-10 font-sans">
          <p className="text-slate-500 font-semibold">
            {isLogin ? "Don't have an account?" : "Already secured your spot?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-slate-800 font-bold hover:text-kora transition-colors underline underline-offset-4"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

      </div>
    </main>
  );
}