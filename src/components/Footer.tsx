import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-200 mt-auto relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* UPDATED BRAND COPY */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-3xl font-pixel tracking-tight block mb-4 hover:scale-105 transition-transform w-fit">
              <span className="text-slate-900">KORA</span><span className="text-kora drop-shadow-[0_0_10px_rgba(107,0,255,0.4)]">STORE</span>
            </Link>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              The UAE's exclusive vault for premium football culture. We bypass the retail markups to bring you the highest-grade boots, current-season shirts, and legendary retro kits. Sourced direct. Served strictly in the Emirates.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-pixel mb-4 uppercase tracking-wider text-lg">About Us</h4>
            <ul className="space-y-2 text-sm text-slate-600 font-pixel uppercase tracking-wider">
              <li><Link href="/about" className="hover:text-kora transition-colors">Our Story</Link></li>
              <li><Link href="/faq" className="hover:text-kora transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-kora transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-pixel mb-4 uppercase tracking-wider text-lg">Hit Us Up</h4>
            <ul className="space-y-3 text-sm text-slate-600 font-pixel tracking-wider">
              <li className="flex items-center gap-3 hover:text-kora transition-colors cursor-pointer group">
                <FaEnvelope className="text-xl group-hover:scale-110 transition-transform" /> 
                <span>support@korastore.com</span>
              </li>
              <li className="flex items-center gap-3 hover:text-emerald-400 transition-colors cursor-pointer group">
                <FaWhatsapp className="text-xl group-hover:scale-110 transition-transform" /> 
                <span>WhatsApp: +971 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3 hover:text-pink-400 transition-colors cursor-pointer group">
                <FaInstagram className="text-xl group-hover:scale-110 transition-transform" /> 
                <span>Instagram: @KoraStore</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 font-pixel">
          <p>&copy; {new Date().getFullYear()} Kora Store. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-kora cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-kora cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}