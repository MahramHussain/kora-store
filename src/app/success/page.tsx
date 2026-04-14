"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaCopy, FaBoxOpen, FaArrowRight } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa"; // <-- Grabbed from the classic 'fa' library!
import confetti from "canvas-confetti"; // Optional: We won't install this to keep it simple, but we'll simulate the vibe visually!

export default function SuccessPage() {
  const [copied, setCopied] = useState(false);
  const trackingNumber = "KORA-TRK-9827345";

  // Fire a little confetti effect on load (using standard DOM elements to avoid needing npm installs)
  useEffect(() => {
    // Just a clean fade-in effect happens via Tailwind classes below
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Celebration Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-2xl w-full relative z-10 flex flex-col items-center text-center animate-fade-in-up">
        
        {/* Success Icon */}
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
          <FaCheckCircle className="text-6xl text-emerald-400 relative z-10" />
        </div>

        {/* Headlines */}
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
          Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Secured.</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-lg">
          Your gear is officially locked in. We are prepping your items for priority shipping to the UAE.
        </p>

        {/* The Tracking Card */}
        <div className="w-full bg-[#0a0514] border border-white/10 rounded-3xl p-8 shadow-2xl mb-10 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <FaBoxOpen className="text-2xl text-purple-400" />
            <h2 className="text-xl font-bold text-white">Transmission Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Number</p>
              <p className="text-lg font-black text-white">#VAULT-8829</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Est. Delivery</p>
              <p className="text-lg font-black text-white">Tomorrow, 10:00 AM</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tracking Number</p>
              
              {/* Copy-to-Clipboard Interactive Element */}
              <div 
                onClick={handleCopy}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors group"
              >
                <span className="font-mono text-purple-400 font-bold tracking-widest text-lg">{trackingNumber}</span>
                <button className={`flex items-center gap-2 text-sm font-bold transition-colors ${copied ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`}>
                  {copied ? "Copied!" : <><FaCopy /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link href="/account/dashboard" className="flex-1 sm:flex-none bg-white text-black hover:bg-purple-500 hover:text-white font-black uppercase tracking-widest py-4 px-8 rounded-full transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-105">
            View Dashboard
          </Link>
          <Link href="/shop" className="flex-1 sm:flex-none bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 px-8 rounded-full transition-all flex justify-center items-center gap-3">
            Back to Vault <FaArrowRight />
          </Link>
        </div>

      </div>
    </main>
  );
}