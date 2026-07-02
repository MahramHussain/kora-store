"use client";
import Link from "next/link";
import { useState } from "react";
import { FaInstagram, FaWhatsapp, FaEnvelope, FaChevronDown } from "react-icons/fa";

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-kora text-white pt-12 md:pt-16 pb-8 border-t border-purple-900/40 mt-auto relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* ═══ DESKTOP FOOTER (Hidden on mobile) ═══ */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Copy */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="block mb-4 hover:scale-105 transition-transform w-fit">
              <img src="/assets/logo.png" alt="Korastore" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-sm text-purple-100/90 max-w-sm leading-relaxed">
              The UAE's exclusive vault for premium football culture. We bypass the retail markups to bring you the highest-grade shoes, current-season shirts, and legendary retro kits. Sourced direct. Served strictly in the Emirates.
            </p>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">About Us</h4>
            <ul className="space-y-2 text-sm text-purple-100/90 font-semibold uppercase tracking-wider">
              <li><Link href="/about" className="hover:text-white transition-colors inline-block py-1">Our Story</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors inline-block py-1">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors inline-block py-1">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Hit Us Up */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hit Us Up</h4>
            <ul className="space-y-3 text-sm text-purple-100/90 font-medium tracking-wider">
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                <FaEnvelope className="text-xl group-hover:scale-110 transition-transform text-purple-300 group-hover:text-white" /> 
                <span>support@korastore.com</span>
              </li>
              <li className="flex items-center gap-3 hover:text-emerald-300 transition-colors cursor-pointer group">
                <FaWhatsapp className="text-xl group-hover:scale-110 transition-transform text-purple-300 group-hover:text-emerald-300" /> 
                <span>WhatsApp: +971 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3 hover:text-pink-300 transition-colors cursor-pointer group">
                <a href="https://www.instagram.com/korastore.ae/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <FaInstagram className="text-xl group-hover:scale-110 transition-transform text-purple-300 group-hover:text-pink-300" /> 
                  <span>Instagram: @korastore.ae</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ═══ MOBILE FOOTER (Hidden on desktop) ═══ */}
        <div className="md:hidden flex flex-col space-y-8 mb-8">
          {/* 1. Brand Section */}
          <div className="text-center space-y-4">
            <Link href="/" className="block hover:scale-105 transition-transform w-fit mx-auto">
              <img src="/assets/logo.png" alt="Korastore" className="h-7 w-auto object-contain mx-auto" />
            </Link>
            <p className="text-xs text-purple-200/80 max-w-sm mx-auto leading-relaxed">
              The UAE's exclusive vault for premium football culture. Bypassing retail markups to bring you elite boots, shirts, and retro classics.
            </p>
            {/* Social Icons Row */}
            <div className="flex justify-center gap-4 pt-2">
              <a href="mailto:support@korastore.com" className="mobile-footer-social-btn text-purple-200 border-purple-800 hover:text-white" aria-label="Email Support">
                <FaEnvelope className="text-lg" />
              </a>
              <a href="https://wa.me/971501234567" target="_blank" rel="noopener noreferrer" className="mobile-footer-social-btn text-purple-200 border-purple-800 hover:text-emerald-300" aria-label="WhatsApp">
                <FaWhatsapp className="text-lg" />
              </a>
              <a href="https://www.instagram.com/korastore.ae/" target="_blank" rel="noopener noreferrer" className="mobile-footer-social-btn text-purple-200 border-purple-800 hover:text-pink-300" aria-label="Instagram">
                <FaInstagram className="text-lg" />
              </a>
            </div>
          </div>

          {/* 2. Accordions */}
          <div className="border-y border-purple-900/40 divide-y divide-purple-900/40">
            {/* About Us Accordion */}
            <div>
              <button 
                onClick={() => toggleSection("about")}
                className="w-full py-4 flex justify-between items-center text-left font-bold uppercase text-xs tracking-wider text-white"
              >
                <span>About Us</span>
                <FaChevronDown className={`text-purple-300 text-xs transition-transform duration-300 ${openSection === "about" ? "rotate-180" : ""}`} />
              </button>
              <div className={`mobile-accordion-content ${openSection === "about" ? "open" : ""}`}>
                <ul className="pb-4 space-y-3 pl-1 text-xs font-bold uppercase tracking-wider text-purple-200/90">
                  <li><Link href="/about" className="hover:text-white active:text-white block py-1">Our Story</Link></li>
                  <li><Link href="/faq" className="hover:text-white active:text-white block py-1">FAQ</Link></li>
                  <li><Link href="/shipping" className="hover:text-white active:text-white block py-1">Shipping & Returns</Link></li>
                </ul>
              </div>
            </div>

            {/* Hit Us Up Accordion */}
            <div>
              <button 
                onClick={() => toggleSection("contact")}
                className="w-full py-4 flex justify-between items-center text-left font-bold uppercase text-xs tracking-wider text-white"
              >
                <span>Hit Us Up</span>
                <FaChevronDown className={`text-purple-300 text-xs transition-transform duration-300 ${openSection === "contact" ? "rotate-180" : ""}`} />
              </button>
              <div className={`mobile-accordion-content ${openSection === "contact" ? "open" : ""}`}>
                <ul className="pb-4 space-y-3 pl-1 text-xs font-medium tracking-wider text-purple-200/90">
                  <li className="flex items-center gap-3 py-1">
                    <FaEnvelope className="text-sm text-purple-300" />
                    <span>support@korastore.com</span>
                  </li>
                  <li className="flex items-center gap-3 py-1">
                    <FaWhatsapp className="text-sm text-purple-300" />
                    <span>+971 50 123 4567</span>
                  </li>
                  <li className="flex items-center gap-3 py-1 hover:text-pink-300 transition-colors cursor-pointer">
                    <a href="https://www.instagram.com/korastore.ae/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                      <FaInstagram className="text-sm text-purple-300" />
                      <span>@korastore.ae</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Join the Vault CTA (WhatsApp link) */}
          <div className="bg-purple-950/30 border border-purple-800/30 rounded-2xl p-5 text-center space-y-3">
            <h5 className="font-black uppercase tracking-wider text-[11px] text-purple-300">Join the Vault</h5>
            <p className="text-[11px] text-purple-200/80 max-w-xs mx-auto font-medium">
              Want access to early drops, exclusive promo codes, and personal sourcing requests? Join our VIP list on WhatsApp.
            </p>
            <a 
              href="https://wa.me/971501234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#5E0683] text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md hover:bg-purple-50 transition-colors"
            >
              <FaWhatsapp className="text-sm" /> Connect Now
            </a>
          </div>
        </div>

        {/* ═══ LEGAL BAR (Responsive) ═══ */}
        <div className="text-center text-xs text-purple-200/80 pt-8 border-t border-purple-900/40 flex flex-col md:flex-row justify-between items-center gap-4 font-medium">
          <p>&copy; {new Date().getFullYear()} Kora Store. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors active:text-white">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors active:text-white">Privacy</span>
          </div>
        </div>

      </div>
    </footer>
  );
}