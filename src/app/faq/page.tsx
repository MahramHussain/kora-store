"use client";

import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { FaChevronDown } from "react-icons/fa";

export default function FAQPage() {
  const { t } = useTranslation();
  // State to track which question is currently expanded
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Defaults to the first question being open

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FAQS = [
    { question: t("faq_q1"), answer: t("faq_a1") },
    { question: t("faq_q2"), answer: t("faq_a2") },
    { question: t("faq_q3"), answer: t("faq_a3") },
    { question: t("faq_q4"), answer: t("faq_a4") },
    { question: t("faq_q5"), answer: t("faq_a5") },
    { question: t("faq_q6"), answer: t("faq_a6") },
    { question: t("faq_q7"), answer: t("faq_a7") },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-kora selection:text-white pt-16 pb-16 px-4 sm:px-6 md:pt-20 md:pb-20 text-start transition-colors duration-300">
      
      {/* Header Section */}
      <section className="max-w-3xl mx-auto text-center mb-16 mt-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight uppercase">
          {t("faq_lore")} & <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">{t("faq_title_span")}</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-sans">
          {t("faq_desc")}
        </p>
      </section>

      {/* Interactive Accordion Section */}
      <section className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                  isOpen 
                    ? "border-kora/50 dark:border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20" 
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* The Clickable Question Header */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-start p-4 sm:p-6 focus:outline-none gap-4"
                >
                  <span className={`font-bold text-sm sm:text-lg md:text-xl uppercase tracking-wider transition-colors ${isOpen ? "text-kora dark:text-purple-400" : "text-slate-900 dark:text-slate-100"}`}>
                    {faq.question}
                  </span>
                  
                  {/* Plus/Minus Icon */}
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-950 text-kora dark:text-purple-400 font-bold text-xl border border-slate-200 dark:border-slate-850 shadow-sm">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* The Expandable Answer */}
                <div 
                  className={`transition-all duration-500 ease-in-out font-sans ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 sm:p-6 pt-0 text-slate-650 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Contact Box */}
      <section className="max-w-3xl mx-auto mt-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/15 dark:to-pink-950/15 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">{t("still_have_questions")}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 font-sans">{t("support_whatsapp_desc")}</p>
        <a 
          href="https://wa.me/971564245926" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs tracking-widest uppercase py-3.5 px-8 rounded-full transition-colors shadow-md hover:shadow-emerald-500/30"
        >
          {t("message_plug")}
        </a>
      </section>

    </main>
  );
}