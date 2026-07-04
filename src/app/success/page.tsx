"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCopy, FaBoxOpen, FaArrowRight } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa"; 
import { useCart } from "@/context/CartContext";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/context/LanguageContext";

function SuccessContent() {
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { clearCart } = useCart();
  
  // Extract reference number and payment intent from URL parameters
  const rawRef = searchParams.get("ref");
  const referenceNumber = rawRef ? `#${rawRef.toUpperCase()}` : "#KORA-8829";
  const trackingNumber = rawRef ? `KORA-TRK-${rawRef.split('-')[1] || '9827345'}` : "KORA-TRK-9827345";
  const paymentIntentId = searchParams.get("payment_intent_id");

  const [loading, setLoading] = useState(!!paymentIntentId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentIntentId || !rawRef) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceNumber: rawRef,
            paymentIntentId
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Verification failed");
        }

        const data = await res.json();
        if (data.success) {
          clearCart();
        } else {
          throw new Error(data.error || "Payment was not completed");
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setError(err.message || "Something went wrong verifying your transaction.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentIntentId, rawRef, clearCart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden text-start">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kora/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 border-4 border-kora border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-black uppercase text-slate-900 mb-2">{t("verifying_payment")}</h1>
          <p className="text-slate-500 font-semibold text-sm">{t("verifying_payment_desc")}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden text-start">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="max-w-md w-full text-center relative z-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-rose-500 text-3xl font-black">!</span>
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 mb-2">{t("payment_failed")}</h1>
          <p className="text-slate-500 font-semibold text-sm mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Link href="/checkout" className="bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-3.5 px-6 rounded-full text-xs transition-all shadow-md hover:scale-[1.02] flex items-center justify-center">
              {t("retry_checkout")}
            </Link>
            <Link href="/faq" className="text-slate-500 hover:text-slate-950 text-xs font-bold underline underline-offset-4">
              {t("get_help_support")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-kora selection:text-white pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden text-start">
      
      {/* Background Celebration Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kora/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
 
      <div className="max-w-2xl w-full relative z-10 flex flex-col items-center text-center animate-fade-in-up">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full animate-ping"></div>
          <FaCheckCircle className="text-5xl text-emerald-500 relative z-10" />
        </div>
 
        {/* Headlines */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
          {t("order_secured_title")}
        </h1>
        <p className="text-slate-500 font-semibold mb-10 max-w-lg font-sans">
          {t("order_secured_desc")}
        </p>
 
        {/* The Tracking Card */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl mb-10 relative overflow-hidden text-start">
          <div className="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-kora/5 rounded-bl-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 text-start">
            <FaBoxOpen className="text-xl text-kora" />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">{t("transmission_details")}</h2>
          </div>
 
          <div className="grid grid-cols-1 gap-6 text-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t("order_reference_label")}</p>
              <p className="text-lg font-black text-slate-900">{referenceNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t("tracking_number_label")}</p>
              
              {/* Copy-to-Clipboard Interactive Element */}
              <div 
                onClick={handleCopy}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100/50 transition-colors group"
              >
                <span className="font-mono text-kora font-bold tracking-widest text-lg">{trackingNumber}</span>
                <button className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${copied ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`}>
                  {copied ? t("copied_label") : <><FaCopy /> {t("copy_label")}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
 
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link href="/account/dashboard" className="flex-1 sm:flex-none bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-4 px-8 rounded-full transition-all flex justify-center items-center gap-3 shadow-md shadow-kora/20">
            {t("view_dashboard")}
          </Link>
          <Link href="/shop" className="flex-1 sm:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold uppercase tracking-widest py-4 px-8 rounded-full transition-all flex justify-center items-center gap-3">
            {t("back_to_shop")} <FaArrowRight className="rtl:rotate-180" />
          </Link>
        </div>
 
      </div>
    </main>
  );
}
 
export default function SuccessPage() {
  const cookieStore = typeof document !== "undefined" ? document.cookie : "";
  const lang = cookieStore.includes("lang=ar") ? "ar" : "en";
  const t = (key: string) => {
    const entry = (translations as any)[key];
    if (!entry) return key;
    return entry[lang] || entry["en"] || key;
  };

  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-32 pb-24 px-6 flex items-center justify-center text-start">
        <div className="text-center font-bold uppercase tracking-widest text-slate-400 animate-pulse">{t("loading_transmission_details")}</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}