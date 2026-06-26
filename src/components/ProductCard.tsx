"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CURRENCY } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  images?: string[];
  image?: string; // Support for the legacy hardcoded Trending format
  tag?: string | null;
  stock?: number;
}

export function ProductCard({ product }: { product: Product }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

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

  const imageUrl = images[activeIdx] || "";

  return (
    <Link 
      href={`/shop/${product.id}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-kora transition-all duration-300 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(107,0,255,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col sm:h-[380px] h-[330px]"
    >
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.stock === 0 ? (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest z-20 shadow-sm bg-rose-100 text-rose-800 border border-rose-200">
            Sold Out
          </div>
        ) : product.tag ? (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest z-20 shadow-sm ${
            product.tag === 'Latest' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            {product.tag}
          </div>
        ) : null}
        
        {/* Dynamic Image with smooth micro-animation on swap */}
        <img 
          key={activeIdx}
          src={imageUrl} 
          alt={product.name} 
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover drop-shadow-md group-hover:scale-105 transition-all duration-500 animate-fade-in ${product.stock === 0 ? 'opacity-40 grayscale' : 'opacity-100'}`} 
        />

        {/* Premium Dot Indicators showing hover slideshow progress */}
        {isHovered && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm z-30 transition-opacity duration-300">
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

      <div className="p-4 sm:p-5 border-t border-slate-100 relative z-20 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-kora text-[10px] font-bold uppercase tracking-widest mb-2">{product.category}</p>
            <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 font-sans">{product.name}</h3>
          </div>
          <span className="text-lg font-bold text-slate-900 ml-2 shrink-0 whitespace-nowrap font-sans">
            {CURRENCY}{String(product.price).replace(CURRENCY.trim(), '').replace('$', '').trim()}
          </span>
        </div>
        <div className={`w-full text-center font-bold text-sm py-2.5 rounded-lg transition-colors border ${
          product.stock === 0 
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
            : "bg-slate-100 group-hover:bg-kora text-slate-700 group-hover:text-white border-slate-200 group-hover:border-kora"
        }`}>
          {product.stock === 0 ? "Sold Out" : "View Gear"}
        </div>
      </div>
    </Link>
  );
}

export function ProductSkeletonCard() {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:h-[380px] h-[330px] animate-pulse">
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
