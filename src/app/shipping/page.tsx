"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTruckFast, FaArrowRotateLeft, FaBoxOpen } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";

export default function ShippingReturnsPage() {
  const [activeTab, setActiveTab] = useState<"shipping" | "returns">("shipping");

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-20 pb-20 px-6">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16 mt-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight uppercase">
          LOGISTICS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">GUARANTEES.</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto font-sans">
          We handle the logistics so you can handle the pitch. Fast local delivery across the Emirates and a no-nonsense return policy.
        </p>
      </section>

      {/* The Tab Controller */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-2xl relative shadow-sm">
          <button
            onClick={() => setActiveTab("shipping")}
            className={`flex-1 py-4 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-3 ${
              activeTab === "shipping" ? "text-white shadow-md" : "text-slate-500 hover:text-kora"
            }`}
          >
            <FaTruckFast className="text-xl" />
            Shipping Intel
          </button>
          
          <button
            onClick={() => setActiveTab("returns")}
            className={`flex-1 py-4 text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-3 ${
              activeTab === "returns" ? "text-white shadow-md" : "text-slate-500 hover:text-kora"
            }`}
          >
            <FaArrowRotateLeft className="text-xl" />
            Return Policy
          </button>

          {/* Animated Highlight Background */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-kora rounded-xl transition-transform duration-500 ease-out shadow-md shadow-kora/30 ${
              activeTab === "shipping" ? "translate-x-0" : "translate-x-full left-1"
            }`}
          ></div>
        </div>
      </section>

      {/* Tab Content Area */}
      <section className="max-w-3xl mx-auto min-h-[400px]">
        
        {/* SHIPPING CONTENT */}
        {activeTab === "shipping" && (
          <div className="animate-fade-in-up space-y-8 font-sans">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="flex items-start gap-6 mb-8 border-b border-slate-200 pb-8">
                <div className="w-14 h-14 shrink-0 bg-purple-100 rounded-xl flex items-center justify-center text-kora text-2xl shadow-sm">
                  <FaTruckFast />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">UAE Standard Delivery</h3>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    Because we stock our inventory locally in the UAE, we bypass the month-long waits of overseas dropshipping. Once your order is verified, it is processed and handed off to our local couriers. You can expect your gear at your door within <strong className="text-slate-900">1 to 3 business days</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 shrink-0 bg-fuchsia-100 rounded-xl flex items-center justify-center text-fuchsia-600 text-2xl shadow-sm">
                  <FaBoxOpen />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">Order Tracking</h3>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    As soon as your package leaves The Vault, you will receive a WhatsApp message and email containing your live tracking link. Our couriers will contact you directly on the day of delivery to confirm your drop-off window.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-rose-600 font-medium font-sans">
                <span className="font-bold">Note:</span> We currently do not offer international shipping. Kora Store is an exclusive service for residents of the United Arab Emirates.
              </p>
            </div>
          </div>
        )}

        {/* RETURNS CONTENT */}
        {activeTab === "returns" && (
          <div className="animate-fade-in-up space-y-8 font-sans">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="flex items-start gap-6 mb-8 border-b border-slate-200 pb-8">
                <div className="w-14 h-14 shrink-0 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-2xl shadow-sm">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">The 7-Day Guarantee</h3>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    We stand by the premium grade of our gear. If you need a different size or aren't entirely satisfied, you have <strong className="text-slate-900">7 days</strong> from the date of delivery to request an exchange or return. 
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 shrink-0 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-2xl shadow-sm">
                  <FaArrowRotateLeft />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">Strict Conditions</h3>
                  <ul className="space-y-3 text-slate-600 list-disc list-inside font-sans">
                    <li>Items must be <strong className="text-slate-900">unworn and unwashed</strong>.</li>
                    <li>All original tags must still be attached to the garments.</li>
                    <li>Shoes must be returned in their original, undamaged box.</li>
                    <li>Player Issue kits cannot be returned if they have custom name/number printing.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Return Action CTA */}
            <div className="text-center mt-8">
              <p className="text-slate-600 mb-4 font-sans">Need to initiate a return or swap a size?</p>
              <Link href="mailto:support@korastore.com" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 hover:bg-kora transition-all shadow-md hover:shadow-kora/30">
                Email Support
              </Link>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}