"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { FaLock, FaCreditCard, FaPaypal, FaApple } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa"; 

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // --- PREMIUM CARD FORMATTING STATE ---
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip all non-numbers, then add a space every 4 digits. Max 19 chars (16 digits + 3 spaces)
    const rawText = e.target.value.replace(/\D/g, "");
    const formatted = rawText.match(/.{1,4}/g)?.join(" ") || rawText;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip all non-numbers. Automatically insert the slash after the second digit. Max 5 chars.
    const rawText = e.target.value.replace(/\D/g, "");
    if (rawText.length >= 3) {
      setExpiryDate(`${rawText.substring(0, 2)}/${rawText.substring(2, 4)}`);
    } else {
      setExpiryDate(rawText);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip all non-numbers. Standard CVCs are 3 digits, Amex is 4. Max 4 chars.
    setCvc(e.target.value.replace(/\D/g, "").substring(0, 4));
  };

  // --- MATH & LOGIC ---
  const subtotal = cart.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace('$', ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  if (cartCount === 0 && !isProcessing) {
    router.push("/cart");
    return null;
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      router.push("/success");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
          <FaLock className="text-2xl text-purple-500" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">SECURE CHECKOUT</h1>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-12">
          
          {/* --- LEFT SIDE: THE FORMS --- */}
          <div className="flex-1 space-y-10">
            
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-10">
              
              {/* Shipping Information (Email Removed!) */}
              <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">First Name</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Last Name</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" placeholder="Last Name" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Street Address</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" placeholder="Villa/Apartment, Street Name" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">City</label>
                    <select required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                      <option className="bg-[#0a0514]">Dubai</option>
                      <option className="bg-[#0a0514]">Abu Dhabi</option>
                      <option className="bg-[#0a0514]">Sharjah</option>
                      <option className="bg-[#0a0514]">Fujairah</option>
                      <option className="bg-[#0a0514]">Ajman</option>
                      <option className="bg-[#0a0514]">Ras Al Khaimah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" placeholder="+971 50 000 0000" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
                
                {/* Payment Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-purple-600/20 border border-purple-500 rounded-xl py-3 flex justify-center items-center gap-2 text-purple-400 cursor-pointer transition-colors">
                    <FaCreditCard /> Card
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl py-3 flex justify-center items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-not-allowed opacity-50">
                    <FaApple /> Apple Pay
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl py-3 flex justify-center items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-not-allowed opacity-50">
                    <FaPaypal /> PayPal
                  </div>
                </div>

                {/* Highly Interactive Card Input */}
                <div className="space-y-4 relative">
                  <div className="absolute -top-3 right-0 flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-bold tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full z-10">
                    <FaShieldAlt /> 256-Bit Encrypted
                  </div>

                  <div className="relative">
                    <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      required 
                      placeholder="0000 0000 0000 0000" 
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-wider" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      required 
                      placeholder="MM/YY" 
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-wider" 
                    />
                    <input 
                      type="text" 
                      required 
                      placeholder="CVC" 
                      value={cvc}
                      onChange={handleCvcChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-wider" 
                    />
                  </div>
                  <input type="text" required placeholder="Name on Card" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
              </div>
            </form>
          </div>

          {/* --- RIGHT SIDE: ORDER SUMMARY --- */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-6 md:p-8 sticky top-32 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">In Your Vault</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 bg-white/5 rounded-lg p-2">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-white text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-400">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-purple-400 text-sm flex items-center">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-slate-400 text-sm border-t border-white/10 pt-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping (UAE Priority)</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes</span>
                  <span className="text-white">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-6 mb-8">
                <span className="font-bold text-white text-lg">Total</span>
                <span className="text-4xl font-black text-white">${subtotal.toFixed(2)}</span>
              </div>

              <button 
                form="checkout-form"
                type="submit"
                disabled={isProcessing}
                className={`w-full font-black uppercase tracking-widest py-4 rounded-full transition-all flex justify-center items-center gap-3 shadow-lg ${
                  isProcessing 
                    ? "bg-purple-800 text-purple-300 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-500 text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                    Securing Order...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </button>
              
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}