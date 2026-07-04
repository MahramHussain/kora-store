"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTruckFast, FaArrowRotateLeft, FaBoxOpen } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";

export default function ShippingReturnsPage() {
  const [activeTab, setActiveTab] = useState<"shipping" | "returns">("shipping");

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-16 pb-16 px-4 sm:px-6 md:pt-20 md:pb-20">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-10 mt-8 sm:mb-16 sm:mt-12">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 tracking-tight uppercase">
          LOGISTICS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">GUARANTEES.</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-sans">
          We handle the logistics so you can handle the pitch. Fast local delivery across the Emirates and a no-nonsense return policy.
        </p>
      </section>

      {/* The Tab Controller */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-2xl relative shadow-sm">
          <button
            onClick={() => setActiveTab("shipping")}
            className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-1.5 sm:gap-3 ${
              activeTab === "shipping" ? "text-white shadow-md" : "text-slate-500 hover:text-kora"
            }`}
          >
            <FaTruckFast className="text-sm sm:text-xl" />
            Shipping Intel
          </button>
          
          <button
            onClick={() => setActiveTab("returns")}
            className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-1.5 sm:gap-3 ${
              activeTab === "returns" ? "text-white shadow-md" : "text-slate-500 hover:text-kora"
            }`}
          >
            <FaArrowRotateLeft className="text-sm sm:text-xl" />
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
          <div className="animate-fade-in-up space-y-6 sm:space-y-8 font-sans">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm">
              <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-200 pb-6 sm:pb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-purple-100 rounded-xl flex items-center justify-center text-kora text-xl sm:text-2xl shadow-sm">
                  <FaTruckFast />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">UAE Priority Delivery</h3>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans">
                    Because we stock our inventory locally in the UAE, we bypass the month-long waits of overseas dropshipping. Once your order is verified, it is processed and handed off to our local couriers. You can expect your gear at your door within <strong className="text-slate-900">48 hours</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-fuchsia-100 rounded-xl flex items-center justify-center text-fuchsia-600 text-xl sm:text-2xl shadow-sm">
                  <FaBoxOpen />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">Order Tracking</h3>
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
          <div className="animate-fade-in-up space-y-6 sm:space-y-8 font-sans">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm space-y-8">
              
              {/* Printed vs Non-printed jerseys rule */}
              <div className="flex items-start gap-4 sm:gap-6 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 text-xl sm:text-2xl shadow-sm">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">Printed vs Non-Printed Items</h3>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans mb-3">
                    <strong className="text-rose-600 font-extrabold uppercase">Custom Printed Jerseys:</strong> Jerseys with printed names or numbers are <strong className="text-slate-900">non-returnable and non-exchangeable</strong> under any circumstances.
                  </p>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans">
                    <strong className="text-slate-900 font-extrabold uppercase">Non-Printed Jerseys:</strong> Eligible for exchange only if:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1.5 text-xs sm:text-sm text-slate-500 font-sans">
                    <li>Completely unused and unwashed</li>
                    <li>Returned in their original packaging</li>
                    <li>All original tags are attached</li>
                  </ul>
                </div>
              </div>

              {/* Exchange Fee */}
              <div className="flex items-start gap-4 sm:gap-6 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl sm:text-2xl shadow-sm">
                  <span className="font-extrabold text-sm sm:text-lg">AED</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">Exchange Fee</h3>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans">
                    A flat <strong className="text-slate-900">25 AED delivery fee</strong> applies to all exchange requests to cover logistics and courier operations.
                  </p>
                </div>
              </div>

              {/* Refunds and Claims window */}
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-xl sm:text-2xl shadow-sm">
                  <FaArrowRotateLeft />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">Refunds & Claims</h3>
                  <ul className="space-y-3 text-xs sm:text-base text-slate-600 font-sans">
                    <li>
                      <strong className="text-slate-900">Damaged Items Only:</strong> Refunds are processed <strong className="text-rose-600">only</strong> if you receive a damaged item.
                    </li>
                    <li>
                      <strong className="text-slate-900">48-Hour Claim Window:</strong> All refund and exchange requests must be made within <strong className="text-slate-900">48 hours</strong> of receiving the order. Requests made after 48 hours will not be accepted.
                    </li>
                    <li>
                      <strong className="text-slate-900">Refund Processing:</strong> Once the returned item is received and inspected, refunds will be processed to your bank account within <strong className="text-slate-900">3-4 business days</strong> (or any bank account of your choice if you do not have your own).
                    </li>
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