import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaHandshake } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-20 pb-20 px-6">
      
      {/* Cinematic Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-24 mt-12">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm text-purple-300 text-xs font-semibold tracking-widest uppercase">
          The Founder's Story
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
          THE GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-500">ARCHIVE.</span><br />
          UNLOCKED IN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">UAE.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
          Founded by Adnan, Kora Store started with a simple mission: the retail market is broken, and fans are getting priced out of the game. We bridge the gap by sourcing the highest-grade alternative kits and boots directly from our manufacturing partners, bringing 1:1 premium football culture straight to the Emirates.
        </p>
      </section>

      {/* The Manifesto / Values Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        
        {/* Value 1: Quality */}
        <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-10 hover:border-purple-500/50 transition-colors group">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400 text-2xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
            <FaStar />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Premium Grade</h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            Let's be real—insane retail markups lock real fans out. We cut the corporate middlemen to provide the highest-tier alternatives. The exact look, the premium feel, and the on-pitch performance, all without the ridiculous price tag.
          </p>
        </div>

        {/* Value 2: The Sourcing */}
        <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-10 hover:border-fuchsia-500/50 transition-colors group">
          <div className="w-14 h-14 bg-fuchsia-500/10 rounded-xl flex items-center justify-center mb-6 text-fuchsia-400 text-2xl group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white transition-all">
            <FaHandshake />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Direct Connection</h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            This isn't a massive, faceless corporation. It's a one-man operation. Adnan personally manages the supply chain directly with trusted international manufacturers, ensuring every single drop meets the Kora Store standard.
          </p>
        </div>

        {/* Value 3: Local Focus */}
        <div className="bg-[#0a0514] border border-white/10 rounded-2xl p-10 hover:border-pink-500/50 transition-colors group">
          <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 text-pink-400 text-2xl group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all">
            <FaMapMarkerAlt />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">UAE Exclusive</h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            We don't mess around with dropshipping from overseas that takes 4 weeks to arrive. We stock our inventory locally and ship exclusively within the United Arab Emirates for fast, reliable delivery.
          </p>
        </div>

      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto text-center border-t border-white/10 pt-16">
        <h2 className="text-3xl font-bold mb-6">Support the local hustle.</h2>
        <Link href="/shop" className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Enter The Vault
        </Link>
      </section>

    </main>
  );
}