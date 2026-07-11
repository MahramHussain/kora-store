"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CURRENCY } from "@/lib/constants";
import { useTranslation } from "@/context/LanguageContext";

import { FaStar } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  descriptionAr?: string | null;
  category: string;
  price: string | number;
  team?: string | null;
  originalPrice?: string | null;
  images?: string[];
  image?: string;
  tag?: string | null;
  stock?: number;
  reviews?: { rating: number }[];
}

export function ProductCard({ product }: { product: Product }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  // Detect mobile on mount
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      setActiveIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  // Mobile tap to cycle images
  const handleImageTap = (e: React.MouseEvent) => {
    if (!isMobile || images.length <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const imageUrl = images[activeIdx] || "";

  // Show dots: on mobile always (if multiple images), on desktop only on hover
  const showDots = images.length > 1 && (isMobile || isHovered);

  const { language, t } = useTranslation();

  return (
    <Link 
      href={`/shop/${product.id}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-kora transition-all duration-300 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(107,0,255,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-[300px] sm:h-[380px] active:scale-[0.98] md:active:scale-100"
    >
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.stock === 0 ? (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 md:px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest z-20 shadow-sm bg-rose-100 text-rose-800 border border-rose-200">
            {t("sold_out")}
          </div>
        ) : product.tag ? (
          product.tag === 'On Sale' ? (
            <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 md:px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest z-20 shadow-md bg-gradient-to-r from-orange-500 to-rose-600 text-white border border-orange-400/30 flex items-center gap-1 animate-pulse">
              <img 
                src="/fire.gif" 
                alt="Fire" 
                className="w-3.5 h-3.5 object-contain"
              />
              <span>{t("on sale")}</span>
            </div>
          ) : (
            <div className={`absolute top-3 left-3 md:top-4 md:left-4 px-2.5 md:px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest z-20 shadow-sm ${
              product.tag === 'Latest' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {t(product.tag.toLowerCase()) || product.tag}
            </div>
          )
        ) : null}

        
        {/* Dynamic Images — absolute overlay transitioning opacity for smooth, flicker-free hover animation */}
        {images.length > 0 ? (
          images.slice(0, 4).map((imgUrl, idx) => (
            <img 
              key={idx}
              src={imgUrl} 
              alt={`${product.name} View ${idx + 1}`} 
              referrerPolicy="no-referrer"
              onClick={handleImageTap}
              className={`absolute inset-0 w-full h-full object-cover drop-shadow-md group-hover:scale-105 transition-all duration-700 ${
                idx === activeIdx 
                  ? (product.stock === 0 ? 'opacity-40 grayscale' : 'opacity-100') 
                  : 'opacity-0 pointer-events-none'
              }`} 
            />
          ))
        ) : (
          <div className="text-slate-300 text-xs">{t("no_image")}</div>
        )}

        {/* Dot indicators — always visible on mobile, hover-only on desktop */}
        {showDots && (
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm z-30 transition-opacity duration-300">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIdx ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 border-t border-slate-100 relative z-20 bg-white">
        <div className="flex justify-between items-start mb-2 md:mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-kora text-[10px] font-bold uppercase tracking-widest mb-1">
              {product.category === "Boots" 
                ? t("category_shoes") 
                : product.category === "Flags" 
                ? t("category_accessories") 
                : (t(`category_${product.category.toLowerCase().replace(" ", "_")}`) || product.category)}
            </p>
            <h3 className="text-sm md:text-base font-bold text-slate-900 leading-tight line-clamp-1 font-sans">
              {t(product.id) !== product.id 
                ? t(product.id) 
                : (language === "ar" && product.nameAr ? product.nameAr : product.name)}
            </h3>
            {product.reviews && product.reviews.length > 0 && (() => {
              const avg = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
              return (
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <FaStar key={s} className={`text-[9px] ${s <= Math.round(avg) ? 'text-yellow-400' : 'text-slate-200'}`} />
                  ))}
                  <span className="text-[9px] text-slate-400 font-bold ml-0.5">{avg.toFixed(1)}</span>
                </div>
              );
            })()}
          </div>
          <div className="flex items-center gap-1.5 ml-2 shrink-0 whitespace-nowrap font-sans">
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {t("aed")}{parseFloat(product.originalPrice).toFixed(0)}
              </span>
            )}
            <span className="text-base md:text-lg font-bold text-slate-900">
              {t("aed")}{String(product.price).replace(CURRENCY.trim(), '').replace('$', '').trim()}
            </span>
          </div>
        </div>
        <div className={`w-full text-center font-bold text-xs md:text-sm py-2 md:py-2.5 rounded-lg transition-colors border ${
          product.stock === 0 
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
            : "bg-slate-100 group-hover:bg-kora text-slate-700 group-hover:text-white border-slate-200 group-hover:border-kora"
        }`}>
          {product.stock === 0 ? t("sold_out") : t("view_gear")}
        </div>
      </div>
    </Link>
  );
}

export function ProductSkeletonCard() {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px] sm:h-[380px] animate-pulse">
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-8">
        <div className="w-32 h-32 bg-slate-200 rounded-full blur-xl"></div>
      </div>
      <div className="p-4 sm:p-5 border-t border-slate-100 relative z-20 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="h-6 bg-slate-200 rounded w-12 ml-4"></div>
        </div>
        <div className="w-full h-10 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
  );
}
