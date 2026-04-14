"use client";

import { useState } from "react";
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

export default function AccountUI({ user, orders }: { user: any, orders: any[] }) {
  const [isLogin, setIsLogin] = useState(true);

  // ==========================================
  // STATE 1: LOGGED IN (SHOW SECURE DASHBOARD)
  // ==========================================
  if (user) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-16 min-h-[70vh] animate-fade-in-up">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            />
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Welcome back, <span className="text-purple-400">{user.firstName || 'Boss'}</span>
              </h1>
              <p className="text-slate-400 font-medium">
                {user.email}
              </p>
            </div>
          </div>
          
          {/* Clerk's Native Profile Manager Button */}
          <div className="bg-white/5 border border-white/10 p-2 rounded-full flex items-center justify-center">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order History Card (NOW DYNAMIC!) */}
          <div className="md:col-span-2 bg-[#0a0514] border border-white/10 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-4">Order History</h2>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-500/50 transition-colors">
                    <div>
                      <div className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-white font-bold mb-2">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex -space-x-3">
                        {/* Show tiny images of the actual gear they bought! */}
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="w-10 h-10 rounded-full bg-[#0a0514] border-2 border-[#1a1524] overflow-hidden flex items-center justify-center p-1">
                            <img src={item.product?.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png"} alt="Gear" className="w-full h-full object-contain" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-[#1a1524] flex items-center justify-center text-xs font-bold text-white">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-white font-black text-2xl">${order.total}</div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                        order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No recent orders found in the Vault.</p>
                <Link href="/shop" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-full transition-colors">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Account Settings Card */}
          <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-8 shadow-xl h-max">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">Vault Settings</h2>
            <div className="space-y-4 text-sm font-medium">
              <button className="w-full text-left flex items-center justify-between text-slate-300 hover:text-purple-400 transition-colors group">
                <div className="flex flex-col gap-1">
                  <span>Shipping Address</span>
                  <span className="text-xs text-slate-500">Default: Dibba Al-Fujairah, UAE</span>
                </div>
                <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="h-px bg-white/5 w-full"></div>
              <button className="w-full text-left flex items-center justify-between text-slate-300 hover:text-purple-400 transition-colors group">
                Payment Methods <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="h-px bg-white/5 w-full"></div>
              <button className="w-full text-left flex items-center justify-between text-slate-300 hover:text-purple-400 transition-colors group">
                Notification Preferences <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // STATE 2: LOGGED OUT (SHOW CUSTOM LOGIN UI)
  // ==========================================
  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            THE <span className="text-purple-500">VAULT.</span>
          </h1>
          <p className="text-slate-400">
            {isLogin ? "Enter your credentials to access your gear." : "Join the ultimate premium football community."}
          </p>
        </div>

        <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex justify-center min-h-[400px]">
          {isLogin ? (
            <SignIn fallbackRedirectUrl="/account" appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0 m-0",
                header: "hidden", 
                footer: "hidden", 
                formButtonPrimary: "bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all",
                formFieldInput: "bg-white/5 border border-white/10 text-white py-3 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                formFieldLabel: "text-slate-400 font-bold",
                dividerText: "text-slate-500 font-bold uppercase tracking-wider",
                socialButtonsBlockButton: "border border-white/10 text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-all",
                socialButtonsBlockButtonText: "font-bold",
                identityPreviewText: "text-purple-400",
                identityPreviewEditButton: "text-slate-400 hover:text-white"
              }
            }} />
          ) : (
            <SignUp fallbackRedirectUrl="/account" appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0 m-0",
                header: "hidden",
                footer: "hidden",
                formButtonPrimary: "bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all",
                formFieldInput: "bg-white/5 border border-white/10 text-white py-3 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                formFieldLabel: "text-slate-400 font-bold",
                dividerText: "text-slate-500 font-bold uppercase tracking-wider",
                socialButtonsBlockButton: "border border-white/10 text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-all",
                socialButtonsBlockButtonText: "font-bold",
              }
            }} />
          )}
        </div>

        <div className="text-center mt-8 relative z-10">
          <p className="text-slate-400">
            {isLogin ? "Don't have an account?" : "Already secured your spot?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-white font-bold hover:text-purple-400 transition-colors underline underline-offset-4"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

      </div>
    </main>
  );
}