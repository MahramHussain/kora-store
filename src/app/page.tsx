import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { TrendingCarousel } from "@/components/TrendingCarousel";
import { ProductCard, ProductSkeletonCard } from "@/components/ProductCard";

async function RecentlyUnlockedProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
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
  // Fetch Trending Products
  const trendingProducts = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: "asc" }, // Grab some older products for variety, or whatever you prefer
  });

  // Fetch Latest Product
  const latestProduct = await prisma.product.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pb-20">
      {/* 3. CATEGORY NAVIGATION */}
      <nav className="flex items-center gap-8 px-6 py-4 overflow-x-auto text-sm font-bold tracking-widest uppercase whitespace-nowrap border-b border-white/5 bg-white/5 scrollbar-hide">
        {/* We use ?tag= parameters here so The Vault knows exactly what to filter when it loads */}
        <Link href="/shop" className="text-purple-400 hover:text-purple-300 transition-colors">Featured</Link>
        <Link href="/shop" className="hover:text-purple-400 transition-colors">Shop</Link>
        <Link href="/shop?tag=Latest" className="hover:text-emerald-400 transition-colors">Latest</Link>
        <Link href="/shop?tag=Trending" className="hover:text-rose-400 transition-colors">Trending</Link>
      </nav>

      {/* 4. PROMO BANNER */}
      <div className="bg-purple-900/30 border-b border-purple-500/20 py-2 text-center text-sm font-medium">
        🎉 <span className="text-purple-300">20% Off All Elite Boots + Free Shipping.</span> Use code <span className="font-bold text-white">KORA20</span>
      </div>

      <div className="max-w-7xl mx-auto w-full">
      {/* 5. SHOP YOUR TEAM SECTION */}
      <section className="px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
          <div className="flex flex-col shrink-0">
            <h2 className="text-2xl font-bold">Shop Your Team</h2>
            {/* Swapped the <button> for a <Link> that points to The Vault */}
            <Link href="/shop" className="mt-2 text-sm border border-purple-500/50 rounded-full py-1.5 px-4 hover:bg-purple-500/10 text-purple-300 transition-colors w-max text-center">
              See All
            </Link>
          </div>
            
            {/* The Scroll Container - cleaned up the padding */}
            <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide flex-1 w-full">
              {[
                { 
                  name: 'Arsenal', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] group-hover:border-red-500/50',
                  text: 'group-hover:text-red-400'
                },
                { 
                  name: 'Man City', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] group-hover:border-sky-400/50',
                  text: 'group-hover:text-sky-300'
                },
                { 
                  name: 'Real Madrid', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:border-white/50',
                  text: 'group-hover:text-white'
                },
                { 
                  name: 'Barcelona', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] group-hover:border-blue-500/50',
                  text: 'group-hover:text-blue-500'
                },
                { 
                  name: 'Bayern', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:border-red-600/50',
                  text: 'group-hover:text-red-500'
                },
                { 
                  name: 'Juventus', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] group-hover:border-white/50',
                  text: 'group-hover:text-white',
                  invert: true
                },
                { 
                  name: 'AC Milan', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:border-red-600/50',
                  text: 'group-hover:text-red-500'
                },
                { 
                  name: 'PSG', 
                  logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
                  glow: 'group-hover:shadow-[0_0_15px_rgba(37,99,235,0.6)] group-hover:border-blue-600/50',
                  text: 'group-hover:text-blue-500'
                }
              ].map((team, i) => (
                <Link href={`/shop?team=${team.name}`} key={i} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group px-2">
                  
                  {/* Main Logo Container using direct Box Shadow for a perfect circular glow */}
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center p-3 bg-[#0a0514] border border-white/10 transition-all duration-500 z-10 ${team.glow}`}>
                    
                    {/* The Actual Logo */}
                    <img 
                      src={team.logo} 
                      alt={`${team.name} Logo`} 
                      className={`relative z-20 w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ${team.invert ? 'invert brightness-0' : ''}`}
                    />
                  </div>

                  {/* Team Name */}
                  <span className={`text-xs font-semibold text-slate-400 text-center max-w-[80px] transition-colors duration-500 ${team.text}`}>
                    {team.name}
                  </span>
                  
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. BIG CARD TRENDING SECTION */}
        <TrendingCarousel products={trendingProducts} />  
      </div>

        {/* 7. LATEST RIGHT NOW (NEW SECTION) */}
        <section className="px-6 mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              Latest Right Now
            </h2>
          </div>
          
          {latestProduct && (
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden group border border-white/10 hover:border-purple-500/50 transition-colors shadow-2xl bg-[#0a0514]">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 w-1/2 h-full bg-purple-900/20 group-hover:bg-purple-900/40 transition-colors z-0"></div>
              
              <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 z-20 max-w-lg">
                <p className="text-purple-400 font-bold tracking-widest text-xs md:text-sm uppercase mb-2">Exclusive Drop</p>
                <h3 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tighter uppercase break-words">
                  {latestProduct.name}
                </h3>
                <p className="text-slate-400 mb-8 max-w-sm text-sm md:text-base line-clamp-3">
                  {latestProduct.description || "The most lethal drop in the game. Re-engineered for pure power. Secure yours before they sell out."}
                </p>
                <Link href={`/shop/${latestProduct.id}`} className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Shop The Drop
                </Link>
              </div>

              <div className="absolute right-[-10%] md:right-10 top-1/2 -translate-y-1/2 z-10 opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/20 rounded-full blur-[100px]"></div>
              
              <img 
                src={latestProduct.images[0]} 
                alt={latestProduct.name}
                className="absolute right-0 md:right-20 top-1/2 -translate-y-1/2 z-20 object-contain w-64 h-64 md:w-[400px] md:h-[400px] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 pointer-events-none drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              />
            </div>
          )}
        </section>


      {/* 8. RECENTLY UNLOCKED (Horizontal Slider) */}
        <section className="px-6 mb-24 max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Recently Unlocked
              </h2>
              <p className="text-sm text-slate-400 mt-1">The newest gear added to The Vault.</p>
            </div>
            {/* The See All Button */}
            <Link 
              href="/shop?tag=Latest" 
              className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center gap-2 group"
            >
              See All 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Horizontal Scroll Track with Live Prisma Skeleton Fallback */}
          <div className="flex overflow-x-auto gap-6 pb-8 pt-2 scrollbar-hide snap-x">
            <Suspense fallback={
              <>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="snap-start shrink-0 w-[260px] md:w-[300px]">
                    <ProductSkeletonCard />
                  </div>
                ))}
              </>
            }>
              <RecentlyUnlockedProducts />
            </Suspense>
          </div>
        </section>
    </main>
  );
}