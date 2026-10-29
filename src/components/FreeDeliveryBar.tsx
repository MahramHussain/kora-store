"use client";

import { useTranslation } from "@/context/LanguageContext";
import { FaTruckFast, FaCheck, FaGift } from "react-icons/fa6";

interface FreeDeliveryBarProps {
  subtotal: number;
  threshold?: number;
  className?: string;
}

export default function FreeDeliveryBar({
  subtotal,
  threshold = 200,
  className = "",
}: FreeDeliveryBarProps) {
  const { t, language } = useTranslation();

  const isUnlocked = subtotal >= threshold;
  const progress = Math.min(100, Math.max(0, (subtotal / threshold) * 100));
  const remaining = Math.max(0, threshold - subtotal);
  const isArabic = language === "ar";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-500 shadow-xs ${
        isUnlocked
          ? "bg-gradient-to-r from-emerald-50/95 via-teal-50/50 to-emerald-50/90 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-emerald-950/40 border-emerald-300/80 dark:border-emerald-700/60 shadow-emerald-500/5"
          : "bg-gradient-to-r from-purple-50/80 via-white to-slate-50 dark:from-purple-950/30 dark:via-slate-900/60 dark:to-slate-950 border-purple-200/90 dark:border-purple-900/40 shadow-purple-500/5"
      } p-4 sm:p-5 ${className}`}
    >
      {/* Background ambient decorative glow */}
      <div
        className={`pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 ${
          isUnlocked ? "bg-emerald-400" : "bg-purple-400"
        }`}
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Animated Icon Pill */}
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-base sm:text-lg shrink-0 transition-transform duration-300 ${
              isUnlocked
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 scale-105"
                : "bg-gradient-to-br from-kora to-purple-600 text-white shadow-md shadow-kora/25"
            }`}
          >
            {isUnlocked ? (
              <FaCheck className="animate-in zoom-in-75 duration-300" />
            ) : (
              <FaTruckFast className={`${isArabic ? "-scale-x-100" : ""}`} />
            )}
          </div>

          {/* Text Title & Subtitle */}
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug">
              {isUnlocked ? (
                <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 flex-wrap">
                  <span>🎉</span>
                  <span>{t("free_delivery_unlocked_title")}</span>
                </span>
              ) : (
                <span>
                  {t("free_delivery_progress_title_prefix")}{" "}
                  <span className="text-kora dark:text-purple-400 font-extrabold text-sm sm:text-base">
                    {t("aed")} {remaining.toFixed(2)}
                  </span>{" "}
                  {t("free_delivery_progress_title_suffix")}
                </span>
              )}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isUnlocked ? t("free_delivery_unlocked_desc") : t("free_delivery_progress_desc")}
            </p>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="shrink-0 self-start sm:self-center">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
              isUnlocked
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700/60"
                : "bg-purple-100/90 dark:bg-purple-950/80 text-kora dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
            }`}
          >
            {isUnlocked ? (
              <>
                <FaCheck className="text-[10px]" />
                <span>{t("free_delivery_unlocked_pill")}</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-kora animate-ping" />
                <span>
                  {remaining > 0
                    ? `${t("aed")} ${remaining.toFixed(0)} ${t("free_delivery_away_pill")}`
                    : t("free_delivery_unlocked_pill")}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative mt-3.5 sm:mt-4">
        <div className="relative h-2.5 sm:h-3 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-[2px]">
          {/* Active Fill Bar */}
          <div
            style={{ width: `${progress}%` }}
            className={`h-full rounded-full transition-all duration-700 ease-out relative ${
              isUnlocked
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-gradient-to-r from-kora via-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(94,6,131,0.35)]"
            }`}
          >
            {/* Inner shimmer animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Milestone Footer */}
        <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 px-0.5">
          <span>{t("aed")} 0</span>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {Math.round(progress)}%
          </span>
          <span
            className={`flex items-center gap-1 font-bold ${
              isUnlocked
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {isUnlocked ? (
              <FaCheck className="text-[10px]" />
            ) : (
              <FaGift className="text-[10px] text-kora" />
            )}
            <span>{t("aed")} 200.00 • {t("free_label")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

