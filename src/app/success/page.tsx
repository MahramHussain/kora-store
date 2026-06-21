"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCopy, FaBoxOpen, FaArrowRight } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa"; 

function SuccessContent() {
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  
  // Extract reference number from URL parameters
  const rawRef = searchParams.get("ref");
  const referenceNumber = rawRef ? `#${rawRef.toUpperCase()}` : "#VAULT-8829";
  const trackingNumber = rawRef ? `KORA-TRK-${rawRef.split('-')[1] || '9827345'}` : "KORA-TRK-9827345";

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-kora selection:text-white pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Celebration Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kora/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
 
      <div className="max-w-2xl w-full relative z-10 flex flex-col items-center text-center animate-fade-in-up">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full animate-ping"></div>
          <FaCheckCircle className="text-5xl text-emerald-500 relative z-10" />
        </div>
 
        {/* Headlines */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
          Order <span className="text-kora">Secured.</span>
        </h1>
        <p className="text-slate-500 font-medium mb-10 max-w-lg font-sans">
          Your gear is officially locked in. We are prepping your items for priority shipping to the UAE.
        </p>
 
        {/* The Tracking Card */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl mb-10 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-kora/5 rounded-bl-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <FaBoxOpen className="text-xl text-kora" />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Transmission Details</h2>
          </div>
 
          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Order Reference</p>
              <p className="text-lg font-black text-slate-900">{referenceNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tracking Number</p>
              
              {/* Copy-to-Clipboard Interactive Element */}
              <div 
                onClick={handleCopy}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100/50 transition-colors group"
              >
                <span className="font-mono text-kora font-bold tracking-widest text-lg">{trackingNumber}</span>
                <button className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${copied ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`}>
                  {copied ? "Copied!" : <><FaCopy /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </div>
 
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link href="/account/dashboard" className="flex-1 sm:flex-none bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-4 px-8 rounded-full transition-all flex justify-center items-center gap-3 shadow-md shadow-kora/20">
            View Dashboard
          </Link>
          <Link href="/shop" className="flex-1 sm:flex-none bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold uppercase tracking-widest py-4 px-8 rounded-full transition-all flex justify-center items-center gap-3">
            Back to Vault <FaArrowRight />
          </Link>
        </div>
 
      </div>
    </main>
  );
}
 
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="text-center font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading Transmission Details...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}