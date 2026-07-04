"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { translations } from "@/lib/translations";

export type Language = "en" | "ar";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLang);
  const router = useRouter();
  const pathname = usePathname();

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Set cookie that Next.js Server Components can read
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Instantly update attributes for smooth transition
    if (pathname && !pathname.startsWith("/admin")) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
    
    // Refresh Server Components so they render correct text
    router.refresh();
  };

  useEffect(() => {
    // If pathname starts with /admin, force LTR & English
    if (pathname && pathname.startsWith("/admin")) {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    } else {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [pathname, language]);

  const t = (key: string) => {
    const entry = (translations as any)[key];
    if (!entry) return key;
    return entry[language] || entry["en"] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
