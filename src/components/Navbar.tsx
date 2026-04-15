"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/app/admin/actions";
import { FaBars, FaXmark, FaBoxOpen } from "react-icons/fa6"; 
import { SignInButton, UserButton, Show } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    getProducts().then(products => {
      setSuggestions(products.map(p => p.name));
    });
  }, []);

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
    }
  };

  return (
    <>
      {/* TOP UTILITY BAR (Desktop Only) */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 text-xs font-medium bg-[#0a0514] text-slate-300 border-b border-white/5">
        <div className="flex gap-2">
          <span className="text-slate-400">Shipping to: UAE</span>
          <button className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Change</button>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/faq" className="hover:text-white transition-colors">Help</Link>
          
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Sign In / Register
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <Link href="/account/dashboard" className="text-slate-400 hover:text-purple-400 transition-colors">
                Vault Access
              </Link>
              
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Vault Dashboard"
                    labelIcon={<FaBoxOpen className="text-sm" />}
                    href="/account/dashboard"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </Show>
        </div>
      </div>

      {/* MAIN HEADER - Fixed Layout */}
      <header className="px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 border-b border-white/5 bg-[#05010F] sticky top-0 z-50 shadow-md">
        
        {/* 1. Hamburger & Logo (Left Side) */}
        <div className="flex items-center gap-4 order-1 shrink-0">
          <button 
            className="md:hidden text-white text-2xl hover:text-purple-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaXmark /> : <FaBars />}
          </button>

          <Link href="/" className="text-3xl font-black tracking-tighter uppercase">
            <span className="text-white">KORA</span><span className="text-purple-500">STORE</span>
          </Link>
        </div>
        
        {/* 2. SEARCH BAR (Center Desktop, Bottom Mobile) */}
        {pathname !== '/shop' ? (
          <div className="w-full md:flex-1 md:max-w-2xl relative order-3 md:order-2 md:mx-4" ref={dropdownRef}>
            <form onSubmit={(e) => handleSearch(e)} className="relative group z-20">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="What can we help you find?" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-6 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all relative z-20"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors z-20">
                &#128269;
              </button>
            </form>

            {isFocused && searchTerm && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0514] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 pt-2 pb-2">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    onClick={(e) => handleSearch(e as any, suggestion)}
                    className="px-6 py-3 hover:bg-white/5 cursor-pointer text-slate-300 hover:text-purple-400 transition-colors flex items-center gap-3"
                  >
                    <span className="text-xs">&#128269;</span> {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:block w-full md:flex-1 md:max-w-2xl order-3 md:order-2 md:mx-4"></div>
        )}

        {/* 3. Cart Button (Right Side) */}
        <div className="flex items-center order-2 md:order-3 shrink-0">
          <Link href="/cart" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-white text-purple-700 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
          </Link>
        </div>

        {/* --- MOBILE SLIDE-DOWN MENU --- */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#0a0514] border-b border-white/10 flex flex-col md:hidden z-40 shadow-2xl animate-fade-in-up">
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 border-b border-white/5 text-white font-bold hover:bg-white/5 flex items-center justify-between">
              Shop The Vault <span className="text-purple-500">→</span>
            </Link>
            <Link href="/shop?tag=Trending" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 border-b border-white/5 text-white font-bold hover:bg-white/5">
              Trending Gear
            </Link>
            
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-purple-400 font-bold hover:text-purple-300">
                    Sign In / Register
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <Link href="/account/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-400 font-bold hover:text-purple-300">
                    My Account
                  </Link>
                  
                  <UserButton>
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="Vault Dashboard"
                        labelIcon={<FaBoxOpen className="text-sm" />}
                        href="/account/dashboard"
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </Show>
            </div>
            
          </div>
        )}
      </header>
    </>
  );
}