"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import { useTranslation } from "@/context/LanguageContext";

interface BannerSlide {
  id: number;
  image: string;
  alt: string;
  tagKey: string;
  titleKey: string;
  subtitleKey: string;
  ctaKey: string;
  ctaHref: string;
  badgeColor: string;
  buttonStyle: string;
}

const BANNERS: BannerSlide[] = [
  {
    id: 0,
    image: "/banners/bannerks.jpg",
    alt: "Season 26/27 Club Kits",
    tagKey: "banner_kits_tag",
    titleKey: "banner_kits_title",
    subtitleKey: "banner_kits_subtitle",
    ctaKey: "banner_kits_cta",
    ctaHref: "/shop?category=Shirts",
    badgeColor: "text-purple-300 bg-purple-500/20 border-purple-400/30",
    buttonStyle: "bg-white text-slate-950 hover:bg-purple-600 hover:text-white shadow-md hover:shadow-purple-500/20",
  },
  {
    id: 1,
    image: "/banners/bannerks2.jpg",
    alt: "World Cup & National Jerseys",
    tagKey: "banner_sale_tag",
    titleKey: "banner_sale_title",
    subtitleKey: "banner_sale_subtitle",
    ctaKey: "banner_sale_cta",
    ctaHref: "/shop?tag=On+Sale",
    badgeColor: "text-red-300 bg-red-500/20 border-red-400/30",
    buttonStyle: "bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-md hover:shadow-red-500/20",
  },
  {
    id: 2,
    image: "/banners/bannerks3.jpg",
    alt: "Football Boots Collection",
    tagKey: "banner_boots_tag",
    titleKey: "banner_boots_title",
    subtitleKey: "banner_boots_subtitle",
    ctaKey: "banner_boots_cta",
    // Redirects directly to boots in shop page as requested
    ctaHref: "/shop?category=Boots",
    badgeColor: "text-cyan-300 bg-cyan-500/20 border-cyan-400/30",
    buttonStyle: "bg-white text-slate-950 hover:bg-cyan-500 hover:text-slate-950 shadow-md hover:shadow-cyan-500/20",
  },
];

// Cloned slides for infinite seamless sliding
const EXTENDED_SLIDES = [
  BANNERS[BANNERS.length - 1], // Clone of last slide at index 0
  ...BANNERS,
  BANNERS[0], // Clone of first slide at index BANNERS.length + 1
];

const AUTO_CHANGE_INTERVAL_MS = 4500; // Increased interval to 4.5s for a relaxed, premium pace
const SLIDE_TRANSITION_MS = 500;

export default function HeroBanner() {
  const { language, t } = useTranslation();
  const isRtl = language === "ar";

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Derive real active banner index (0, 1, 2)
  const realActiveIndex =
    currentIndex === 0
      ? BANNERS.length - 1
      : currentIndex === EXTENDED_SLIDES.length - 1
      ? 0
      : currentIndex - 1;

  // Touch gesture state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const goToSlide = (realIdx: number) => {
    setIsTransitioning(true);
    setCurrentIndex(realIdx + 1);
  };

  // Infinite loop boundary reset
  const handleTransitionEnd = () => {
    if (currentIndex === EXTENDED_SLIDES.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(BANNERS.length);
    }
  };

  // Re-enable CSS transitions on next frame after teleporting
  useEffect(() => {
    if (!isTransitioning) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning]);

  // Auto-switch timer (2 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_CHANGE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      isRtl ? prevSlide() : nextSlide();
    } else if (e.key === "ArrowLeft") {
      isRtl ? nextSlide() : prevSlide();
    }
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        isRtl ? prevSlide() : nextSlide();
      } else {
        isRtl ? nextSlide() : prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      aria-label="Featured Matchday Banners"
      className="w-full max-w-6xl mx-auto px-3 sm:px-6 my-2 sm:my-4 md:my-6 select-none outline-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 
        Managed Luxury Frame: 
        Contained within max-w-6xl with rounded corners and subtle border.
        Strict 16:9 aspect ratio prevents oversized desktop explosion while keeping 100% of images uncropped!
      */}
      <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.55)] bg-slate-950">
        {/* Horizontal Sliding Track */}
        <div
          dir="ltr"
          className="flex w-full h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning
              ? `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`
              : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {EXTENDED_SLIDES.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className="relative w-full h-full shrink-0 aspect-[16/9]"
            >
              {/* Entire slide is clickable */}
              <Link
                href={banner.ctaHref}
                className="block w-full h-full relative cursor-pointer"
                tabIndex={-1}
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  loading={index <= 2 ? "eager" : "lazy"}
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                />

                {/* Subtle soft gradient at bottom for text contrast */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
              </Link>

              {/* Refined, Realistic Football Content Card */}
              <div className="absolute bottom-2.5 sm:bottom-4 md:bottom-6 start-3 sm:start-5 md:start-8 z-20 pointer-events-auto max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md">
                <div className="backdrop-blur-xl bg-black/65 dark:bg-black/75 border border-white/15 p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl shadow-xl flex flex-col items-start gap-1 sm:gap-1.5">
                  {/* Category Micro-Badge */}
                  <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${banner.badgeColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {t(banner.tagKey)}
                  </span>

                  {/* Clean Authentic Football Title */}
                  <h2 className="text-white font-bold text-xs sm:text-base md:text-lg tracking-tight font-sans leading-tight">
                    {t(banner.titleKey)}
                  </h2>

                  {/* Concise Football Description */}
                  <p className="text-slate-300 text-[10px] sm:text-xs leading-snug line-clamp-1">
                    {t(banner.subtitleKey)}
                  </p>

                  {/* Sleek Action CTA Button */}
                  <div className="pt-0.5 sm:pt-1">
                    <Link
                      href={banner.ctaHref}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${banner.buttonStyle}`}
                    >
                      <span>{t(banner.ctaKey)}</span>
                      {isRtl ? (
                        <FaArrowLeft className="text-[9px] sm:text-[10px] transition-transform duration-300" />
                      ) : (
                        <FaArrowRight className="text-[9px] sm:text-[10px] transition-transform duration-300" />
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Navigation Arrow (Discreet frosted glass pill) */}
        <button
          onClick={isRtl ? nextSlide : prevSlide}
          aria-label="Previous Banner"
          className="absolute top-1/2 -translate-y-1/2 start-2 sm:start-4 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 shadow-md focus:outline-none"
        >
          {isRtl ? (
            <FaChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <FaChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>

        {/* Next Navigation Arrow (Discreet frosted glass pill) */}
        <button
          onClick={isRtl ? prevSlide : nextSlide}
          aria-label="Next Banner"
          className="absolute top-1/2 -translate-y-1/2 end-2 sm:end-4 z-30 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 shadow-md focus:outline-none"
        >
          {isRtl ? (
            <FaChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <FaChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-2.5 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
          {BANNERS.map((banner, index) => {
            const isCurrent = index === realActiveIndex;
            return (
              <button
                key={banner.id}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 focus:outline-none"
                style={{
                  width: isCurrent ? "24px" : "7px",
                  backgroundColor: isCurrent
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.35)",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
