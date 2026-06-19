import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard, ProductSkeletonCard } from "@/components/ProductCard";
import { ScrollSlider } from "@/components/ScrollSlider";

async function WorldCupJerseySlider() {
  const products = await prisma.product.findMany({
    where: { isWorldCup: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[260px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString()}} />
        </div>
      ))}
    </>
  );
}

async function ShoesSlider() {
  const products = await prisma.product.findMany({
    where: { category: "Boots" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[260px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString()}} />
        </div>
      ))}
    </>
  );
}

async function StreetwearAndGearSlider() {
  const products = await prisma.product.findMany({
    where: { isWorldCup: false, category: { not: "Boots" } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[260px] md:w-[300px]">
          <ProductCard product={{...product, price: product.price.toString()}} />
        </div>
      ))}
    </>
  );
}

export default async function Home() {
  // Fetch Trending World Cup Products for top carousel
  const trendingWorldCup = await prisma.product.findMany({
    where: { isWorldCup: true },
    take: 6,
    orderBy: { createdAt: "asc" },
  });

  // Fetch Argentina Away Kit for Spotlight
  const argentinaAwayKit = await prisma.product.findUnique({
    where: { id: "argentina-away-kit" },
  });

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pb-20">
      {/* 3. CATEGORY NAVIGATION */}
      <nav className="flex items-center gap-8 px-6 py-4 overflow-x-auto text-sm font-semibold tracking-wider uppercase whitespace-nowrap border-b border-slate-200 bg-slate-50 scrollbar-hide shadow-sm">
        <Link href="/shop" className="text-kora hover:text-purple-700 transition-colors">Featured</Link>
        <Link href="/shop" className="text-slate-600 hover:text-kora transition-colors">Shop All</Link>
        <Link href="/shop?category=Shirts" className="text-slate-600 hover:text-emerald-600 transition-colors">Jerseys</Link>
        <Link href="/shop?category=Boots" className="text-slate-600 hover:text-rose-600 transition-colors">Shoes</Link>
        <Link href="/shop?category=Flags" className="text-slate-600 hover:text-blue-600 transition-colors">Club Flags</Link>
      </nav>

      {/* 4. PROMO BANNER */}
      <div className="bg-purple-100 border-b border-purple-200 py-2.5 text-center text-sm font-bold text-purple-900 px-4">
        🏆 <span className="text-purple-700 font-black">WORLD CUP 2026 DEBUT:</span> Secure the new official national jerseys before the tournament starts. Use code <span className="font-bold text-kora">WORLD26</span> for free shipping.
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {/* 5. SHOP YOUR TEAM & NATION SECTION */}
        <section className="px-6 pt-12 pb-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-1">
            <div className="flex flex-col shrink-0">
              <h2 className="text-2xl font-black tracking-tighter uppercase">Support Your Side</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">National teams & world-class clubs.</p>
              <Link href="/shop" className="mt-4 text-xs font-bold border border-slate-300 rounded-full py-2 px-4 hover:bg-slate-100 text-slate-600 transition-colors w-max text-center">
                See All Teams
              </Link>
            </div>
            
            {/* Scroll Container of Teams & Nations */}
            <div className="flex-1 min-w-0">
              <ScrollSlider>
                {[
                  // National Teams (First/Spotlighted)
                  { 
                    name: 'Argentina', 
                    logo: 'https://flagcdn.com/w160/ar.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] group-hover:border-sky-400/50',
                    text: 'group-hover:text-sky-600 font-bold'
                  },
                  { 
                    name: 'Brazil', 
                    logo: 'https://flagcdn.com/w160/br.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(234,179,8,0.6)] group-hover:border-yellow-400/50',
                    text: 'group-hover:text-yellow-600 font-bold'
                  },
                  { 
                    name: 'France', 
                    logo: 'https://flagcdn.com/w160/fr.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] group-hover:border-blue-500/50',
                    text: 'group-hover:text-blue-700 font-bold'
                  },
                  { 
                    name: 'Germany', 
                    logo: 'https://flagcdn.com/w160/de.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] group-hover:border-slate-400',
                    text: 'group-hover:text-slate-900 font-bold'
                  },
                  { 
                    name: 'Portugal', 
                    logo: 'https://flagcdn.com/w160/pt.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:border-red-500/50',
                    text: 'group-hover:text-red-700 font-bold'
                  },
                  { 
                    name: 'Spain', 
                    logo: 'https://flagcdn.com/w160/es.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:border-yellow-500/50',
                    text: 'group-hover:text-yellow-700 font-bold'
                  },
                  { 
                    name: 'Uruguay', 
                    logo: 'https://flagcdn.com/w160/uy.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] group-hover:border-sky-400/50',
                    text: 'group-hover:text-sky-600 font-bold'
                  },
                  // Clubs
                  { 
                    name: 'Real Madrid', 
                    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:border-slate-300',
                    text: 'group-hover:text-slate-800'
                  },
                  { 
                    name: 'Barcelona', 
                    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] group-hover:border-blue-500/50',
                    text: 'group-hover:text-blue-700'
                  },
                  { 
                    name: 'Man City', 
                    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] group-hover:border-sky-400/50',
                    text: 'group-hover:text-sky-500'
                  },
                  { 
                    name: 'PSG', 
                    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] group-hover:border-blue-600/50',
                    text: 'group-hover:text-blue-700'
                  },
                  { 
                    name: 'Manchester United', 
                    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] group-hover:border-red-500/50',
                    text: 'group-hover:text-red-600'
                  },
                  { 
                    name: 'Arsenal', 
                    logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
                    glow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] group-hover:border-red-500/50',
                    text: 'group-hover:text-red-500'
                  }
                ].map((team, i) => (
                  <Link href={`/shop?team=${team.name}`} key={i} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group px-2 snap-start">
                    <div className={`relative w-20 h-20 rounded-full flex items-center justify-center p-3 bg-white border border-slate-200 transition-all duration-500 z-10 shadow-sm ${team.glow}`}>
                      <img 
                        src={team.logo} 
                        alt={`${team.name} Logo`} 
                        referrerPolicy="no-referrer"
                        className="relative z-20 w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span className={`text-xs font-semibold text-slate-500 text-center max-w-[80px] transition-colors duration-500 uppercase ${team.text}`}>
                      {team.name}
                    </span>
                  </Link>
                ))}
              </ScrollSlider>
            </div>
          </div>
        </section>
      </div>

      {/* 6. WORLD CUP HERO BANNER */}
      <section className="w-full mb-12">
        <div className="relative w-full h-[400px] md:h-[600px] rounded-none overflow-hidden group">
          <img 
            src="/assets/worldcup_banner.jpg" 
            alt="World Cup 2026"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10"></div>
          <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 z-20 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase font-sans drop-shadow-md">
              World Cup 26 is here
            </h2>
            <p className="text-slate-200 text-xs md:text-sm mb-6 max-w-md font-sans font-medium leading-relaxed drop-shadow-sm">
              Gear up for the biggest tournament on earth. Official national jerseys, elite training apparel, and exclusive federation gear. Sourced direct.
            </p>
            <Link href="/shop" className="inline-block bg-white text-slate-900 px-6 md:px-8 py-2.5 md:py-3 rounded-none font-bold text-xs md:text-sm hover:bg-kora hover:text-white hover:scale-105 transition-all shadow-lg uppercase tracking-wider">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* 7. LATEST WORLD CUP DROP (SPOTLIGHT SECTION) */}
      <section className="px-6 mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-tight">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kora opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-kora"></span>
            </span>
            World Cup Spotlight
          </h2>
        </div>
        
        {argentinaAwayKit && (
          <div 
            className="relative w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden group border border-slate-200 hover:border-[#d45372]/50 transition-colors shadow-2xl"
            style={{ backgroundColor: '#d45372' }}
          >
            {/* Spotlight Banner Image aligned to the right, showing fully with contain */}
            <img 
              src="/assets/argentina_away_spotlight.png" 
              alt="Argentina Away Kit"
              className="absolute right-0 top-0 h-full w-auto object-contain pointer-events-none z-0 group-hover:scale-102 transition-transform duration-700"
            />
            
            {/* Pink gradient overlay on the left to blend image seamlessly and keep text readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#d45372] via-[#d45372]/90 to-transparent z-10"></div>
            
            <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 z-20 max-w-[280px] sm:max-w-md md:max-w-lg">
              <p className="text-pink-200 font-bold tracking-widest text-xs md:text-sm uppercase mb-2 md:mb-3">World Cup Highlight</p>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 leading-none tracking-tighter uppercase break-words font-sans">
                Argentina Away Kit
              </h3>
              <p className="text-pink-100 mb-6 md:mb-8 max-w-xs md:max-w-sm text-xs md:text-base line-clamp-2 md:line-clamp-3 font-sans font-medium">
                {argentinaAwayKit.description || "Represent your nation on the world stage. Official premium federation apparel engineered for breathability and elite comfort."}
              </p>
              <Link href={`/shop/${argentinaAwayKit.id}`} className="inline-block bg-white text-[#d45372] px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,83,114,0.4)]">
                Shop The National Kit
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 8. WORLD CUP JERSEYS (Horizontal Slider) */}
      <section className="px-6 mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              National Jerseys
            </h2>
            <p className="text-sm text-slate-500 mt-2">The latest World Cup 2026 kit releases.</p>
          </div>
          <Link 
            href="/shop?category=Shirts" 
            className="text-xs font-bold text-kora hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-2 group"
          >
            See All 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[260px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <WorldCupJerseySlider />
          </Suspense>
        </ScrollSlider>
      </section>

      {/* 8.5 SHOES (Horizontal Slider) */}
      <section className="px-6 mb-16 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              Shoes
            </h2>
            <p className="text-sm text-slate-500 mt-2">Elite pitch boots and luxury streetwear sneakers.</p>
          </div>
          <Link 
            href="/shop?category=Boots" 
            className="text-xs font-bold text-kora hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-2 group"
          >
            See All 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[260px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <ShoesSlider />
          </Suspense>
        </ScrollSlider>
      </section>

      {/* 9. STREETWEAR, ACCESSORIES & FLAGS (Horizontal Slider) */}
      <section className="px-6 mb-24 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
              Streetwear & Accessories
            </h2>
            <p className="text-sm text-slate-500 mt-2">Premium performance socks and official club flags.</p>
          </div>
          <Link 
            href="/shop" 
            className="text-xs font-bold text-kora hover:text-purple-700 transition-colors uppercase tracking-wider flex items-center gap-2 group"
          >
            Explore All Gear 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <ScrollSlider>
          <Suspense fallback={
            <>
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="snap-start shrink-0 w-[260px] md:w-[300px]">
                  <ProductSkeletonCard />
                </div>
              ))}
            </>
          }>
            <StreetwearAndGearSlider />
          </Suspense>
        </ScrollSlider>
      </section>
    </main>
  );
}