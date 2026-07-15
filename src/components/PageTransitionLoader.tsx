"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Listen to custom trigger-loader events (for language change, button clicks, etc.)
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const duration = customEvent.detail?.duration || 600;
      const scrollToTop = customEvent.detail?.scrollToTop ?? false;

      if (scrollToTop) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      setIsLoading(true);
      if (duration > 0) {
        (window as any)._loaderMinEndTime = Date.now() + duration;
      }
      setTimeout(() => {
        setIsLoading(false);
      }, duration);
    };
    window.addEventListener("trigger-loader", handleTrigger);
    return () => window.removeEventListener("trigger-loader", handleTrigger);
  }, []);

  // When path or search parameters change, turn off the loader (respecting minimum duration if set)
  useEffect(() => {
    const minEndTime = (window as any)._loaderMinEndTime || 0;
    const remainingTime = minEndTime - Date.now();

    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        (window as any)._loaderMinEndTime = null;
      }, remainingTime);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      (window as any)._loaderMinEndTime = null;
    }
  }, [pathname, searchParams]);

  // Safety timeout to prevent infinite loading screens
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 seconds safety limit
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Turn off loader on Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setIsLoading(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, blank targets, and modifiers
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if the destination is home
      const url = new URL(href, window.location.href);
      const isGoingHome = url.pathname === "/";

      // If not going home, ignore same page links
      if (!isGoingHome && url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      // Defer execution using setTimeout to check e.defaultPrevented after all handlers (including React synthetic click handlers) run
      setTimeout(() => {
        if (e.defaultPrevented) {
          return;
        }

        // 1. Instantly scroll to top so the scroll height drops to 0 immediately
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });

        // 2. Trigger the full-screen brand loader overlay with a minimum display time for premium feel
        const duration = isGoingHome ? 600 : 0;
        setIsLoading(true);
        if (duration > 0) {
          (window as any)._loaderMinEndTime = Date.now() + duration;
        }

        // If we are already on home and click home, pathname/searchParams won't change,
        // so we manually dismiss the loader after the duration.
        if (isGoingHome && url.pathname === window.location.pathname && url.search === window.location.search) {
          setTimeout(() => {
            setIsLoading(false);
          }, duration);
        }
      }, 0);
    };

    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-[99999] flex flex-col items-center justify-center font-sans select-none pointer-events-auto">
      <div className="relative w-16 h-16">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-kora/10 animate-ping"></div>
        {/* Inner spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-kora animate-spin"></div>
      </div>
      <h3 className="text-slate-900 font-extrabold uppercase tracking-widest text-[10px] mt-6 animate-pulse">
        {t("loading")}
      </h3>
    </div>
  );
}
