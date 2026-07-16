"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CURRENCY, isCustomJersey } from "@/lib/constants";
import { useAuth, useUser, SignIn, SignUp } from "@clerk/nextjs";
import { FaLock, FaCreditCard, FaPaypal, FaMoneyBillWave } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useTranslation } from "@/context/LanguageContext";

function MapPickerLoading() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-48 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold uppercase text-slate-400 tracking-wider">
      {t("loading_map")}
    </div>
  );
}

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <MapPickerLoading />
});

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, clearCart } = useCart();
  const { t } = useTranslation();
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const isUserAdmin = userEmail === "mahramh40@gmail.com" || userEmail === "korastore.ae@gmail.com";

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "cod">("card");
  const [bypassPayment, setBypassPayment] = useState(false);
  const [globalSellerNote, setGlobalSellerNote] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const hasPersonalizedItem = cart.some(
    (item) => isCustomJersey(item)
  );

  useEffect(() => {
    if (hasPersonalizedItem && paymentMethod === "cod") {
      setPaymentMethod("card");
    }
  }, [hasPersonalizedItem, paymentMethod]);
  
  // Auth state from Clerk
  const { isSignedIn, isLoaded } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(dbUser => {
          if (dbUser) {
            const isBanned = dbUser.isBanned || (dbUser.bannedUntil && new Date() < new Date(dbUser.bannedUntil));
            const isShadowBanned = dbUser.isShadowBanned && (!dbUser.shadowBanExpiresAt || new Date() < new Date(dbUser.shadowBanExpiresAt));
            if (isBanned || isShadowBanned) {
              router.push("/account?banned=true");
            }
          }
        })
        .catch(err => console.error("Error checking ban status:", err));
    }
  }, [isSignedIn, router]);

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

  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // --- MATH & LOGIC ---
  const subtotal = cart.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace(CURRENCY.trim(), '').replace('$', ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) {
      setDiscountPercent(0);
      setPromoMessage(t("invalid_promo"));
      return;
    }

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error("Failed to validate promo code.");
      }

      const data = await response.json();
      if (data.valid) {
        setDiscountPercent(data.discountPercent);
        setPromoMessage(t(data.messageKey));
      } else {
        setDiscountPercent(0);
        setPromoMessage(t(data.messageKey || "invalid_promo"));
      }
    } catch (err) {
      console.error(err);
      setDiscountPercent(0);
      setPromoMessage(t("invalid_promo"));
    }
  };

  const discountAmount = subtotal * discountPercent;
  const shippingCharge = (subtotal - discountAmount) > 200 ? 0 : 25;
  const finalTotal = subtotal - discountAmount + shippingCharge;

  // Render Sign-in Wall if not authenticated
  if (isLoaded && !isSignedIn) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-kora selection:text-white pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden text-start">
        {/* Background radial accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kora/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10 text-center">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase font-sans">
              {t("secure_checkout_btn")}
            </h1>
            <p className="text-slate-500 font-medium font-sans">
              {isLogin ? t("authenticate_prompt") : t("create_account_shop")}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden flex justify-center min-h-[400px]">
            {isLogin ? (
              <SignIn fallbackRedirectUrl="/checkout" appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0 m-0",
                  header: "hidden", 
                  footer: "hidden", 
                  formButtonPrimary: "bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-kora/15",
                  formFieldInput: "bg-white border border-slate-200 text-slate-900 py-3 rounded-xl focus:border-kora focus:ring-1 focus:ring-kora",
                  formFieldLabel: "text-slate-500 font-bold",
                  dividerText: "text-slate-400 font-bold uppercase tracking-wider",
                  socialButtonsBlockButton: "border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold transition-all shadow-sm",
                  socialButtonsBlockButtonText: "font-bold",
                  identityPreviewText: "text-kora",
                  identityPreviewEditButton: "text-slate-400 hover:text-slate-950"
                }
              }} />
            ) : (
              <SignUp fallbackRedirectUrl="/checkout" appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0 m-0",
                  header: "hidden",
                  footer: "hidden",
                  formButtonPrimary: "bg-kora hover:bg-purple-700 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-kora/15",
                  formFieldInput: "bg-white border border-slate-200 text-slate-900 py-3 rounded-xl focus:border-kora focus:ring-1 focus:ring-kora",
                  formFieldLabel: "text-slate-500 font-bold",
                  dividerText: "text-slate-400 font-bold uppercase tracking-wider",
                  socialButtonsBlockButton: "border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold transition-all shadow-sm",
                  socialButtonsBlockButtonText: "font-bold",
                }
              }} />
            )}
          </div>

          <div className="text-center mt-8 relative z-10 font-sans">
            <p className="text-slate-500 font-semibold">
              {isLogin ? t("need_account") : t("already_secured_spot")}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-slate-800 font-bold hover:text-kora transition-colors underline underline-offset-4"
              >
                {isLogin ? t("register") : t("sign_in")}
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

    // 1. Validate First Name and Last Name (Only letters, spaces, hyphens, and apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(shippingFirstName.trim())) {
      setError(t("firstname_validation_error"));
      setIsProcessing(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (!nameRegex.test(shippingLastName.trim())) {
      setError(t("lastname_validation_error"));
      setIsProcessing(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 2. Validate UAE Phone Number
    const cleanPhone = shippingPhone.replace(/[^\d+]/g, "");
    const uaePhoneRegex = /^(?:\+971|00971|971)?(?:5[024568]\d{7}|[234679]\d{7})$/;
    const localUaePhoneRegex = /^0(?:5[024568]\d{7}|[234679]\d{7})$/;

    if (!uaePhoneRegex.test(cleanPhone) && !localUaePhoneRegex.test(cleanPhone)) {
      setError(t("phone_validation_error"));
      setIsProcessing(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (!agreedToPolicy) {
      setError(t("exchange_policy_required_error") || "You must agree to the Exchange Policy to proceed.");
      setIsProcessing(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          cartTotal: finalTotal,
          shippingDetails: {
            firstName: shippingFirstName.trim(),
            lastName: shippingLastName.trim(),
            streetAddress: shippingStreetAddress.trim(),
            city: shippingCity,
            phone: cleanPhone
          },
          paymentMethod: paymentMethod,
          promoCode: promoCode || null,
          discountAmount: discountAmount,
          shippingFee: shippingCharge,
          tax: 0,
          coordinates: locationCoords,
          sellerNote: globalSellerNote.trim(),
          bypassPayment: isUserAdmin ? bypassPayment : false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t("checkout_failed_inspect_cart"));
      }

      const orderData = await response.json();
      
      if (orderData.redirectUrl) {
        // Redirection-based payment (Ziina checkout) - do not clear cart locally yet
        if (typeof window !== "undefined") {
          window.location.href = orderData.redirectUrl;
        }
      } else {
        // Direct checkout (e.g. Cash on Delivery)
        clearCart();
        router.push(`/success?ref=${orderData.referenceNumber}`);
      }
    } catch (err: any) {
      console.error("[CHECKOUT_SUBMIT_ERROR]", err);
      setError(err.message || t("unexpected_error"));
      setIsProcessing(false);
      
      // Smoothly scroll to the top of the form so the error banner is visible
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-20 pb-16 px-4 sm:px-6 md:pt-24 md:pb-24 text-start">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-slate-200 pb-6 text-start">
          <FaLock className="text-2xl text-kora" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">{t("secure_checkout_btn")}</h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 animate-fade-in shadow-sm font-sans text-start">
            <div className="text-xl">⚠️</div>
            <div className="flex-1 text-sm font-bold uppercase tracking-wide">
              {error}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- LEFT SIDE: THE FORMS --- */}
          <div className="flex-1 space-y-10">
            
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-10">
              
              {/* 0. Note for Seller (Optional) - Global */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-start animate-fade-in-up">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">{t("note_for_seller_title")}</h2>
                <textarea
                  value={globalSellerNote}
                  onChange={(e) => setGlobalSellerNote(e.target.value)}
                  placeholder={t("note_for_seller_global_placeholder")}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-xs resize-none h-24 text-start font-sans"
                  maxLength={1000}
                />
              </div>

              {/* 1. Payment Method (Moved to Top) */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-start">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">{t("payment_method_title")}</h2>
                
                {hasPersonalizedItem && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 animate-fade-in shadow-xs font-sans">
                    <div className="text-lg shrink-0 mt-0.5">⚠️</div>
                    <div className="flex-1 text-xs font-bold uppercase tracking-wider leading-relaxed">
                      {t("cod_warning_custom")}
                    </div>
                  </div>
                )}

                {/* Payment Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div 
                    onClick={() => setPaymentMethod("card")}
                    className={`border rounded-xl py-3 flex justify-center items-center gap-2 cursor-pointer transition-colors font-sans ${
                      paymentMethod === "card" ? "bg-kora/10 border-kora text-kora font-bold" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <FaCreditCard /> {t("card_tab")}
                  </div>
                  <div 
                    onClick={() => setPaymentMethod("paypal")}
                    className={`border rounded-xl py-3 flex justify-center items-center gap-2 cursor-pointer transition-colors font-sans ${
                      paymentMethod === "paypal" ? "bg-kora/10 border-kora text-kora font-bold" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <FaPaypal /> {t("paypal_tab")}
                  </div>
                  {hasPersonalizedItem ? (
                    <div 
                      className="border rounded-xl py-3 flex justify-center items-center gap-2 bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed font-sans opacity-60"
                      title={t("cod_locked_title")}
                    >
                      <FaMoneyBillWave /> {t("cod_locked")}
                    </div>
                  ) : (
                    <div 
                      onClick={() => setPaymentMethod("cod")}
                      className={`border rounded-xl py-3 flex justify-center items-center gap-2 cursor-pointer transition-colors font-sans ${
                        paymentMethod === "cod" ? "bg-kora/10 border-kora text-kora font-bold" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <FaMoneyBillWave /> {t("cod_tab")}
                    </div>
                  )}
                </div>

                {paymentMethod === "card" && (
                  <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4 animate-fade-in-up text-start">
                    {isUserAdmin && (
                      <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between mb-4">
                        <div className="pr-2 text-start">
                          <p className="text-xs font-black text-purple-900 uppercase tracking-wide">Admin Test Mode</p>
                          <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-0.5 leading-snug">Bypass payment and redirect directly to success page</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            checked={bypassPayment} 
                            onChange={(e) => setBypassPayment(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-kora">
                        <FaShieldAlt className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">{t("secured_via_ziina")}</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t("encrypted_gateway")}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      {t("ziina_redirect_desc")}
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("ziina_methods")}</span>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="text-center py-6 border border-dashed border-white/20 rounded-xl bg-white/5 animate-fade-in-up">
                    <FaPaypal className="text-4xl text-slate-600 mx-auto mb-3" />
                    <h3 className="text-white font-bold mb-1">{t("wip_title")}</h3>
                    <p className="text-slate-400 text-sm">{t("paypal_wip")}</p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="text-center py-6 border border-white/10 rounded-xl bg-[#05010F]/5 rounded-2xl animate-fade-in-up">
                    <FaMoneyBillWave className="text-4xl text-emerald-500/50 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-bold mb-1 uppercase">{t("cod_tab")}</h3>
                    <p className="text-slate-500 text-sm">{t("cod_desc_info")}</p>
                  </div>
                )}
              </div>

              {/* 2. Shipping Information (Moved to Bottom) */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-start">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider">{t("shipping_location_details")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t("first_name")}</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingFirstName}
                      onChange={(e) => setShippingFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder={t("first_name")} 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t("last_name")}</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingLastName}
                      onChange={(e) => setShippingLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder={t("last_name")} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t("street_address")}</label>
                    <input 
                      type="text" 
                      required 
                      value={shippingStreetAddress}
                      onChange={(e) => setShippingStreetAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder={t("villa_apartment_placeholder")} 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t("city_location")}</label>
                    <select 
                      required 
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors appearance-none shadow-sm cursor-pointer"
                    >
                      <option className="bg-white" value="Dubai">{t("dubai")}</option>
                      <option className="bg-white" value="Abu Dhabi">{t("abu_dhabi")}</option>
                      <option className="bg-white" value="Sharjah">{t("sharjah")}</option>
                      <option className="bg-white" value="Fujairah">{t("fujairah")}</option>
                      <option className="bg-white" value="Ajman">{t("ajman")}</option>
                      <option className="bg-white" value="Ras Al Khaimah">{t("ras_al_khaimah")}</option>
                      <option className="bg-white" value="Umm Al Quwain">{t("umm_al_quwain")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t("phone_number_label")}</label>
                    <input 
                      type="tel" 
                      required 
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm" 
                      placeholder="+971 50 000 0000" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <MapPicker onLocationSelected={(lat, lng) => setLocationCoords({ lat, lng })} />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* --- RIGHT SIDE: ORDER SUMMARY --- */}
          <div className="w-full lg:w-[450px] shrink-0 text-start">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 sticky top-32 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4 uppercase tracking-wider">{t("in_your_cart")}</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto ltr:pr-2 rtl:pl-2 scrollbar-hide text-start">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                       <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center text-start">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{t(String(item.id)) !== String(item.id) ? t(String(item.id)) : item.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t("size_label")}: <span className="font-semibold text-slate-800">{item.size}</span>
                        {(item.customName || item.customNumber) && (
                          <>
                            <span className="mx-1 text-slate-300">•</span>
                            {t("print_label")}: <span className="font-semibold text-kora">{item.customName || "—"} {item.customNumber ? `#${item.customNumber}` : ""}</span>
                          </>
                        )}
                        {item.patch && (
                          <>
                            <span className="mx-1 text-slate-300">•</span>
                            {t("patch_label")}: <span className="font-semibold text-indigo-600">{item.patch}</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t("qty")}: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-kora text-sm flex items-center">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 text-slate-600 text-sm border-t border-slate-200 pt-6 text-start">
                
                {/* PROMO CODE FIELD */}
                <div className="flex gap-2 mb-4 relative">
                  <input 
                    type="text" 
                    placeholder={t("enter_promo_code")} 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora uppercase transition-colors shadow-sm"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    type="button"
                    className="bg-kora hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors shadow-md shadow-kora/30"
                  >
                    {t("apply")}
                  </button>
                </div>
                {promoMessage && (
                  <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${discountPercent > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {promoMessage}
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t("subtotal_label")}</span>
                  <span className="text-slate-900 font-bold">{t("aed")}{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t("discount")} ({discountPercent * 100}%)</span>
                    <span className="font-bold">-{t("aed")}{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t("shipping_intel")}</span>
                  <span className="text-slate-900 font-bold">
                    {shippingCharge === 0 ? t("free_label") : `${t("aed")}${shippingCharge.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("estimated_taxes")}</span>
                  <span className="text-slate-900 font-bold">{t("aed")}0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-6 mb-6 text-start">
                <span className="font-bold text-slate-900 text-lg uppercase tracking-wider">{t("total_label")}</span>
                <span className="text-4xl font-black text-slate-900 font-sans">{t("aed")}{finalTotal.toFixed(2)}</span>
              </div>

              {/* Exchange Policy Checkbox */}
              <div className="mb-6 flex items-start gap-3 text-start">
                <input
                  type="checkbox"
                  id="agree-exchange-policy"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-kora focus:ring-kora cursor-pointer"
                />
                <label htmlFor="agree-exchange-policy" className="text-xs text-slate-600 font-bold leading-normal select-none cursor-pointer">
                  {t("exchange_policy_agree_pre")}{" "}
                  <a
                    href="/shipping?tab=returns"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-kora hover:underline font-extrabold"
                  >
                    {t("exchange_policy_link_text")}
                  </a>
                </label>
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
                    {t("securing_order")}
                  </>
                ) : (
                  <>{t("place_order")}</>
                )}
              </button>
              
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}