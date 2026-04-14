"use client";

import { useState } from "react";

// The Lore-Accurate FAQ Data
const FAQS = [
  {
    question: "Are these official retail products?",
    answer: "No, and that's the point. We bypass the retail monopoly and their insane markups. Kora Store provides 1:1 premium-grade alternatives sourced directly from our overseas manufacturing partners. You get the exact look, the premium feel, and the on-pitch performance, all for a fair price."
  },
  {
    question: "How long does shipping take?",
    answer: "Since we stock all of our inventory locally here in the UAE, you don't have to wait 4 weeks for overseas dropshipping. Most orders are processed and delivered to your door within 1-3 business days."
  },
  {
    question: "Do you ship internationally?",
    answer: "Not currently. To maintain our lightning-fast delivery times and premium customer service, Kora Store is exclusively serving the United Arab Emirates."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns and exchanges within 7 days of delivery, provided the gear is completely unworn, unwashed, and still has all the original tags attached. Hit up support@korastore.com to start a return."
  },
  {
    question: "How do I know what size to get?",
    answer: "Our standard shirts and retro kits fit true to size. However, if you are ordering a 'Player Issue' kit, we highly recommend sizing up, as they feature a much tighter, athletic cut designed for the pitch."
  },
  {
    question: "How often do you drop new gear?",
    answer: "We update The Vault constantly. The best way to secure exclusive drops before they sell out is to keep an eye on the 'Latest' section of our shop and follow our Instagram."
  }
];

export default function FAQPage() {
  // State to track which question is currently expanded
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Defaults to the first question being open

  const toggleFAQ = (index: number) => {
    // If clicking the one that's already open, close it. Otherwise, open the new one.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-20 pb-20 px-6">
      
      {/* Header Section */}
      <section className="max-w-3xl mx-auto text-center mb-16 mt-12">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
          INTEL & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-500">ANSWERS.</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Everything you need to know about how we operate, our premium gear, and UAE shipping.
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
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen ? "border-purple-500/50 bg-white/5" : "border-white/10 bg-[#0a0514] hover:border-white/30"
                }`}
              >
                {/* The Clickable Question Header */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left p-6 focus:outline-none"
                >
                  <span className={`font-bold text-lg md:text-xl transition-colors ${isOpen ? "text-purple-300" : "text-white"}`}>
                    {faq.question}
                  </span>
                  
                  {/* Plus/Minus Icon */}
                  <span className="ml-4 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-purple-400 font-black text-xl">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* The Expandable Answer */}
                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-slate-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Contact Box */}
      <section className="max-w-3xl mx-auto mt-16 bg-gradient-to-br from-purple-900/20 to-fuchsia-900/10 border border-purple-500/20 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
        <p className="text-slate-400 mb-6">Hit up Adnan directly on WhatsApp for sizing help or special requests.</p>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
          Message the Plug
        </button>
      </section>

    </main>
  );
}