import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaHandshake } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-16 pb-16 px-4 sm:px-6 md:pt-20 md:pb-20">
      
      {/* Cinematic Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-12 sm:mb-24 mt-8 sm:mt-12">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-kora/30 bg-purple-50 text-kora text-xs font-semibold tracking-widest uppercase">
          The Founder's Story
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 tracking-tighter leading-tight uppercase">
          THE GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">ARCHIVE.</span><br />
          UNLOCKED IN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">UAE.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 font-sans leading-relaxed max-w-2xl mx-auto">
          Founded by Adnan, Kora Store started with a simple mission: the retail market is broken, and fans are getting priced out of the game. We bridge the gap by sourcing the highest-grade alternative kits and shoes directly from our manufacturing partners, bringing 1:1 premium football culture straight to the Emirates.
        </p>
      </section>

      {/* The Manifesto / Values Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-24">
        
        {/* Value 1: Quality */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 hover:border-kora transition-colors group shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(107,0,255,0.3)]">
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-kora text-2xl group-hover:scale-110 group-hover:bg-kora group-hover:text-white transition-all shadow-sm">
            <FaStar />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">Premium Grade</h3>
          <p className="text-slate-600 leading-relaxed text-sm font-sans">
            Let's be real—insane retail markups lock real fans out. We cut the corporate middlemen to provide the highest-tier alternatives. The exact look, the premium feel, and the on-pitch performance, all without the ridiculous price tag.
          </p>
        </div>

        {/* Value 2: The Sourcing */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 hover:border-fuchsia-500 transition-colors group shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(217,70,239,0.3)]">
          <div className="w-14 h-14 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-6 text-fuchsia-600 text-2xl group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white transition-all shadow-sm">
            <FaHandshake />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">Direct Connection</h3>
          <p className="text-slate-600 leading-relaxed text-sm font-sans">
            This isn't a massive, faceless corporation. It's a one-man operation. Adnan personally manages the supply chain directly with trusted international manufacturers, ensuring every single drop meets the Kora Store standard.
          </p>
        </div>

        {/* Value 3: Local Focus */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 hover:border-pink-500 transition-colors group shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(236,72,153,0.3)]">
          <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 text-pink-600 text-2xl group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
            <FaMapMarkerAlt />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wider">UAE Exclusive</h3>
          <p className="text-slate-600 leading-relaxed text-sm font-sans">
            We don't mess around with dropshipping from overseas that takes 4 weeks to arrive. We stock our inventory locally and ship exclusively within the United Arab Emirates for fast, reliable delivery.
          </p>
        </div>

      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto text-center border-t border-slate-200 pt-16">
        <h2 className="text-3xl font-bold mb-6">Support the local hustle.</h2>
        <Link href="/shop" className="inline-block bg-slate-900 text-white hover:bg-kora px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-md hover:shadow-[0_0_20px_rgba(107,0,255,0.4)]">
          Enter The Vault
        </Link>
      </section>

    </main>
  );
}