"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTruckFast, FaArrowRotateLeft, FaBoxOpen } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import { useTranslation } from "@/context/LanguageContext";

export default function ShippingReturnsPage() {
  const [activeTab, setActiveTab] = useState<"shipping" | "returns">("shipping");
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-16 pb-16 px-4 sm:px-6 md:pt-20 md:pb-20 text-start">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-10 mt-8 sm:mb-16 sm:mt-12 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 tracking-tight uppercase">
          {t("logistics_guarantees")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">{t("logistics_span")}</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-sans">
          {t("logistics_desc")}
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
            {t("shipping_intel")}
          </button>
          
          <button
            onClick={() => setActiveTab("returns")}
            className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-1.5 sm:gap-3 ${
              activeTab === "returns" ? "text-white shadow-md" : "text-slate-500 hover:text-kora"
            }`}
          >
            <FaArrowRotateLeft className="text-sm sm:text-xl" />
            {t("return_policy")}
          </button>

          {/* Animated Highlight Background */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-kora rounded-xl transition-transform duration-500 ease-out shadow-md shadow-kora/30 ltr:left-1 rtl:right-1 ${
              activeTab === "shipping" ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
            }`}
          ></div>
        </div>
      </section>

      {/* Tab Content Area */}
      <section className="max-w-3xl mx-auto min-h-[400px]">
        
        {/* SHIPPING CONTENT */}
        {activeTab === "shipping" && (
          <div className="animate-fade-in-up space-y-6 sm:space-y-8 font-sans text-start">
            
            {/* Table of delivery times */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-[11px] sm:text-sm text-start">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-4 text-start font-black uppercase text-slate-800 tracking-wider">{t("emirate")}</th>
                    <th className="px-4 py-4 text-start font-black uppercase text-slate-800 tracking-wider">{t("delivery_time")}</th>
                    <th className="px-4 py-4 text-start font-black uppercase text-slate-800 tracking-wider">{t("shipping_fee")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-bold text-slate-900">{t("dxb_shj_ajm")}</td>
                    <td className="px-4 py-4 text-slate-600">{t("business_days")}</td>
                    <td className="px-4 py-4 text-kora font-extrabold">{t("flat_rate")}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-bold text-slate-900">{t("auh_ad_alain")}</td>
                    <td className="px-4 py-4 text-slate-600">{t("business_days")}</td>
                    <td className="px-4 py-4 text-kora font-extrabold">{t("flat_rate")}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-bold text-slate-900">{t("rak_fuj_uaq")}</td>
                    <td className="px-4 py-4 text-slate-600">{t("business_days")}</td>
                    <td className="px-4 py-4 text-kora font-extrabold">{t("flat_rate")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm">
              <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-200 pb-6 sm:pb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-purple-100 rounded-xl flex items-center justify-center text-kora text-xl sm:text-2xl shadow-sm">
                  <FaTruckFast />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">{t("priority_delivery_title")}</h3>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans">
                    {t("priority_delivery_desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-fuchsia-100 rounded-xl flex items-center justify-center text-fuchsia-600 text-xl sm:text-2xl shadow-sm">
                  <FaBoxOpen />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">{t("order_tracking")}</h3>
                  <p className="text-slate-600 leading-relaxed font-sans">
                    {t("order_tracking_desc")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-rose-600 font-medium font-sans">
                {t("uae_only_note")}
              </p>
            </div>
          </div>
        )}

        {/* RETURNS CONTENT */}
        {activeTab === "returns" && (
          <div className="animate-fade-in-up space-y-6 sm:space-y-8 font-sans text-start">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm space-y-8">
              
              {/* Printed vs Non-printed jerseys rule */}
              <div className="flex items-start gap-4 sm:gap-6 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 text-xl sm:text-2xl shadow-sm">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">{t("printed_vs_non_printed")}</h3>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans mb-3">
                    {t("policy_detail_1")}
                  </p>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans">
                    {t("policy_detail_2")}
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1.5 text-xs sm:text-sm text-slate-500 font-sans">
                    <li>{t("return_rule_1")}</li>
                    <li>{t("return_rule_2")}</li>
                    <li>{t("return_rule_3")}</li>
                  </ul>
                </div>
              </div>

              {/* Exchange Fee */}
              <div className="flex items-start gap-4 sm:gap-6 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl sm:text-2xl shadow-sm">
                  <span className="font-extrabold text-sm sm:text-lg">{t("aed")}</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">{t("shipping_fee")}</h3>
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans">
                    {t("policy_detail_3")}
                  </p>
                </div>
              </div>

              {/* Refunds and Claims window */}
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-xl sm:text-2xl shadow-sm">
                  <FaArrowRotateLeft />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 mb-2">{t("refunds_claims")}</h3>
                  <ul className="space-y-3 text-xs sm:text-base text-slate-600 font-sans">
                    <li>
                      {t("policy_detail_4")}
                    </li>
                    <li>
                      {t("claim_window")}
                    </li>
                    <li>
                      {t("refund_processing_desc")}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Return Action CTA */}
            <div className="text-center mt-8">
              <p className="text-slate-600 mb-4 font-sans">{t("initiate_return_prompt")}</p>
              <Link href="mailto:support@korastore.com" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 hover:bg-kora transition-all shadow-md hover:shadow-kora/30">
                {t("email_support")}
              </Link>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}