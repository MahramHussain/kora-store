"use client";

import { useState } from "react";
import Link from "next/link";
import { CURRENCY } from "@/lib/constants";
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
    const numericPrice = parseFloat(item.price.replace(CURRENCY.trim(), '').replace('$', ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  const shippingCharge = subtotal > 200 ? 0 : 25;

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
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-20 pb-16 px-4 sm:px-6 md:pt-24 md:pb-24">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase font-sans">
          YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">VAULT.</span>
        </h1>

        {cart.length === 0 ? (
          // EMPTY CART STATE
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 font-sans">Your vault is completely empty.</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto font-sans">You haven't secured any gear yet. Head back to the shop to browse the latest drops.</p>
            <Link href="/shop" className="inline-block bg-kora hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-md shadow-kora/30 text-sm">
              Explore The Vault
            </Link>
          </div>
        ) : (
          // ACTIVE CART STATE
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Cart Items List */}
            <div className="flex-1 space-y-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 sm:gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 relative group shadow-sm hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white border border-slate-100 rounded-xl p-2 flex items-center justify-center shadow-sm">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-center py-1 sm:py-2 font-sans pr-6">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-lg leading-tight line-clamp-2">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-y-1">
                      <span>Size: <span className="font-bold text-slate-900">{item.size}</span></span>
                      {(item.customName || item.customNumber) && (
                        <>
                          <span className="mx-1 sm:mx-2 text-slate-300">•</span>
                          <span>Print: <span className="font-bold text-kora">{item.customName || "—"} {item.customNumber ? `#${item.customNumber}` : ""}</span></span>
                        </>
                      )}
                      {item.patch && (
                        <>
                          <span className="mx-1 sm:mx-2 text-slate-300">•</span>
                          <span>Patch: <span className="font-bold text-indigo-600">{item.patch}</span></span>
                        </>
                      )}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-kora mt-1">{item.price}</p>
                    
                    {/* CART QUANTITY ADJUSTER */}
                    <div className="flex items-center gap-3 mt-3 bg-white w-max rounded-full p-1 border border-slate-200 shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.image, item.customName, item.customNumber, item.quantity - 1)} 
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        −
                      </button>
                      <span className="font-bold text-slate-900 text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.image, item.customName, item.customNumber, item.quantity + 1)} 
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id, item.size, item.image, item.customName, item.customNumber)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-400 hover:text-rose-600 transition-colors p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* Right: Checkout Summary */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-8 sticky top-32 transition-all duration-500 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4 uppercase font-sans">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-slate-600 font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold">{CURRENCY}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UAE Local Delivery</span>
                    <span className="text-slate-900 font-bold">
                      {shippingCharge === 0 ? "FREE" : `${CURRENCY}25.00`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-6 mb-8 font-sans">
                  <span className="font-bold text-slate-900 uppercase">Total</span>
                  <span className="text-3xl font-bold text-slate-900">{CURRENCY}{(subtotal + shippingCharge).toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-slate-900 text-white hover:bg-kora font-bold text-sm uppercase tracking-wider py-4 rounded-full transition-all flex justify-center items-center gap-3 group shadow-md hover:shadow-kora/30 hover:scale-105"
                >
                  SECURE CHECKOUT <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-xs text-slate-500 mt-6 font-sans">Taxes calculated at checkout. All UAE orders delivered within 48 hours.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}