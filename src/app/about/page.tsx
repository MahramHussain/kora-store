import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaHandshake, FaShippingFast, FaCheckCircle, FaUsers } from "react-icons/fa";
import { FaBolt } from "react-icons/fa6";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const t = (key: string) => {
    const entry = (translations as any)[key];
    if (!entry) return key;
    return entry[lang] || entry["en"] || key;
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-kora selection:text-white transition-colors duration-300">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-32 pb-24 px-6 border-b border-slate-100 dark:border-slate-800">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-kora/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-kora/30 bg-purple-50 text-kora text-[11px] font-bold tracking-widest uppercase mb-8">
            <FaBolt className="text-kora" />
            {t("journey_subtitle")}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-8 uppercase">
            {t("about_title_1")}{" "}
            <span className="text-gradient-kora">{t("about_title_2")}</span>
            <br />
            {t("about_title_3")}{" "}
            <span className="text-kora border-b-4 border-kora/30 pb-1">
              {t("about_title_4")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
            {t("about_hero_desc")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-4 rounded-full bg-kora text-white font-bold text-sm uppercase tracking-widest hover:bg-purple-600 hover:scale-105 transition-all shadow-lg shadow-kora/30"
            >
              {t("shop_now")}
            </Link>
            <Link
              href="/faq"
              className="px-8 py-4 rounded-full border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              {t("about_faq_btn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: t("orders_delivered") },
            { value: "1–3", label: t("day_uae_shipping") },
            { value: "100%", label: t("quality_checked") },
            { value: "UAE", label: t("uae_exclusive") },
          ].map((stat) => (
            <div key={stat.label} className="border-e border-slate-200 dark:border-slate-800 last:border-0">
              <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values Grid ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">{t("our_principles")}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase mt-4">
              {t("why_kora_store")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-kora/40 dark:hover:border-kora/40 transition-all hover:shadow-[0_20px_60px_-10px_rgba(107,0,255,0.15)] overflow-hidden text-start">
              <div className="absolute inset-0 bg-gradient-to-br from-kora/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-kora/10 flex items-center justify-center text-kora text-2xl mb-6 group-hover:bg-kora group-hover:text-white group-hover:scale-110 transition-all">
                  <FaStar />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-wide">{t("premium_grade")}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {t("premium_grade_desc")}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-fuchsia-400/40 dark:hover:border-fuchsia-400/40 transition-all hover:shadow-[0_20px_60px_-10px_rgba(217,70,239,0.15)] overflow-hidden text-start">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-600 text-2xl mb-6 group-hover:bg-fuchsia-500 group-hover:text-white group-hover:scale-110 transition-all">
                  <FaHandshake />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">{t("pillar_2_title")}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  {t("pillar_2_desc")}
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-pink-400/40 dark:hover:border-pink-400/40 transition-all hover:shadow-[0_20px_60px_-10px_rgba(236,72,153,0.15)] overflow-hidden text-start">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 text-2xl mb-6 group-hover:bg-pink-500 group-hover:text-white group-hover:scale-110 transition-all">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">{t("uae_exclusive")}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  {t("uae_exclusive_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story Timeline ── */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">{t("origin_story")}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase mt-4">
              {t("how_it_started")}
            </h2>
          </div>

          <div className="relative ltr:pl-8 rtl:pr-8 md:pl-0 md:pr-0">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-kora/30 via-purple-300/30 to-transparent" />

            <div className="space-y-16">
              {[
                {
                  year: t("problem"),
                  icon: <FaStar className="text-kora" />,
                  title: t("fans_priced_out"),
                  desc: t("fans_priced_out_desc"),
                  side: "left"
                },
                {
                  year: t("solution"),
                  icon: <FaHandshake className="text-fuchsia-600" />,
                  title: t("journey_2_title"),
                  desc: t("middlemen_desc"),
                  side: "right"
                },
                {
                  year: t("mission"),
                  icon: <FaShippingFast className="text-pink-600" />,
                  title: t("uae_first_delivery"),
                  desc: t("uae_first_delivery_desc"),
                  side: "left"
                },
                {
                  year: t("today_label"),
                  icon: <FaCheckCircle className="text-emerald-600" />,
                  title: t("journey_3_title"),
                  desc: t("journey_3_desc"),
                  side: "right"
                },
              ].map((item, i) => (
                <div key={i} className={`relative flex flex-col md:flex-row gap-8 ${item.side === "right" ? "md:flex-row-reverse" : ""}`}>
                  {/* Content */}
                  <div className="flex-1 ltr:md:text-right rtl:md:text-left last:ltr:md:text-left last:rtl:md:text-right">
                    <div className={`${item.side === "right" ? "ltr:md:text-left rtl:md:text-right" : "ltr:md:text-right rtl:md:text-left"}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-kora dark:text-purple-400 mb-2 block">{item.year}</span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3">{item.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-sm ltr:ml-auto rtl:mr-auto">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center icon */}
                  <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 items-center justify-center text-lg z-10 shadow-sm">
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
          <div className="text-white text-center ltr:md:text-left rtl:md:text-right">
            <div className="flex items-center gap-2 justify-center ltr:md:justify-start rtl:md:justify-end mb-2">
              {[1,2,3,4,5].map(s => <FaStar key={s} className="text-yellow-300 text-sm" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{t("trusted_by")}</h2>
            <p className="text-purple-200 mt-2 text-sm">{t("quality_checked")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">500+</div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">{t("happy_customers")}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">48H</div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">{t("uae_delivery")}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-white mb-0.5">100%</div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">{t("qc_guaranteed")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/30 text-center border-t border-slate-200 dark:border-slate-800/80">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter mb-4">
          {t("local_hustle_title")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
          {t("local_hustle_desc")}
        </p>
        <Link
          href="/shop"
          className="inline-block bg-slate-900 text-white hover:bg-kora px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-md hover:shadow-[0_0_30px_rgba(107,0,255,0.4)]"
        >
          {t("see_all")} →
        </Link>
      </section>

    </main>
  );
}