"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

// 1. Move the array OUTSIDE and ABOVE the component entirely!
const TRENDING_ROTATION = [
  { id: 1, name: "Real Madrid 24/25 Home", category: "Shirts", price: "$120", image: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png" },
  { id: 2, name: "Predator Elite FT", category: "Boots", price: "$280", image: "https://a.espncdn.com/i/teamlogos/soccer/500/default.png" },
  { id: 3, name: "Arsenal 24/25 Away", category: "Shirts", price: "$110", image: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png" },
  { id: 4, name: "Al Nassr 24/25 Home", category: "Shirts", price: "$130", image: "https://a.espncdn.com/i/teamlogos/soccer/500/default.png" },
  { id: 5, name: "Inter Miami Vice City", category: "Shirts", price: "$140", image: "https://a.espncdn.com/i/teamlogos/soccer/500/default.png" },
  { id: 6, name: "PSG x Jordan Fourth", category: "Shirts", price: "$135", image: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png" },
];

export default function Home() {
  // --- CAROUSEL ENGINE ---
  const [swapIndex, setSwapIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = () => {
    setSwapIndex((prev) => (prev + 1) % TRENDING_ROTATION.length);
  };

  const handlePrev = () => {
    setSwapIndex((prev) => (prev === 0 ? TRENDING_ROTATION.length - 1 : prev - 1));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(handleNext, 3000); // Bumped to 3 seconds so the slide has time to breathe
    return () => clearInterval(timer);
  }, [isHovered]);
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
        <section className="px-6 mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-1">
              Trending 
              {/* THE RAW GIF IMPLEMENTATION */}
              <img 
                src="/fire.gif" 
                alt="Trending Fire" 
                className="w-8 h-8 object-contain pb-1 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]"
              />
            </h2>
          </div>

          {/* THE MASTER DROP CARD */}
          <div 
            className="relative w-full h-[450px] md:h-[500px] bg-[#0a0514] rounded-3xl border border-white/10 overflow-hidden group shadow-2xl focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 opacity-60 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay z-0"></div>

            {/* THE SLIDING TRACK */}
            <div 
              className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 relative"
              style={{ transform: `translateX(-${swapIndex * 100}%)` }}
            >
              {TRENDING_ROTATION.map((item, index) => (
                <div key={item.id} className="w-full h-full shrink-0 flex flex-col-reverse md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12">
                  
                  {/* Text Side */}
                  <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full">
                    <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      <span className="text-orange-500 font-black tracking-widest uppercase text-xs md:text-sm">
                        {item.category}
                      </span>
                    </div>
                    
                    <h3 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tighter drop-shadow-lg line-clamp-2">
                      {item.name}
                    </h3>
                    
                    <p className="text-2xl md:text-3xl font-bold text-slate-300 mb-8">
                      {item.price}
                    </p>
                    
                    <div>
                      {/* WIRED THIS BUTTON UP TO THE ID DIRECTLY */}
                      <Link href={`/shop/${item.id}`} className="inline-block bg-white text-black hover:bg-orange-500 hover:text-white px-10 py-4 rounded-full font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105">
                        Secure Now
                      </Link>
                    </div>
                  </div>

                  {/* Image Side */}
                  <div className="flex-1 flex justify-center items-center relative h-full w-full">
                    <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors duration-700"></div>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="relative z-20 w-64 h-64 md:w-[400px] md:h-[400px] object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out" 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* NAVIGATION ARROWS */}
            <button 
              onClick={handlePrev}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-orange-500 text-white rounded-full backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous Item"
            >
              <FaChevronLeft className="text-xl pr-1" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-orange-500 text-white rounded-full backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next Item"
            >
              <FaChevronRight className="text-xl pl-1" />
            </button>

            {/* DOT INDICATORS */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
              {TRENDING_ROTATION.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSwapIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    swapIndex === i ? 'bg-orange-500 w-10 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-white/20 w-2 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>  
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
          
          {/* Cinematic Feature Card */}
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden group border border-white/10 hover:border-purple-500/50 transition-colors shadow-2xl bg-[#0a0514]">
            
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-purple-900/20 group-hover:bg-purple-900/40 transition-colors z-0"></div>
            
            {/* Text Content */}
            <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 z-20 max-w-lg">
              <p className="text-purple-400 font-bold tracking-widest text-xs md:text-sm uppercase mb-2">Exclusive Drop</p>
              <h3 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tighter">
                PREDATOR <br/>ELITE FT
              </h3>
              <p className="text-slate-400 mb-8 max-w-sm text-sm md:text-base">
                The most lethal boot in the game. Re-engineered for pure striking power. Secure your pair before they sell out.
              </p>
              {/* WIRED THIS BUTTON UP TO GO TO ID #1 */}
              <Link href="/shop/1" className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Shop The Drop
              </Link>
            </div>

            {/* Glowing Image Placeholder */}
            <div className="absolute right-[-10%] md:right-10 top-1/2 -translate-y-1/2 z-10 opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute right-0 md:right-20 top-1/2 -translate-y-1/2 z-20 text-slate-700 font-black text-2xl group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              [ Massive Boot Image Here ]
            </div>
          </div>
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

          {/* Horizontal Scroll Track */}
          <div className="flex overflow-x-auto gap-6 pb-8 pt-2 scrollbar-hide snap-x">
            {TRENDING_ROTATION.slice(0, 4).map((product) => (
              <Link 
                href={`/shop/${product.id}`} 
                key={product.id} 
                className="snap-start shrink-0 w-[260px] md:w-[300px] group relative bg-[#0a0514] rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors shadow-lg overflow-hidden flex flex-col h-[320px]"
              >
                {/* Product Image Area */}
                <div className="relative flex-1 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center p-6 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-32 h-32 object-contain group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-70 group-hover:opacity-100" 
                  />
                </div>

                {/* Product Info Area */}
                <div className="p-5 border-t border-white/5 relative z-20 bg-[#0a0514]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</p>
                      <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">{product.name}</h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                     <span className="text-lg font-black text-white">{product.price}</span>
                     <span className="text-xs font-bold bg-white/10 text-white px-3 py-1.5 rounded-full group-hover:bg-purple-600 transition-colors">
                       View Gear
                     </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
    </main>
  );
}