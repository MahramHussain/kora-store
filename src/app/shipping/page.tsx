"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTruckFast, FaArrowRotateLeft, FaBoxOpen } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";

export default function ShippingReturnsPage() {
  const [activeTab, setActiveTab] = useState<"shipping" | "returns">("shipping");

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-20 pb-20 px-6">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16 mt-12">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
          LOGISTICS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-500">GUARANTEES.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          We handle the logistics so you can handle the pitch. Fast local delivery across the Emirates and a no-nonsense return policy.
        </p>
      </section>

      {/* The Tab Controller */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm relative">
          <button
            onClick={() => setActiveTab("shipping")}
            className={`flex-1 py-4 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-3 ${
              activeTab === "shipping" ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <FaTruckFast className="text-xl" />
            Shipping Intel
          </button>
          
          <button
            onClick={() => setActiveTab("returns")}
            className={`flex-1 py-4 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-3 ${
              activeTab === "returns" ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <FaArrowRotateLeft className="text-xl" />
            Return Policy
          </button>

          {/* Animated Highlight Background */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-purple-600 rounded-xl transition-transform duration-500 ease-out shadow-[0_0_20px_rgba(147,51,234,0.4)] ${
              activeTab === "shipping" ? "translate-x-0" : "translate-x-full left-1"
            }`}
          ></div>
        </div>
      </section>

      {/* Tab Content Area */}
      <section className="max-w-3xl mx-auto min-h-[400px]">
        
        {/* SHIPPING CONTENT */}
        {activeTab === "shipping" && (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-8 md:p-10">
              <div className="flex items-start gap-6 mb-8 border-b border-white/10 pb-8">
                <div className="w-14 h-14 shrink-0 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 text-2xl">
                  <FaTruckFast />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">UAE Standard Delivery</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Because we stock our inventory locally in the UAE, we bypass the month-long waits of overseas dropshipping. Once your order is verified, it is processed and handed off to our local couriers. You can expect your gear at your door within <strong className="text-white">1 to 3 business days</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 shrink-0 bg-fuchsia-500/10 rounded-xl flex items-center justify-center text-fuchsia-400 text-2xl">
                  <FaBoxOpen />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Order Tracking</h3>
                  <p className="text-slate-400 leading-relaxed">
                    As soon as your package leaves The Vault, you will receive a WhatsApp message and email containing your live tracking link. Our couriers will contact you directly on the day of delivery to confirm your drop-off window.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
              <p className="text-rose-400 font-medium">
                <span className="font-bold">Note:</span> We currently do not offer international shipping. Kora Store is an exclusive service for residents of the United Arab Emirates.
              </p>
            </div>
          </div>
        )}

        {/* RETURNS CONTENT */}
        {activeTab === "returns" && (
          <div className="animate-fade-in-up space-y-8">
            <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-8 md:p-10">
              <div className="flex items-start gap-6 mb-8 border-b border-white/10 pb-8">
                <div className="w-14 h-14 shrink-0 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 text-2xl">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">The 7-Day Guarantee</h3>
                  <p className="text-slate-400 leading-relaxed">
                    We stand by the premium grade of our gear. If you need a different size or aren't entirely satisfied, you have <strong className="text-white">7 days</strong> from the date of delivery to request an exchange or return. 
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 shrink-0 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 text-2xl">
                  <FaArrowRotateLeft />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Strict Conditions</h3>
                  <ul className="space-y-3 text-slate-400 list-disc list-inside">
                    <li>Items must be <strong className="text-white">unworn and unwashed</strong>.</li>
                    <li>All original tags must still be attached to the garments.</li>
                    <li>Boots must be returned in their original, undamaged box.</li>
                    <li>Player Issue kits cannot be returned if they have custom name/number printing.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Return Action CTA */}
            <div className="text-center mt-8">
              <p className="text-slate-400 mb-4">Need to initiate a return or swap a size?</p>
              <Link href="mailto:support@korastore.com" className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Email Support
              </Link>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}