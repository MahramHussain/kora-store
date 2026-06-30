"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/app/admin/actions";
import { FaBars, FaXmark, FaBoxOpen } from "react-icons/fa6";
import { FiUser, FiShoppingBag, FiSearch, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { SignInButton, Show, useUser } from "@clerk/nextjs";

const JERSEYS: Record<
  string,
  { name: string; primary: string; secondary: string; stripes?: boolean; sleeves?: string }
> = {
  argentina: { name: "Argentina", primary: "#74acdf", secondary: "#ffffff", stripes: true },
  realmadrid: { name: "Real Madrid", primary: "#ffffff", secondary: "#d4af37", sleeves: "#ffffff" },
  alnassr: { name: "Al Nassr", primary: "#ffcc00", secondary: "#0055b8", sleeves: "#ffcc00" },
  portugal: { name: "Portugal", primary: "#bc0000", secondary: "#006600", sleeves: "#bc0000" },
  barcelona: { name: "Barcelona", primary: "#004d98", secondary: "#a50044", stripes: true },
  mancity: { name: "Man City", primary: "#6cabdd", secondary: "#ffffff", sleeves: "#6cabdd" },
  arsenal: { name: "Arsenal", primary: "#ef0107", secondary: "#ffffff", sleeves: "#ffffff" },
  intermiami: { name: "Inter Miami", primary: "#f7b5cd", secondary: "#000000", sleeves: "#f7b5cd" },
};

function MiniJersey({ colors }: { colors: typeof JERSEYS[string] }) {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] shrink-0 overflow-hidden">
      {/* Torso */}
      <div
        className="relative w-4.5 h-6 rounded-t-2xs overflow-hidden"
        style={{ backgroundColor: colors.primary }}
      >
        {colors.stripes && (
          <div className="absolute inset-0 flex justify-around">
            <div className="w-1 h-full" style={{ backgroundColor: colors.secondary }} />
            <div className="w-1 h-full" style={{ backgroundColor: colors.secondary }} />
          </div>
        )}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-1 bg-slate-900/10 rounded-b-full" />
      </div>
      {/* Left Sleeve */}
      <div
        className="absolute top-0.5 left-0.5 w-2 h-3.5 rounded-l-2xs origin-top-right -rotate-25"
        style={{ backgroundColor: colors.sleeves || colors.primary }}
      />
      {/* Right Sleeve */}
      <div
        className="absolute top-0.5 right-0.5 w-2 h-3.5 rounded-r-2xs origin-top-left rotate-25"
        style={{ backgroundColor: colors.sleeves || colors.primary }}
      />
    </div>
  );
}

function NavbarAvatar({
  imageUrl,
  name,
  selectedAvatar,
  size = "w-6 h-6 md:w-8 md:h-8"
}: {
  imageUrl?: string;
  name: string;
  selectedAvatar: string | null;
  size?: string;
}) {
  if (selectedAvatar && JERSEYS[selectedAvatar]) {
    return (
      <div className={`${size} rounded-full bg-slate-900 border border-neutral-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0`}>
        <MiniJersey colors={JERSEYS[selectedAvatar]} />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img src={imageUrl} alt="Profile" className={`${size} rounded-full border border-neutral-200 shadow-xs object-cover shrink-0`} referrerPolicy="no-referrer" />
    );
  }

  return (
    <div className={`${size} rounded-full bg-[#6B00FF] text-white flex items-center justify-center text-[10px] md:text-xs font-black uppercase shadow-xs`}>
      {name.charAt(0)}
    </div>
  );
}

