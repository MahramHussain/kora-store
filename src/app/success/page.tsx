"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCopy, FaBoxOpen, FaArrowRight } from "react-icons/fa6";
import { FaCheckCircle, FaWhatsapp } from "react-icons/fa"; 
import { useCart } from "@/context/CartContext";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

function SuccessContent() {
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const { clearCart } = useCart();
  
  // Extract reference number and payment intent from URL parameters
  const rawRef = searchParams.get("ref");
  const referenceNumber = rawRef ? `#${rawRef.toUpperCase()}` : "#KORA-8829";
  const trackingNumber = rawRef ? `KORA-TRK-${rawRef.split('-')[1] || '9827345'}` : "KORA-TRK-9827345";
  const paymentIntentId = searchParams.get("payment_intent_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!rawRef) {
      setLoading(false);
      return;
    }

    const loadOrderAndVerify = async () => {
      try {
        setLoading(true);
        // 1. Verify payment if paymentIntentId is present
        if (paymentIntentId) {
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
            throw new Error(errText || t("verification_failed"));
          }

          const data = await res.json();
          if (data.success) {
            clearCart();
          } else {
            throw new Error(data.error || t("payment_not_completed"));
          }
        }

        // 2. Fetch full order details
        const detailsRes = await fetch(`/api/orders/details?ref=${rawRef}`);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          if (detailsData.success) {
            setOrder(detailsData.order);
          }
        }
      } catch (err: any) {
        console.error("Order load/verification error:", err);
        setError(err.message || t("checkout_verify_error"));
      } finally {
        setLoading(false);
      }
    };

    loadOrderAndVerify();
  }, [paymentIntentId, rawRef, clearCart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp Link Builder
  const whatsAppLink = (() => {
    const phone = "971564245926";
    const ref = rawRef || "8829";
    const isAr = language === "ar";
    let text = "";

    if (isAr) {
      text = `مرحباً كورة ستور! لدي استفسار بخصوص طلبي.\n\n`;
      text += `*رقم الطلب:* #${ref.toUpperCase()}\n`;
      if (order) {
        text += `*الاسم:* ${order.shippingName || "—"}\n`;
        text += `*العنوان:* ${order.shippingStreet || ""}, ${order.shippingCity || ""}\n`;
        text += `*الهاتف:* ${order.shippingPhone || ""}\n`;
        text += `*المجموع الإجمالي:* AED ${parseFloat(order.total).toFixed(2)}\n\n`;
        text += `*المنتجات:*\n`;
        order.items.forEach((item: any, idx: number) => {
          text += `${idx + 1}. ${item.name} (${item.size}) x${item.quantity} - AED ${parseFloat(item.price).toFixed(2)}\n`;
          if (item.playerName) {
            text += `   - طباعة اسم لاعب: ${item.playerName} #${item.customNumber || ""}\n`;
          } else if (item.customName || item.customNumber) {
            text += `   - طباعة مخصصة: ${item.customName || "—"} #${item.customNumber || ""}\n`;
          }
          if (item.patch) {
            text += `   - الشارة: ${item.patch}\n`;
          }
          if (item.sellerNote) {
            text += `   - ملاحظة: ${item.sellerNote}\n`;
          }
        });
        if (order.sellerNote) {
          text += `\n*ملاحظة البائع:* ${order.sellerNote}\n`;
        }
      }
    } else {
      text = `Hello KoraStore! I have a question regarding my order.\n\n`;
      text += `*Order Reference:* #${ref.toUpperCase()}\n`;
      if (order) {
        text += `*Customer Name:* ${order.shippingName || "—"}\n`;
        text += `*Address:* ${order.shippingStreet || ""}, ${order.shippingCity || ""}, UAE\n`;
        text += `*Phone:* ${order.shippingPhone || ""}\n`;
        text += `*Total Amount:* AED ${parseFloat(order.total).toFixed(2)}\n\n`;
        text += `*Items:*\n`;
        order.items.forEach((item: any, idx: number) => {
          text += `${idx + 1}. ${item.name} (${item.size}) x${item.quantity} - AED ${parseFloat(item.price).toFixed(2)}\n`;
          if (item.playerName) {
            text += `   - Preset Player: ${item.playerName} #${item.customNumber || ""}\n`;
          } else if (item.customName || item.customNumber) {
            text += `   - Custom Print: ${item.customName || "—"} #${item.customNumber || ""}\n`;
          }
          if (item.patch) {
            text += `   - Patch: ${item.patch}\n`;
          }
          if (item.sellerNote) {
            text += `   - Note: ${item.sellerNote}\n`;
          }
        });
        if (order.sellerNote) {
          text += `\n*Seller Note:* ${order.sellerNote}\n`;
        }
      }
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  })();

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
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl mb-6 relative overflow-hidden text-start">
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

        {/* WhatsApp Support Card */}
        <div className="w-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 border border-emerald-500/20 rounded-3xl p-8 shadow-lg mb-10 text-start relative overflow-hidden">
          <div className="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  <FaWhatsapp className="text-2xl" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {t("whatsapp_support_title")}
                </h3>
              </div>
              <p className="text-slate-500 text-sm font-semibold max-w-md">
                {t("whatsapp_support_desc")}
              </p>
            </div>
            
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-[1.03] shadow-md shadow-emerald-600/20 active:scale-[0.98] shrink-0"
            >
              <FaWhatsapp className="text-lg" /> {t("whatsapp_support_btn")}
            </a>
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