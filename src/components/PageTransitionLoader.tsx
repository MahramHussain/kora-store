"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // When path or search parameters change, the new page has finished mounting, so we turn off the loader
  useEffect(() => {
    setIsLoading(false);
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

      // Ignore same page hashtags/anchor links
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      // Defer execution using setTimeout to check e.defaultPrevented after all handlers (including React synthetic click handlers) run
      setTimeout(() => {
        if (e.defaultPrevented) {
          return;
        }

        // 1. Instantly scroll to top so the scroll height drops to 0 immediately
        // This hides the old page content and prevents the viewport from showing the footer
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });

        // 2. Trigger the full-screen brand loader overlay
        setIsLoading(true);
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
