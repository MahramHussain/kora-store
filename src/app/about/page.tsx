import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaHandshake, FaShippingFast, FaCheckCircle, FaUsers } from "react-icons/fa";
import { FaBolt } from "react-icons/fa6";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white pt-32 pb-24 px-6 border-b border-slate-100">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-kora/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-kora/30 bg-purple-50 text-kora text-[11px] font-bold tracking-widest uppercase mb-8">
            <FaBolt className="text-kora" />
            The Founder&apos;s Story
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-8 uppercase">
            THE GLOBAL{" "}
            <span className="text-gradient-kora">ARCHIVE.</span>
            <br />
            UNLOCKED IN THE{" "}
            <span className="text-kora">
              UAE.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
            Founded by Adnan, Kora Store started with a simple mission: the retail market is broken,
            and fans are getting priced out of the game. We bridge the gap by sourcing the highest-grade
            alternative kits and shoes directly from manufacturing partners — bringing 1:1 premium
            football culture straight to the Emirates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-4 rounded-full bg-kora text-white font-bold text-sm uppercase tracking-widest hover:bg-purple-600 hover:scale-105 transition-all shadow-lg shadow-kora/30"
            >
              Enter The Vault
            </Link>
            <Link
              href="/faq"
              className="px-8 py-4 rounded-full border border-slate-200 text-slate-800 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              FAQ &amp; Shipping
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Orders Delivered" },
            { value: "1–3", label: "Day UAE Shipping" },
            { value: "100%", label: "Quality Checked" },
            { value: "UAE", label: "Exclusive Operator" },
          ].map((stat) => (
            <div key={stat.label} className="border-r border-slate-200 last:border-0">
              <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values Grid ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">Our Principles</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase mt-4">
              Why Kora Store
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-kora/40 transition-all hover:shadow-[0_20px_60px_-10px_rgba(107,0,255,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-kora/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-kora/10 flex items-center justify-center text-kora text-2xl mb-6 group-hover:bg-kora group-hover:text-white group-hover:scale-110 transition-all">
                  <FaStar />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">Premium Grade</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Insane retail markups lock real fans out. We cut the corporate middlemen to provide
                  the highest-tier alternatives — the exact look, premium feel, and on-pitch performance,
                  without the price tag.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-fuchsia-400/40 transition-all hover:shadow-[0_20px_60px_-10px_rgba(217,70,239,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-600 text-2xl mb-6 group-hover:bg-fuchsia-500 group-hover:text-white group-hover:scale-110 transition-all">
                  <FaHandshake />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">Direct Connection</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  This isn&apos;t a massive, faceless corporation. It&apos;s a one-man operation. Adnan personally
                  manages the supply chain directly with trusted international manufacturers, ensuring
                  every drop meets the Kora Store standard.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-pink-400/40 transition-all hover:shadow-[0_20px_60px_-10px_rgba(236,72,153,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 text-2xl mb-6 group-hover:bg-pink-500 group-hover:text-white group-hover:scale-110 transition-all">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">UAE Exclusive</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  We don&apos;t mess around with dropshipping from overseas that takes 4 weeks to arrive.
                  We stock locally and ship exclusively within the United Arab Emirates — fast,
                  reliable, every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story Timeline ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">Origin Story</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase mt-4">
              How It Started
            </h2>
          </div>

          <div className="relative pl-8 md:pl-0">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-kora/30 via-purple-300/30 to-transparent" />

            <div className="space-y-16">
              {[
                {
                  year: "The Problem",
                  icon: <FaStar className="text-kora" />,
                  title: "Fans priced out",
                  desc: "Retail prices for official jerseys hit AED 500+. Real fans — the ones who live and breathe the game — couldn't afford to represent their clubs and nations properly.",
                  side: "left"
                },
                {
                  year: "The Solution",
                  icon: <FaHandshake className="text-fuchsia-600" />,
                  title: "Bypass the middlemen",
                  desc: "Adnan built direct relationships with elite manufacturing partners to source 1:1 grade alternatives. Same quality. Fraction of the cost. Zero compromises.",
                  side: "right"
                },
                {
                  year: "The Mission",
                  icon: <FaShippingFast className="text-pink-600" />,
                  title: "UAE-first delivery",
                  desc: "Local stock, local shipping, local prices. Every order dispatched within the UAE, reaching fans in 1–3 days. No international delays. No customs headaches.",
                  side: "left"
                },
                {
                  year: "Today",
                  icon: <FaCheckCircle className="text-emerald-600" />,
                  title: "The Vault is open",
                  desc: "500+ orders delivered. A growing community of UAE football fans who trust Kora Store to gear them up for every match, every season, every tournament.",
                  side: "right"
                },
              ].map((item, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row gap-8 ${item.side === "right" ? "md:flex-row-reverse" : ""}`}>
                  {/* Content */}
                  <div className="flex-1 md:text-right last:md:text-left">
                    <div className={`${item.side === "right" ? "md:text-left" : "md:text-right"}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-kora mb-2 block">{item.year}</span>
                      <h3 className="text-2xl font-black text-slate-900 mb-3">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-sm max-w-sm ml-auto">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center icon */}
                  <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 items-center justify-center text-lg z-10 shadow-sm">
                    {item.icon}
                  </div>

                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Band ── */}
      <section className="bg-kora py-14 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              {[1,2,3,4,5].map(s => <FaStar key={s} className="text-yellow-300 text-sm" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Trusted by UAE fans.</h2>
            <p className="text-purple-200 mt-2 text-sm">Every kit quality-checked before it leaves the vault.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">500+</div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">Happy customers</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">48H</div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">UAE delivery</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">100%</div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">QC guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 bg-slate-50 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
          Support the local hustle.
        </h2>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto">
          Every purchase supports a UAE-based operation that genuinely cares about the beautiful game.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-slate-900 text-white hover:bg-kora px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-md hover:shadow-[0_0_30px_rgba(107,0,255,0.4)]"
        >
          Enter The Vault →
        </Link>
      </section>

    </main>
  );
}