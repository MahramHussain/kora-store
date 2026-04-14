"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { FaTrash, FaArrowRight, FaLock } from "react-icons/fa6";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // The state to open the fake card form
  const [showCardForm, setShowCardForm] = useState(false);

  // Smart Math: Convert string prices like "$120" into numbers to calculate the total
  const subtotal = cart.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace('$', ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  // --- THE GHOST CHECKOUT ENGINE ---
  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          cartTotal: subtotal
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Please log in to the Vault to secure your gear.");
          router.push("/account"); 
          return;
        }
        throw new Error("Checkout failed");
      }

      // ---> ROUTED TO YOUR MASTERPIECE SUCCESS PAGE <---
      router.push("/success");
      
    } catch (error) {
      console.error(error);
      alert("Something went wrong processing your order.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter">
          YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-500">VAULT.</span>
        </h1>

        {cart.length === 0 ? (
          // EMPTY CART STATE
          <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-16 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Your vault is completely empty.</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">You haven't secured any gear yet. Head back to the shop to browse the latest drops.</p>
            <Link href="/shop" className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-full transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              Explore The Vault
            </Link>
          </div>
        ) : (
          // ACTIVE CART STATE
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Cart Items List */}
            <div className="flex-1 space-y-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex gap-6 bg-[#0a0514] border border-white/10 rounded-2xl p-4 relative group">
                  {/* Image */}
                  <div className="w-24 h-24 shrink-0 bg-white/5 rounded-xl p-2 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-center py-2">
                    <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">Size: <span className="font-bold text-white">{item.size}</span></p>
                    <p className="font-black text-purple-400 mt-1">{item.price}</p>
                    
                    {/* CART QUANTITY ADJUSTER */}
                    <div className="flex items-center gap-3 mt-3 bg-white/5 w-max rounded-full p-1 border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} 
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        −
                      </button>
                      <span className="font-bold text-white text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} 
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 transition-colors p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Right: Checkout Summary */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-8 sticky top-32 transition-all duration-500">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UAE Local Delivery</span>
                    <span className="text-emerald-400">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-6 mb-8">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-3xl font-black text-white">${subtotal.toFixed(2)}</span>
                </div>

                {/* THE NEW DYNAMIC PAYMENT SECTION */}
                {!showCardForm ? (
                  // Your original flawlessly styled button, repurposed as the trigger
                  <button 
                    onClick={() => setShowCardForm(true)}
                    className="w-full bg-white text-black hover:bg-purple-500 hover:text-white font-black uppercase tracking-widest py-4 rounded-full transition-all flex justify-center items-center gap-3 group shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                  >
                    Proceed to Payment <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  // The Card Form using your exact aesthetic (bg-white/5, borders, etc.)
                  <div className="border-t border-white/10 pt-6 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4">
                      <FaLock className="text-emerald-500 text-sm" />
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Secure Payment</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000" 
                          maxLength={19}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none font-mono text-sm transition-colors focus:bg-white/10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Expiry</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            maxLength={5}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none font-mono text-sm transition-colors focus:bg-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">CVC</label>
                          <input 
                            type="text" 
                            placeholder="123" 
                            maxLength={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none font-mono text-sm transition-colors focus:bg-white/10"
                          />
                        </div>
                      </div>

                      {/* The Final Submit Button */}
                      <button 
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-full transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingOut ? "Authorizing..." : `Pay $${subtotal.toFixed(2)}`}
                      </button>

                      <button 
                        onClick={() => setShowCardForm(false)}
                        className="w-full text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-center text-xs text-slate-500 mt-6">Taxes calculated at checkout. All UAE orders ship within 24 hours.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}