import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#02000A] pt-16 pb-8 border-t border-white/5 mt-auto relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* UPDATED BRAND COPY */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-black tracking-tighter block mb-4">
              KORA<span className="text-purple-500">STORE</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The UAE's exclusive vault for premium football culture. We bypass the retail markups to bring you the highest-grade boots, current-season shirts, and legendary retro kits. Sourced direct. Served strictly in the Emirates.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">About Us</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-purple-400 transition-colors">Our Story</Link></li>
              <li><Link href="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-purple-400 transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hit Us Up</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3 hover:text-purple-400 transition-colors cursor-pointer group">
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

        <div className="text-center text-xs text-slate-600 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Kora Store. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-purple-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-purple-400 cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}