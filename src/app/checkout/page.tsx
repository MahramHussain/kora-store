"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CURRENCY } from "@/lib/constants";
import { useAuth, SignIn, SignUp } from "@clerk/nextjs";
import { FaLock, FaCreditCard, FaPaypal, FaMoneyBillWave } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa"; 

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "cod">("card");
  
  // Auth state from Clerk
  const { isSignedIn, isLoaded } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Shipping details state
  const [shippingFirstName, setShippingFirstName] = useState("");
  const [shippingLastName, setShippingLastName] = useState("");
  const [shippingStreetAddress, setShippingStreetAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("Dubai");
  const [shippingPhone, setShippingPhone] = useState("");

  // Error Banner State
  const [error, setError] = useState("");

  // Promo State
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // --- PREMIUM CARD FORMATTING STATE ---
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");

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
    const numericPrice = parseFloat(item.price.replace(CURRENCY.trim(), '').replace('$', ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "KORA20") {
      setDiscountPercent(0.20);
      setPromoMessage("20% Off Applied!");
    } else {
      setDiscountPercent(0);
      setPromoMessage("Invalid promo code.");
    }
  };

  const discountAmount = subtotal * discountPercent;
  const shippingCharge = discountPercent > 0 ? 0 : 10;
  const finalTotal = subtotal - discountAmount + shippingCharge;

  // Render Vault Sign-in Wall if not authenticated
  if (isLoaded && !isSignedIn) {
    return (
      <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase font-sans">
              SECURE <span className="text-purple-500">VAULT.</span>
            </h1>
            <p className="text-slate-400 font-medium">
              {isLogin ? "Authenticate to secure your priority checkout." : "Register to join the ultimate football community."}
            </p>
          </div>

          <div className="bg-[#0a0514] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex justify-center min-h-[400px]">
            {isLogin ? (
              <SignIn fallbackRedirectUrl="/checkout" appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0 m-0",
                  header: "hidden", 
                  footer: "hidden", 
                  formButtonPrimary: "bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all",
                  formFieldInput: "bg-white/5 border border-white/10 text-white py-3 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                  formFieldLabel: "text-slate-400 font-bold",
                  dividerText: "text-slate-500 font-bold uppercase tracking-wider",
                  socialButtonsBlockButton: "border border-white/10 text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-all",
                  socialButtonsBlockButtonText: "font-bold",
                  identityPreviewText: "text-purple-400",
                  identityPreviewEditButton: "text-slate-400 hover:text-white"
                }
              }} />
            ) : (
              <SignUp fallbackRedirectUrl="/checkout" appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0 m-0",
                  header: "hidden",
                  footer: "hidden",
                  formButtonPrimary: "bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all",
                  formFieldInput: "bg-white/5 border border-white/10 text-white py-3 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                  formFieldLabel: "text-slate-400 font-bold",
                  dividerText: "text-slate-500 font-bold uppercase tracking-wider",
                  socialButtonsBlockButton: "border border-white/10 text-white hover:bg-white/5 py-3 rounded-xl font-bold transition-all",
                  socialButtonsBlockButtonText: "font-bold",
                }
              }} />
            )}
          </div>

          <div className="text-center mt-8 relative z-10 font-sans">
            <p className="text-slate-400">
              {isLogin ? "Need a Vault account?" : "Already secured your spot?"}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-white font-bold hover:text-purple-400 transition-colors underline underline-offset-4"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

        </div>
      </main>
    );
  }

  // Redirect to cart if empty
  if (cartCount === 0 && !isProcessing) {
    router.push("/cart");
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "paypal") {
      alert("PayPal integration is a work in progress and not yet implemented.");
      return;
    }
    
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          cartTotal: finalTotal,
          shippingDetails: {
            firstName: shippingFirstName,
            lastName: shippingLastName,
            streetAddress: shippingStreetAddress,
            city: shippingCity,
            phone: shippingPhone
          },
          paymentMethod: paymentMethod,
          promoCode: promoCode || null,
          discountAmount: discountAmount,
          shippingFee: shippingCharge,
          tax: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Checkout failed. Please inspect your cart.");
      }

      const orderData = await response.json();
      
      // Wipe the local cart state
      clearCart();

      // Redirect to success page with dynamic ref code
      router.push(`/success?ref=${orderData.referenceNumber}`);
    } catch (err: any) {
      console.error("[CHECKOUT_SUBMIT_ERROR]", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsProcessing(false);
      
      // Smoothly scroll to the top of the form so the error banner is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-slate-200 pb-6">
          <FaLock className="text-2xl text-kora" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">SECURE CHECKOUT</h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 animate-fade-in shadow-sm font-sans">
            <div className="text-xl">⚠️</div>
            <div className="flex-1 text-sm font-bold uppercase tracking-wide">
              {error}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse lg:flex-row gap-12">
          
          {/* --- LEFT SIDE: THE FORMS --- */}
          <div className="flex-1 space-y-10">
            
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-10">
              
              {/* 1. Payment Method (Moved to Top) */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Payment Method</h2>
                
                {/* Payment Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div 
                    onClick={() => setPaymentMethod("card")}
                    className={`border rounded-xl py-3 flex justify-center items-center gap-2 cursor-pointer transition-colors font-sans ${
                      paymentMethod === "card" ? "bg-kora/10 border-kora text-kora font-bold" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <FaCreditCard /> Card
                  </div>
                  <div 
                    onClick={() => setPaymentMethod("paypal")}
                    className={`border rounded-xl py-3 flex justify-center items-center gap-2 cursor-pointer transition-colors font-sans ${
                      paymentMethod === "paypal" ? "bg-kora/10 border-kora text-kora font-bold" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <FaPaypal /> PayPal
                  </div>
                  <div 
                    onClick={() => setPaymentMethod("cod")}
                    className={`border rounded-xl py-3 flex justify-center items-center gap-2 cursor-pointer transition-colors font-sans ${
                      paymentMethod === "cod" ? "bg-kora/10 border-kora text-kora font-bold" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <FaMoneyBillWave /> COD
                  </div>
                </div>

                {/* Conditional Payment UI */}
                {paymentMethod === "card" && (
                  <div className="space-y-4 relative animate-fade-in-up">
                    <div className="absolute -top-3 right-0 flex items-center gap-1 text-[10px] text-emerald-400 uppercase font-bold tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full z-10">
                      <FaShieldAlt /> 256-Bit Encrypted
                    </div>
                    <div className="relative">
                      <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9\s]{13,19}"
                        maxLength={19}
                        required 
                        placeholder="0000 0000 0000 0000" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors font-mono tracking-wider shadow-sm" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={5}
                        required 
                        placeholder="MM/YY" 
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors font-mono tracking-wider shadow-sm" 
                      />
                      <input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={4}
                        required 
                        placeholder="CVC" 
                        value={cvc}
                        onChange={handleCvcChange}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors font-mono tracking-wider shadow-sm" 
                      />
                    </div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Name on Card" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                    />
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="text-center py-6 border border-dashed border-white/20 rounded-xl bg-white/5 animate-fade-in-up">
                    <FaPaypal className="text-4xl text-slate-600 mx-auto mb-3" />
                    <h3 className="text-white font-bold mb-1">Work in Progress</h3>
                    <p className="text-slate-400 text-sm">PayPal integration is currently under development. Please choose another method.</p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="text-center py-6 border border-white/10 rounded-xl bg-[#05010F]/5 rounded-2xl animate-fade-in-up">
                    <FaMoneyBillWave className="text-4xl text-emerald-500/50 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-bold mb-1 uppercase">Cash on Delivery</h3>
                    <p className="text-slate-500 text-sm">Pay seamlessly with cash when your secure drop arrives at your location.</p>
                  </div>
                )}
              </div>

              {/* 2. Shipping Information (Moved to Bottom) */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">Shipping Location & Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">First Name</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingFirstName}
                      onChange={(e) => setShippingFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder="First Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingLastName}
                      onChange={(e) => setShippingLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder="Last Name" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingStreetAddress}
                      onChange={(e) => setShippingStreetAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder="Villa/Apartment, Street Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">City / Location</label>
                    <select 
                      required 
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors appearance-none shadow-sm cursor-pointer"
                    >
                      <option className="bg-white">Dubai</option>
                      <option className="bg-white">Abu Dhabi</option>
                      <option className="bg-white">Sharjah</option>
                      <option className="bg-white">Fujairah</option>
                      <option className="bg-white">Ajman</option>
                      <option className="bg-white">Ras Al Khaimah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder="+971 50 000 0000" 
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* --- RIGHT SIDE: ORDER SUMMARY --- */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 sticky top-32 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4 uppercase tracking-wider">In Your Vault</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-500">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-kora text-sm flex items-center">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-slate-600 text-sm border-t border-slate-200 pt-6">
                
                {/* PROMO CODE FIELD */}
                <div className="flex gap-2 mb-4 relative">
                  <input 
                    type="text" 
                    placeholder="Enter Promo Code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora uppercase transition-colors shadow-sm"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    type="button"
                    className="bg-kora hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors shadow-md shadow-kora/30"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${discountPercent > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {promoMessage}
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">{CURRENCY}{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount (20%)</span>
                    <span className="font-bold">-{CURRENCY}{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping (UAE Priority)</span>
                  <span className={shippingCharge === 0 ? "text-emerald-600 font-bold" : "text-slate-900 font-bold"}>
                    {shippingCharge === 0 ? "FREE" : `${CURRENCY}10.00`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes</span>
                  <span className="text-slate-900 font-bold">{CURRENCY}0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-6 mb-8">
                <span className="font-bold text-slate-900 text-lg uppercase tracking-wider">Total</span>
                <span className="text-4xl font-black text-slate-900 font-sans">{CURRENCY}{finalTotal.toFixed(2)}</span>
              </div>

              <button 
                form="checkout-form"
                type="submit"
                disabled={isProcessing}
                className={`w-full font-bold text-sm uppercase tracking-widest py-4 rounded-full transition-all flex justify-center items-center gap-3 shadow-lg ${
                  isProcessing 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : "bg-kora hover:bg-purple-700 text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(107,0,255,0.4)]"
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