const clubCategories = [
  {
    title: "Premier League",
    teams: [
      { name: "Arsenal", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png" },
      { name: "Chelsea", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png" },
      { name: "Crystal Palace", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/384.png" },
      { name: "Liverpool", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png" },
      { name: "Manchester City", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png" },
      { name: "Manchester United", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png" },
      { name: "Tottenham Hotspur", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png" }
    ]
  },
  {
    title: "Bundesliga",
    teams: [
      { name: "1. FC Union Berlin", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/598.png" },
      { name: "Bayern Munich", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png" },
      { name: "Borussia Dortmund", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/124.png" },
      { name: "Eintracht Frankfurt", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/125.png" },
      { name: "Hamburger SV", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/131.png" },
      { name: "St. Pauli", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2840.png" },
      { name: "VfB Stuttgart", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/134.png" }
    ]
  },
  {
    title: "La Liga",
    teams: [
      { name: "Athletic Bilbao", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/93.png" },
      { name: "Atletico Madrid", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png" },
      { name: "Barcelona", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png" },
      { name: "Real Madrid", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png" },
      { name: "Sevilla", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/243.png" },
      { name: "Valencia", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/95.png" },
      { name: "Villarreal", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/97.png" }
    ]
  },
  {
    title: "Serie A",
    teams: [
      { name: "AC Milan", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png" },
      { name: "AS Roma", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png" },
      { name: "Inter Milan", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png" },
      { name: "Juventus", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png" },
      { name: "Lazio", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/112.png" },
      { name: "Napoli", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/114.png" },
      { name: "Parma", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/115.png" }
    ]
  },
  {
    title: "Featured Clubs",
    teams: [
      { name: "Boca Juniors", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/5.png" },
      { name: "Captain Tsubasa", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/default.png", isCustom: true },
      { name: "Corinthians", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/87.png" },
      { name: "Galatasaray", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/374.png" },
      { name: "Gremio", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/15.png" },
      { name: "Paris Saint-Germain", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png" },
      { name: "Santos FC", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/9.png" }
    ]
  }
];

const nationalCategories = [
  {
    title: "Europe",
    teams: [
      { name: "Belgium", code: "be" },
      { name: "Croatia", code: "hr" },
      { name: "England", code: "gb" },
      { name: "France", code: "fr" },
      { name: "Germany", code: "de" },
      { name: "Greece", code: "gr" },
      { name: "Holland", code: "nl" },
      { name: "Hungary", code: "hu" },
      { name: "Italy", code: "it" },
      { name: "Norway", code: "no" },
      { name: "Poland", code: "pl" },
      { name: "Portugal", code: "pt" },
      { name: "Spain", code: "es" }
    ]
  },
  {
    title: "South America",
    teams: [
      { name: "Argentina", code: "ar" },
      { name: "Bolivia", code: "bo" },
      { name: "Brazil", code: "br" },
      { name: "Chile", code: "cl" },
      { name: "Colombia", code: "co" },
      { name: "Ecuador", code: "ec" },
      { name: "Paraguay", code: "py" },
      { name: "Peru", code: "pe" },
      { name: "Suriname", code: "sr" },
      { name: "Uruguay", code: "uy" },
      { name: "Venezuela", code: "ve" }
    ]
  },
  {
    title: "Africa",
    teams: [
      { name: "Algeria", code: "dz" },
      { name: "Angola", code: "ao" },
      { name: "Cameroon", code: "cm" },
      { name: "Cape Verde", code: "cv" },
      { name: "Egypt", code: "eg" },
      { name: "Ethiopia", code: "et" },
      { name: "Ghana", code: "gh" },
      { name: "Ivory Coast", code: "ci" },
      { name: "Morocco", code: "ma" },
      { name: "Nigeria", code: "ng" },
      { name: "Senegal", code: "sn" },
      { name: "South Africa", code: "za" },
      { name: "Tunisia", code: "tn" }
    ]
  },
  {
    title: "N. & C. America",
    teams: [
      { name: "Barbados", code: "bb" },
      { name: "Canada", code: "ca" },
      { name: "Costa Rica", code: "cr" },
      { name: "Cuba", code: "cu" },
      { name: "El Salvador", code: "sv" },
      { name: "Haiti", code: "ht" },
      { name: "Honduras", code: "hn" },
      { name: "Jamaica", code: "jm" },
      { name: "Mexico", code: "mx" },
      { name: "Panama", code: "pa" },
      { name: "Trinidad & Tobago", code: "tt" },
      { name: "USA", code: "us" }
    ]
  },
  {
    title: "Asia & Oceania",
    teams: [
      { name: "Australia", code: "au" },
      { name: "Bangladesh", code: "bd" },
      { name: "Bhutan", code: "bt" },
      { name: "China", code: "cn" },
      { name: "Japan", code: "jp" },
      { name: "New Zealand", code: "nz" },
      { name: "Palestine", code: "ps" },
      { name: "Saudi Arabia", code: "sa" },
      { name: "South Korea", code: "kr" }
    ]
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kora_vault_avatar");
    setSelectedAvatar(saved);
  }, [pathname]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Mobile accordion states
  const [isMobileClubsOpen, setIsMobileClubsOpen] = useState(false);
  const [isMobileNationalOpen, setIsMobileNationalOpen] = useState(false);
  const [activeMobileClubCategory, setActiveMobileClubCategory] = useState<string | null>(null);
  const [activeMobileNationalCategory, setActiveMobileNationalCategory] = useState<string | null>(null);
  
  // Patch banner state
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    getProducts().then(products => {
      setSuggestions(products.map(p => p.name));
    });
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  // Sync mobile menu and mobile search states (mutually exclusive)
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileSearchOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileSearchOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileSearchOpen]);

  const filteredSuggestions = suggestions.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent, term?: string) => {
    e.preventDefault();
    const finalSearch = term || searchTerm;
    if (finalSearch.trim()) {
      router.push(`/shop?q=${finalSearch}`);
      setSearchTerm(""); 
      setIsFocused(false);
      setIsMobileMenuOpen(false); 
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* 1. FLOWING TICKER BANNER (Desktop & Mobile) */}
      <div className="relative w-full overflow-hidden bg-neutral-100 text-neutral-800 border-b border-neutral-200 py-2.5 text-xs md:text-[13px] font-bold select-none z-50">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          <span className="mx-4">
            USE CODE KORA10 FOR 10% OFF ON ORDER TOTAL &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            FREE SHIPPING ON ORDER TOTAL 200 AED &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            SHIPPING ALL OVER UAE WITHIN 1-2 DAYS &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            100+ POSITIVE REVIEWS &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          </span>
          <span className="mx-4">
            USE CODE KORA10 FOR 10% OFF ON ORDER TOTAL &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            FREE SHIPPING ON ORDER TOTAL 200 AED &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            SHIPPING ALL OVER UAE WITHIN 1-2 DAYS &nbsp;&nbsp;&bull;&nbsp;&nbsp; 
            100+ POSITIVE REVIEWS &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* 2. MAIN HEADER (White Theme) */}
      <header className="relative w-full bg-white text-neutral-900 border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        
        {/* ROW 1: Main Bar (Logo, Search, Profile, Basket) */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4 relative">
          
          {/* Logo & Mobile Menu Hamburger */}
          <div className="flex items-center gap-2.5 md:gap-4 shrink-0 z-10">
            <button 
              className="md:hidden text-neutral-900 text-2xl hover:text-[#6B00FF] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaXmark /> : <FaBars />}
            </button>

            {/* Mobile Search Toggle Icon */}
            <button 
              className="md:hidden text-neutral-900 text-2xl hover:text-[#6B00FF] transition-colors p-1"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              title="Search"
            >
              <FiSearch />
            </button>

            {/* Brand Logo (Desktop only - hidden on mobile) */}
            <Link href="/" className="hidden md:block text-2xl md:text-3xl font-black tracking-tighter uppercase hover:scale-105 transition-transform">
              <span className="text-slate-900">KORA</span><span className="text-kora drop-shadow-[0_0_10px_rgba(107,0,255,0.4)]">STORE</span>
            </Link>
          </div>

          {/* Brand Logo (Mobile only - absolutely centered) */}
          <Link 
            href="/" 
            onClick={() => { setIsMobileMenuOpen(false); setIsMobileSearchOpen(false); }}
            className="md:hidden absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-tighter uppercase hover:scale-105 transition-transform z-10"
          >
            <span className="text-slate-900">KORA</span><span className="text-kora drop-shadow-[0_0_10px_rgba(107,0,255,0.4)]">STORE</span>
          </Link>
          
          {/* Centralized Search Bar */}
          {pathname !== '/shop' ? (
            <div className="hidden md:block flex-1 max-w-xl relative" ref={dropdownRef}>
              <form onSubmit={(e) => handleSearch(e)} className="relative group z-20">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder="Search entire store here..." 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-none py-2.5 px-4 pr-10 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] transition-all font-sans"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#6B00FF] transition-colors z-20">
                  <FiSearch className="text-lg" />
                </button>
              </form>

              {isFocused && searchTerm && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-none shadow-xl overflow-hidden z-40 py-1">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      onClick={(e) => handleSearch(e as any, suggestion)}
                      className="px-4 py-2 hover:bg-neutral-50 cursor-pointer text-neutral-700 hover:text-[#6B00FF] transition-colors flex items-center gap-2 font-sans text-xs"
                    >
                      <FiSearch className="text-[10px] text-neutral-400" /> {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:block flex-1 max-w-xl"></div>
          )}

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 md:gap-5 shrink-0 z-10">
            {/* Cart/Basket */}
            <Link href="/cart" className="relative text-neutral-800 hover:text-[#6B00FF] transition-colors p-1" title="Shopping Cart">
              <FiShoppingBag className="text-xl md:text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6B00FF] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Button (Clerk integration / Direct Dashboard Redirect) */}
            <div className="flex items-center">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-neutral-800 hover:text-[#6B00FF] transition-colors p-1" title="Sign In / Register">
                    <FiUser className="text-xl md:text-2xl" />
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link 
                  href="/account/dashboard" 
                  className="flex items-center justify-center hover:scale-105 transition-transform p-1" 
                  title="Vault Dashboard"
                >
                  <NavbarAvatar 
                    imageUrl={clerkUser?.imageUrl} 
                    name={clerkUser?.firstName || "V"} 
                    selectedAvatar={selectedAvatar} 
                  />
                </Link>
              </Show>
            </div>
          </div>
        </div>

        {/* Mobile Search Row */}
        {pathname !== '/shop' && isMobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 relative" ref={dropdownRef}>
            <form onSubmit={(e) => handleSearch(e)} className="relative group z-20">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Search entire store here..." 
                className="w-full bg-neutral-50 border border-neutral-200 rounded-none py-2 px-4 pr-10 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] transition-all font-sans"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#6B00FF] transition-colors z-20">
                <FiSearch className="text-md" />
              </button>
            </form>

            {isFocused && searchTerm && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-neutral-200 rounded-none shadow-xl overflow-hidden z-40 py-1">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    onClick={(e) => handleSearch(e as any, suggestion)}
                    className="px-4 py-2 hover:bg-neutral-50 cursor-pointer text-neutral-700 hover:text-[#6B00FF] transition-colors flex items-center gap-2 font-sans text-xs"
                  >
                    <FiSearch className="text-[10px] text-neutral-400" /> {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROW 2: Categories Navigation Row (Desktop Only - White Theme) */}
        <div className="hidden md:block bg-white border-t border-neutral-100 py-3 relative z-30">
          <div className="max-w-7xl mx-auto px-6 relative flex justify-center items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-600">
            
            <Link href="/shop" className="hover:text-[#6B00FF] transition-colors">Shop</Link>
            <Link href="/shop?category=World Cup" className="hover:text-[#6B00FF] transition-colors">World Cup</Link>
            
            {/* Clubs Dropdown Menu */}
            <div className="group static">
              <button className="flex items-center gap-1 hover:text-[#6B00FF] transition-colors uppercase font-bold py-1">
                Club <FiChevronDown className="text-xs text-neutral-400 group-hover:text-[#6B00FF]" />
              </button>
              
              {/* Mega Dropdown */}
              <div className="absolute top-full left-6 right-6 bg-white border border-neutral-200 shadow-2xl rounded-none z-50 text-neutral-900 py-8 px-10 grid grid-cols-7 gap-6 transition-all duration-300 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto animate-fade-in-slide">
                {clubCategories.map((cat, i) => (
                  <div key={i} className="flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 pb-1 border-b border-neutral-100">
                      {cat.title}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {cat.teams.map((team, idx) => (
                        <Link 
                          key={idx} 
                          href={`/shop?team=${team.name}`} 
                          className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-[#6B00FF] hover:translate-x-1 transition-all duration-200 group/item"
                        >
                          <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-neutral-50 border border-neutral-100 shrink-0">
                            <img 
                              src={team.logo} 
                              alt={team.name} 
                              className="w-3.5 h-3.5 object-contain group-hover/item:scale-110 transition-transform duration-200" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="truncate">{team.name}</span>
                        </Link>
                      ))}
                      <Link href="/shop" className="text-[9px] font-black uppercase text-neutral-400 hover:text-[#6B00FF] mt-1 flex items-center gap-0.5">
                        View All <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {/* A-Z Club Teams Card */}
                <Link href="/shop" className="relative overflow-hidden rounded-none aspect-square bg-neutral-50 border border-neutral-200 group/card cursor-pointer flex flex-col justify-between p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,0,255,0.06),transparent)]" />
                  <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest relative z-10">A-Z Club Teams</div>
                  <div className="relative z-10 my-auto text-center">
                    <span className="text-3xl font-black text-neutral-900 tracking-tighter uppercase block">A <span className="text-kora">TO</span> Z</span>
                  </div>
                  <div className="text-[9px] font-bold text-neutral-600 group-hover/card:text-kora transition-colors flex items-center gap-1 relative z-10">
                    Browse All <span>→</span>
                  </div>
                </Link>

                {/* World Leagues Card */}
                <Link href="/shop" className="relative overflow-hidden rounded-none aspect-square bg-neutral-50 border border-neutral-200 group/card cursor-pointer flex flex-col justify-between p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,0,255,0.06),transparent)]" />
                  <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest relative z-10">World Leagues</div>
                  <div className="relative z-10 grid grid-cols-3 gap-1 opacity-75 group-hover/card:opacity-95 transition-opacity">
                    <span className="text-[8px] font-black border border-neutral-300 rounded-none p-0.5 text-center text-neutral-700 bg-white">EPL</span>
                    <span className="text-[8px] font-black border border-neutral-300 rounded-none p-0.5 text-center text-neutral-700 bg-white">LIGA</span>
                    <span className="text-[8px] font-black border border-neutral-300 rounded-none p-0.5 text-center text-neutral-700 bg-white">SERIE</span>
                    <span className="text-[8px] font-black border border-neutral-300 rounded-none p-0.5 text-center text-neutral-700 bg-white">BUND</span>
                    <span className="text-[8px] font-black border border-neutral-300 rounded-none p-0.5 text-center text-neutral-700 bg-white">MLS</span>
                    <span className="text-[8px] font-black border border-neutral-300 rounded-none p-0.5 text-center text-neutral-700 bg-white">LIGUE</span>
                  </div>
                  <div className="text-[9px] font-bold text-neutral-600 group-hover/card:text-kora transition-colors flex items-center gap-1 relative z-10">
                    Shop Leagues <span>→</span>
                  </div>
                </Link>

              </div>
            </div>

            {/* National Dropdown Menu */}
            <div className="group static">
              <button className="flex items-center gap-1 hover:text-[#6B00FF] transition-colors uppercase font-bold py-1">
                National <FiChevronDown className="text-xs text-neutral-400 group-hover:text-[#6B00FF]" />
              </button>
              
              {/* Mega Dropdown */}
              <div className="absolute top-full left-6 right-6 bg-white border border-neutral-200 shadow-2xl rounded-none z-50 text-neutral-900 py-8 px-10 grid grid-cols-6 gap-6 transition-all duration-300 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto animate-fade-in-slide">
                {nationalCategories.map((cat, i) => (
                  <div key={i} className="flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 pb-1 border-b border-neutral-100">
                      {cat.title}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {cat.teams.slice(0, 10).map((team, idx) => (
                        <Link 
                          key={idx} 
                          href={`/shop?team=${team.name}`} 
                          className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-[#6B00FF] hover:translate-x-1 transition-all duration-200 group/item"
                        >
                          <div className="w-5 h-3.5 rounded-none overflow-hidden flex items-center justify-center bg-neutral-50 border border-neutral-100 shrink-0">
                            <img 
                              src={`https://flagcdn.com/w40/${team.code}.png`} 
                              alt={team.name} 
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-200" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="truncate">{team.name}</span>
                        </Link>
                      ))}
                      {cat.teams.length > 10 && (
                        <Link href="/shop" className="text-[9px] font-black uppercase text-neutral-400 hover:text-[#6B00FF] mt-1 flex items-center gap-0.5">
                          + {cat.teams.length - 10} More <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* A-Z National Teams Card */}
                <Link href="/shop" className="relative overflow-hidden rounded-none aspect-square bg-neutral-50 border border-neutral-200 group/card cursor-pointer flex flex-col justify-between p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,0,255,0.06),transparent)]" />
                  <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest relative z-10">A-Z National Teams</div>
                  <div className="relative z-10 my-auto text-center">
                    <span className="text-3xl font-black text-neutral-900 tracking-tighter uppercase block">A <span className="text-kora">TO</span> Z</span>
                  </div>
                  <div className="text-[9px] font-bold text-neutral-600 group-hover/card:text-kora transition-colors flex items-center gap-1 relative z-10">
                    Browse All <span>→</span>
                  </div>
                </Link>

              </div>
            </div>

            <Link href="/shop?category=Accessories" className="hover:text-[#6B00FF] transition-colors">Accessories</Link>
            <Link href="/shop?category=Retro Kits" className="hover:text-[#6B00FF] transition-colors">Retro</Link>
          </div>
        </div>
      </header>



      {/* Slide-over backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Slide-over panel */}
      <div 
        className={`fixed top-0 bottom-0 left-0 w-[300px] max-w-[85vw] bg-white z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex justify-end items-center bg-white shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-800 focus:outline-none"
            aria-label="Close menu"
          >
            <FaXmark className="text-xl" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Shop / Latest */}
          <Link 
            href="/shop" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="px-6 py-5 border-b border-neutral-200 text-slate-900 font-display font-extrabold text-base hover:bg-neutral-50 flex items-center justify-between transition-colors"
          >
            Shop
          </Link>
          
          {/* World Cup */}
          <Link 
            href="/shop?category=World Cup" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="px-6 py-5 border-b border-neutral-200 text-slate-900 font-display font-extrabold text-base hover:bg-neutral-50 flex items-center justify-between transition-colors"
          >
            World Cup
          </Link>

          {/* Club Accordion */}
          <div className="border-b border-neutral-200">
            <button 
              onClick={() => setIsMobileClubsOpen(!isMobileClubsOpen)} 
              className="w-full px-6 py-5 text-left text-slate-900 font-display font-extrabold text-base hover:bg-neutral-50 flex justify-between items-center transition-colors"
            >
              <span>Club</span>
              {isMobileClubsOpen ? (
                <FiChevronDown className="text-sm text-neutral-500 rotate-180 transition-transform duration-200" />
              ) : (
                <FiChevronDown className="text-sm text-neutral-500 transition-transform duration-200" />
              )}
            </button>
            {isMobileClubsOpen && (
              <div className="bg-white">
                {clubCategories.map((cat, i) => {
                  const isExpanded = activeMobileClubCategory === cat.title;
                  return (
                    <div key={i} className="border-b border-neutral-100 last:border-0">
                      <button
                        onClick={() => setActiveMobileClubCategory(isExpanded ? null : cat.title)}
                        className={`w-full px-8 py-3.5 text-left text-xs font-bold uppercase tracking-wider flex justify-between items-center transition-colors ${
                          isExpanded ? "bg-neutral-50 text-kora" : "bg-white text-neutral-700"
                        }`}
                      >
                        <span>{cat.title}</span>
                        {isExpanded ? (
                          <FiChevronDown className="text-xs text-neutral-400 rotate-180 transition-transform duration-200" />
                        ) : (
                          <FiChevronDown className="text-xs text-neutral-400 transition-transform duration-200" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="bg-neutral-50/80 py-2 border-t border-neutral-100/50">
                          {cat.teams.map((team, idx) => (
                            <Link
                              key={idx}
                              href={`/shop?team=${team.name}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="px-12 py-2.5 flex items-center gap-3 text-xs font-bold text-neutral-700 hover:text-kora transition-colors"
                            >
                              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-white border border-neutral-100 shrink-0">
                                <img src={team.logo} alt="" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <span className="truncate">{team.name}</span>
                            </Link>
                          ))}
                          <Link
                            href="/shop"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="px-12 py-2 flex items-center gap-1 text-[10px] font-black uppercase text-neutral-400 hover:text-kora"
                          >
                            View All <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* National Accordion */}
          <div className="border-b border-neutral-200">
            <button 
              onClick={() => setIsMobileNationalOpen(!isMobileNationalOpen)} 
              className="w-full px-6 py-5 text-left text-slate-900 font-display font-extrabold text-base hover:bg-neutral-50 flex justify-between items-center transition-colors"
            >
              <span>National</span>
              {isMobileNationalOpen ? (
                <FiChevronDown className="text-sm text-neutral-500 rotate-180 transition-transform duration-200" />
              ) : (
                <FiChevronDown className="text-sm text-neutral-500 transition-transform duration-200" />
              )}
            </button>
            {isMobileNationalOpen && (
              <div className="bg-white">
                {nationalCategories.map((cat, i) => {
                  const isExpanded = activeMobileNationalCategory === cat.title;
                  return (
                    <div key={i} className="border-b border-neutral-100 last:border-0">
                      <button
                        onClick={() => setActiveMobileNationalCategory(isExpanded ? null : cat.title)}
                        className={`w-full px-8 py-3.5 text-left text-xs font-bold uppercase tracking-wider flex justify-between items-center transition-colors ${
                          isExpanded ? "bg-neutral-50 text-kora" : "bg-white text-neutral-700"
                        }`}
                      >
                        <span>{cat.title}</span>
                        {isExpanded ? (
                          <FiChevronDown className="text-xs text-neutral-400 rotate-180 transition-transform duration-200" />
                        ) : (
                          <FiChevronDown className="text-xs text-neutral-400 transition-transform duration-200" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="bg-neutral-50/80 py-2 border-t border-neutral-100/50">
                          {cat.teams.slice(0, 10).map((team, idx) => (
                            <Link
                              key={idx}
                              href={`/shop?team=${team.name}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="px-12 py-2.5 flex items-center gap-3 text-xs font-bold text-neutral-700 hover:text-kora transition-colors"
                            >
                              <div className="w-5 h-3.5 rounded-none overflow-hidden flex items-center justify-center bg-white border border-neutral-100 shrink-0">
                                <img src={`https://flagcdn.com/w40/${team.code}.png`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="truncate">{team.name}</span>
                            </Link>
                          ))}
                          <Link
                            href="/shop"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="px-12 py-2 flex items-center gap-1 text-[10px] font-black uppercase text-neutral-400 hover:text-kora"
                          >
                            View All <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accessories */}
          <Link 
            href="/shop?category=Accessories" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="px-6 py-5 border-b border-neutral-200 text-slate-900 font-display font-extrabold text-base hover:bg-neutral-50 flex items-center justify-between transition-colors"
          >
            Accessories
          </Link>

          {/* Retro */}
          <Link 
            href="/shop?category=Retro Kits" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="px-6 py-5 border-b border-neutral-200 text-slate-900 font-display font-extrabold text-base hover:bg-neutral-50 flex items-center justify-between transition-colors"
          >
            Retro
          </Link>
        </div>

      </div>
    </>
  );
}