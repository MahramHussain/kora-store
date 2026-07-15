"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

interface SpotlightButtonProps {
  query?: string;
  theme?: "gold" | "red";
}

export default function SpotlightButton({ query = "Argentina", theme = "gold" }: SpotlightButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Trigger global page transition loader with scroll to top enabled
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger-loader", { detail: { duration: 800, scrollToTop: true } }));
    }

    // Navigate to the shop page
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  const themeClasses = theme === "red" 
    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.45)]"
    : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]";

  const spinnerColor = theme === "red" ? "text-white" : "text-slate-950";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center font-black text-xs md:text-sm tracking-wider uppercase py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-85 disabled:cursor-not-allowed ${themeClasses}`}
    >
      {isLoading && (
        <svg className={`animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 ${spinnerColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {t("shop_now")}
    </button>
  );
}
