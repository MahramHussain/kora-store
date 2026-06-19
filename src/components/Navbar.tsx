"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/app/admin/actions";
import { FaBars, FaXmark, FaBoxOpen } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
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
      <div className="hidden md:flex justify-end items-center px-6 py-2 text-xs font-medium bg-slate-50 text-slate-600 border-b border-slate-200">
        <div className="flex gap-6 items-center">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-kora font-bold hover:text-purple-700 transition-colors">
                Sign In / Register
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <Link href="/account/dashboard" className="text-slate-600 hover:text-kora transition-colors">
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
      <header className="px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        
        {/* 1. Hamburger & Logo (Left Side) */}
        <div className="flex items-center gap-4 order-1 shrink-0">
          <button 
            className="md:hidden text-slate-900 text-2xl hover:text-kora transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaXmark /> : <FaBars />}
          </button>

          <Link href="/" className="text-3xl font-black tracking-tighter uppercase hover:scale-105 transition-transform">
            <span className="text-slate-900">KORA</span><span className="text-kora drop-shadow-[0_0_10px_rgba(107,0,255,0.4)]">STORE</span>
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
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-3 pl-6 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-all relative z-20 font-sans"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-kora transition-colors z-20 hover:scale-110">
                &#128269;
              </button>
            </form>

            {isFocused && searchTerm && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-10 pt-2 pb-2">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    onClick={(e) => handleSearch(e as any, suggestion)}
                    className="px-6 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 hover:text-kora transition-colors flex items-center gap-3 font-sans"
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
          <Link href="/cart" className="bg-kora hover:bg-purple-700 text-white font-bold text-sm md:text-base py-2 md:py-3 px-4 md:px-6 rounded-full flex items-center gap-2 transition-all hover:scale-105 shadow-md shadow-kora/30">
            <FaShoppingCart className="text-lg md:text-xl" />
            <span className="bg-white text-kora px-2 py-0.5 rounded-full text-xs shadow-inner pt-0.5 ml-1">{cartCount}</span>
          </Link>
        </div>

        {/* --- MOBILE SLIDE-DOWN MENU --- */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 flex flex-col md:hidden z-40 shadow-xl animate-fade-in-up">
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 border-b border-slate-100 text-slate-900 font-bold hover:bg-slate-50 flex items-center justify-between">
              Shop The Vault <span className="text-kora">→</span>
            </Link>
            <Link href="/shop?tag=Trending" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 border-b border-slate-100 text-slate-900 font-bold hover:bg-slate-50">
              Trending Gear
            </Link>
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between font-bold">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-kora hover:text-purple-700">
                    Sign In / Register
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <Link href="/account/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-kora hover:text-purple-700">
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