"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";

export default function SaleToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const { t, language } = useTranslation();

  useEffect(() => {
    // Check if toast was already shown in this session to prevent spamming
    const hasShown = sessionStorage.getItem("kora_sale_toast_shown");
    if (hasShown) return;

    // Delay showing the toast slightly for a premium feel (e.g. 1.5 seconds)
    const showTimer = setTimeout(() => {
      setIsRendered(true);
      // Wait for next tick to start animation
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
      sessionStorage.setItem("kora_sale_toast_shown", "true");
    }, 1500);

    // Auto-hide after 8 seconds of display
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, 9500); // 1.5s delay + 8s display

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remove from DOM after transition completes (500ms)
    setTimeout(() => {
      setIsRendered(false);
    }, 500);
  };

  if (!isRendered) return null;

  // Multi-lingual support
  const textEn = "Germany & Uruguay kits are now on sale for just AED 49!";
  const textAr = "قمصان ألمانيا وأوروغواي متوفرة الآن للبيع مقابل 49 درهم فقط!";
  const linkTextEn = "Shop Sale";
  const linkTextAr = "تسوق العرض";

  const isRtl = language === "ar";

  return (
    <div
      className={`fixed top-4 right-4 md:top-6 md:right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-sm w-[90vw] md:w-[380px] ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      }`}
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      <div className="relative overflow-hidden bg-slate-950/95 hover:bg-slate-950 backdrop-blur-xl border border-orange-500/30 hover:border-orange-500/50 rounded-2xl p-4 flex gap-4 items-center shadow-[0_15px_40px_-10px_rgba(249,115,22,0.4)] group transition-all duration-300">
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-rose-500/5 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
        
        {/* Lingering Progress Bar Indicator at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 transition-transform ease-linear pointer-events-none"
          style={{ 
            transform: isVisible ? "scaleX(0)" : "scaleX(1)",
            transformOrigin: isRtl ? "right" : "left",
            transitionDuration: isVisible ? "8000ms" : "0ms"
          }}
        />

        {/* Fire Icon Wrapper with lingering pulse glow */}
        <div className="relative shrink-0 flex items-center justify-center w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-xl bg-orange-500/20 animate-ping opacity-30 pointer-events-none" />
          
          <img 
            src="/fire.gif" 
            alt="Sale Fire" 
            className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 z-10">
          <h4 className="text-orange-400 font-extrabold uppercase tracking-wider text-[10px] sm:text-xs mb-1 font-sans flex items-center gap-1.5">
            <span>{isRtl ? "عرض خاص محدود" : "Limited Sale Event"}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          </h4>
          <p className="text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed font-sans line-clamp-2 mb-1.5">
            {isRtl ? textAr : textEn}
          </p>
          <Link
            href="/shop?q=kit"
            onClick={handleDismiss}
            className="inline-flex items-center gap-1 text-[11px] font-black text-orange-400 hover:text-orange-300 uppercase tracking-widest transition-colors font-sans"
          >
            <span>{isRtl ? linkTextAr : linkTextEn}</span>
            <span className={`text-[10px] transform transition-transform group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`}>→</span>
          </Link>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all focus:outline-none z-10 self-start -mt-1 -me-1"
          aria-label="Close promotion"
        >
          <FiX className="text-base" />
        </button>
      </div>
    </div>
  );
}
