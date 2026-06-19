"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

export function ScrollSlider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeft(scrollLeft > 5);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      // Periodically check in case items render asynchronously
      const interval = setInterval(checkScroll, 500);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        clearInterval(interval);
      };
    }
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/slider w-full">
      {/* Left Navigation Arrow */}
      {showLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 hover:scale-110 transition-all hidden md:flex items-center justify-center -ml-5"
          aria-label="Scroll left"
        >
          <FaChevronLeft className="text-sm font-bold" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {showRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 hover:scale-110 transition-all hidden md:flex items-center justify-center -mr-5"
          aria-label="Scroll right"
        >
          <FaChevronRight className="text-sm font-bold" />
        </button>
      )}

      {/* Touch-Scrollable Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full scroll-smooth py-2 px-1"
      >
        {children}
      </div>
    </div>
  );
}
