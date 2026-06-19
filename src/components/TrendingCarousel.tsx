"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { CURRENCY } from "@/lib/constants";

export function TrendingCarousel({ products }: { products: any[] }) {
  const [swapIndex, setSwapIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback if no products are passed yet
  if (!products || products.length === 0) return null;

  const handleNext = () => {
    setSwapIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setSwapIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(handleNext, 3000);
    return () => clearInterval(timer);
  }, [isHovered, products.length]);

  return (
    <section className="px-6 mb-16">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Trending 
          <img 
            src="/fire.gif" 
            alt="Trending Fire" 
            className="w-8 h-8 object-contain pb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]"
          />
        </h2>
      </div>

      <div 
        className="relative w-full h-[450px] md:h-[500px] bg-white rounded-3xl border border-slate-200 overflow-hidden group shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_50px_-10px_rgba(249,115,22,0.2)] transition-shadow focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 opacity-80 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply z-0"></div>

        <div 
          className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 relative"
          style={{ transform: `translateX(-${swapIndex * 100}%)` }}
        >
          {products.map((item) => (
            <div key={item.id} className="w-full h-full shrink-0 flex flex-col-reverse md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12">
              <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full">
                <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span className="text-orange-600 font-black uppercase tracking-widest text-xs md:text-sm">
                    {item.category}
                  </span>
                </div>
                
                <h3 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 leading-tight tracking-tighter drop-shadow-sm line-clamp-2">
                  {item.name}
                </h3>
                
                <p className="text-2xl md:text-3xl font-bold text-slate-700 mb-8 font-sans">
                  {CURRENCY}{String(item.price).replace(CURRENCY.trim(), '').replace('$', '').trim()}
                </p>
                
                <div>
                  <Link href={`/shop/${item.id}`} className="inline-block bg-slate-900 text-white hover:bg-orange-500 hover:text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105">
                    Secure Now
                  </Link>
                </div>
              </div>

              <div className="flex-1 flex justify-center items-center relative h-full w-full">
                <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-orange-100/50 rounded-full blur-3xl group-hover:bg-orange-200/80 transition-colors duration-700"></div>
                <img 
                  src={item.images?.[0] || item.image} 
                  alt={item.name} 
                  className="relative z-20 w-64 h-64 md:w-[400px] md:h-[400px] object-contain drop-shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out" 
                />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handlePrev}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-orange-500 text-slate-800 hover:text-white rounded-full backdrop-blur-md border border-slate-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-md"
          aria-label="Previous Item"
        >
          <FaChevronLeft className="text-xl pr-1" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-orange-500 text-slate-800 hover:text-white rounded-full backdrop-blur-md border border-slate-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-md"
          aria-label="Next Item"
        >
          <FaChevronRight className="text-xl pl-1" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setSwapIndex(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                swapIndex === i ? 'bg-orange-500 w-10 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-slate-300 w-2 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
