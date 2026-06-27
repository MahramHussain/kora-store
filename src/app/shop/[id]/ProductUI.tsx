"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CURRENCY } from "@/lib/constants";
import Link from "next/link";
import { FaChevronLeft, FaStar, FaTruckFast } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ProductUI({ product }: { product: any }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const galleryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute average rating from reviews
  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0) / product.reviews.length)
    : 0;
  const avgRatingDisplay = avgRating > 0 ? avgRating.toFixed(1) : null;

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync gallery scroll to activeImageIndex (for thumbnail clicks on mobile)
  const scrollToSlide = useCallback((idx: number) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  }, []);

  // Listen to swipe scroll and update dot indicator
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveImageIndex(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[activeImageIndex] || product.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png",
      size: selectedSize,
      quantity: quantity,
      customName: customName.trim(),
      customNumber: customNumber.trim(),
    });
    setIsAdded(true);
    setCustomName("");
    setCustomNumber("");
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating: selectedRating, comment: reviewText }),
      });
      setReviewText("");
      setSelectedRating(5);
      router.refresh();
    } catch (error) {
      console.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable interactive star picker
  const StarPicker = ({ size = "text-xl" }: { size?: string }) => (
    <div className={`flex gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setSelectedRating(star)}
          className="star-interactive focus:outline-none"
          aria-label={`Rate ${star} stars`}
        >
          <FaStar
            className={`transition-colors ${
              star <= (hoverRating || selectedRating)
                ? "text-yellow-400"
                : "text-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const images: string[] = product.images && product.images.length > 0 ? product.images : [];
  const categoryLabel =
    product.category === "Boots" ? "Shoes" : product.category === "Flags" ? "Accessories" : product.category;

  // ──────────────────────────────────────────────────────────────────────────
  //  MOBILE LAYOUT  (< 768px — isMobile is derived from CSS media query)
  // ──────────────────────────────────────────────────────────────────────────
  const MobileView = (
    <div className="block md:hidden min-h-screen bg-slate-50 font-sans selection:bg-kora selection:text-white">
      {/* ── Back button overlay ── */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-safe">
        <div className="flex items-center justify-between py-3">
          <Link
            href="/shop"
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/50 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
          >
            <FaChevronLeft className="text-sm" />
          </Link>
          {/* Stock badge */}
          {product.stock === 0 ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-rose-500 text-white rounded-full shadow">
              Sold Out
            </span>
          ) : product.stock <= 3 ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-amber-500 text-white rounded-full shadow animate-pulse">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Full-bleed swipeable image gallery ── */}
      <div className="relative w-full" style={{ height: "min(420px, 58vw + 100px)" }}>
        {images.length > 0 ? (
          <>
            <div
              ref={galleryRef}
              className="pdp-gallery-track w-full h-full"
            >
              {images.map((img, idx) => (
                <div key={idx} className="pdp-gallery-slide h-full" style={{ minWidth: "100%" }}>
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="pdp-dots absolute bottom-2 left-0 right-0">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSlide(idx)}
                    className={`pdp-dot ${idx === activeImageIndex ? "pdp-dot-active" : ""}`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image count badge */}
            {images.length > 1 && (
              <span className="absolute top-16 right-4 text-[10px] font-bold bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeImageIndex + 1}/{images.length}
              </span>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
            No Image Available
          </div>
        )}
      </div>

      {/* ── White card content area ── */}
      <div className="pdp-info-card pdp-mobile-animate">

        {/* Category + Name + Rating row */}
        <div className="mb-4">
          <span className="text-kora text-[10px] font-bold uppercase tracking-widest">{categoryLabel}</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight mt-1 uppercase">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex text-yellow-400 text-xs gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400" : "text-slate-200"} />
              ))}
            </div>
            {avgRatingDisplay ? (
              <span className="text-xs font-black text-slate-700">{avgRatingDisplay}</span>
            ) : null}
            <span className="text-xs text-slate-400 font-medium">
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>
        </div>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
          <span className="text-3xl font-black text-slate-900">
            {CURRENCY}{product.price}
          </span>
          {product.stock === 0 ? (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full">
              Sold Out
            </span>
          ) : product.stock <= 3 ? (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full animate-pulse">
              Only {product.stock} left!
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {/* Style Variation Selector (Boots) */}
        {product.category === "Boots" && images.length > 1 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Style / Variation</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all active:scale-90 ${
                    activeImageIndex === i
                      ? "border-kora shadow-md shadow-kora/20"
                      : "border-slate-200"
                  }`}
                >
                  <img src={img} alt={`Variation ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Thumbnail row for non-boots */}
        {product.category !== "Boots" && images.length > 1 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Gallery</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all active:scale-90 ${
                    activeImageIndex === i
                      ? "border-kora shadow-md shadow-kora/20"
                      : "border-slate-200"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Size</p>
            <Link href="/faq" className="text-[10px] font-bold text-kora uppercase tracking-wider">
              Size Guide →
            </Link>
          </div>
          {product.sizes && product.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => product.stock > 0 && setSelectedSize(size)}
                  disabled={product.stock === 0}
                  className={`pdp-size-pill px-3 ${
                    product.stock === 0
                      ? "pdp-size-pill-disabled"
                      : selectedSize === size
                      ? "pdp-size-pill-active"
                      : ""
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">One Size</p>
          )}
        </div>

        {/* Custom Printing (Shirts only) */}
        {product.category === "Shirts" && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Custom Printing <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Name</label>
                <input
                  type="text"
                  maxLength={15}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                  placeholder="e.g. MESSI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold tracking-wider"
                />
              </div>
              <div className="w-24">
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Number</label>
                <input
                  type="text"
                  maxLength={3}
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors text-sm font-bold text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            {product.description || "Premium gear sourced directly from Kora Store's exclusive vault."}
          </p>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="pdp-trust-badge">
            <FaTruckFast className="text-kora text-base shrink-0" />
            <span>1–3 Day UAE Delivery</span>
          </div>
          <div className="pdp-trust-badge">
            <FaShieldAlt className="text-kora text-base shrink-0" />
            <span>7-Day Guarantee</span>
          </div>
        </div>

        {/* ── Tabs: Details + Reviews ── */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex gap-6 border-b border-slate-100 mb-5">
            <button
              onClick={() => setActiveTab("details")}
              className={`pdp-tab ${activeTab === "details" ? "pdp-tab-active" : ""}`}
            >
              The Intel
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pdp-tab ${activeTab === "reviews" ? "pdp-tab-active" : ""}`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          {activeTab === "details" && (
            <div className="text-slate-500 text-sm leading-relaxed space-y-4 pdp-mobile-animate">
              <p>Every kit is rigorously quality-checked before dispatch. We bypass traditional retail to bring you absolute 1:1 specifications.</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Fit:</span> Standard athletic cut. Size up for Player Issue versions.</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Material:</span> 100% Recycled Polyester with advanced sweat-wicking tech.</li>
                <li className="flex gap-2"><span className="font-bold text-slate-800 shrink-0">Care:</span> Machine wash cold, inside out. Do not tumble dry.</li>
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 pdp-mobile-animate">
              {/* Review input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-1">Drop a Review</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Tap stars to rate</p>
                <div className="mb-3"><StarPicker size="text-lg" /></div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the fit and quality?"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora mb-3 h-20 resize-none text-sm"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !reviewText.trim()}
                  className="w-full bg-slate-900 active:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-40"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>

              {/* Reviews list */}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-slate-100 pb-4">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{review.user?.firstName || "Vault Member"}</p>
                          <div className="flex text-yellow-400 text-xs gap-0.5 mt-0.5">
                            {[...Array(review.rating || 5)].map((_, i) => <FaStar key={i} />)}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm text-slate-400 italic">No reviews yet. Be the first to drop intel.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom CTA bar ── */}
      <div className="pdp-sticky-cta">
        <div className="flex gap-3 items-center">
          {/* Quantity selector */}
          <div className={`flex items-center border border-slate-200 rounded-xl h-12 overflow-hidden shrink-0 ${product.stock === 0 ? "opacity-40" : ""}`}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={product.stock === 0}
              className="w-10 h-12 flex items-center justify-center text-slate-500 text-lg font-bold active:bg-slate-50 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-black text-slate-900 text-sm">{product.stock === 0 ? 0 : quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={product.stock === 0 || quantity >= product.stock}
              className="w-10 h-12 flex items-center justify-center text-slate-500 text-lg font-bold active:bg-slate-50 transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Add to vault button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || (!selectedSize && product.sizes?.length > 0) || isAdded}
            className={`flex-1 h-12 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              product.stock === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isAdded
                ? "bg-emerald-500 text-white"
                : selectedSize || !product.sizes?.length
                ? "bg-kora text-white active:bg-purple-700 shadow-lg shadow-kora/30"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {product.stock === 0
              ? "Sold Out"
              : !selectedSize && product.sizes?.length > 0
              ? "Select a Size"
              : isAdded
              ? "✓ Added to Vault!"
              : "Add to Vault"}
          </button>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  //  DESKTOP LAYOUT  (≥ 768px — completely unchanged from original)
  // ──────────────────────────────────────────────────────────────────────────
  const DesktopView = (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-kora selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto">

        <Link href="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-kora transition-colors mb-8 font-bold text-xs uppercase tracking-wider">
          <FaChevronLeft /> Back to Vault
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">

          {/* LEFT: Image Gallery */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="w-full h-[320px] sm:h-[450px] md:h-[600px] bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="absolute inset-0 bg-gradient-to-br from-kora/5 to-transparent z-0"></div>
              {images.length > 0 ? (
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt="Product View"
                  className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="relative z-10 text-slate-400 font-sans">No Image Available</div>
              )}
            </div>

            {product.category !== "Boots" && images.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`shrink-0 w-24 h-24 rounded-xl border flex items-center justify-center bg-white overflow-hidden transition-all duration-300 shadow-sm ${
                        activeImageIndex === i
                          ? "border-kora border-2 shadow-md shadow-kora/30 scale-102"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${i + 1}`} className="w-16 h-16 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Cart logic */}
          <div className="flex-1 w-full flex flex-col justify-center">
            <div className="mb-8">
              <span className="text-kora font-bold tracking-widest uppercase text-xs mb-2 block">{categoryLabel}</span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4 leading-tight uppercase">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold font-sans text-slate-900">{CURRENCY}{product.price}</span>
                <div className="flex items-center gap-1.5 text-sm">
                  {[1,2,3,4,5].map(s => (
                    <FaStar key={s} className={s <= Math.round(avgRating) ? "text-yellow-400" : "text-slate-200"} />
                  ))}
                  {avgRatingDisplay && <span className="font-black text-slate-900 ml-1">{avgRatingDisplay}</span>}
                  <span className="text-slate-400 font-sans ml-1">({product.reviews?.length || 0} Reviews)</span>
                </div>
              </div>

              {/* Premium Inventory Stock Level Badging */}
              <div className="mb-6">
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold uppercase tracking-wider font-sans">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Sold Out - Restocking Soon
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold uppercase tracking-wider font-sans animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    Priority Alert: Only {product.stock} items left in The Vault!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider font-sans">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Secured: In Stock ({product.stock} kits ready for priority shipping)
                  </span>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed text-lg font-sans">
                {product.description || "Premium gear sourced directly from Kora Store's exclusive vault."}
              </p>
            </div>

            {/* Style Variation Selector for Shoes */}
            {product.category === "Boots" && images.length > 0 && (
              <div className="mb-8 font-sans">
                <h3 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-3">
                  Select Style / Variation
                </h3>
                <div className="flex flex-wrap gap-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center p-1 bg-slate-50 overflow-hidden transition-all ${
                        activeImageIndex === i
                          ? "border-kora shadow-md shadow-kora/20 scale-105 animate-pulse"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      style={{ transition: "all 0.3s ease" }}
                    >
                      <img src={img} alt={`Style ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-10 font-sans">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-900 font-bold uppercase tracking-wider text-xs">Select Size</h3>
                <Link href="/faq" className="text-kora hover:text-purple-700 text-sm underline underline-offset-4 font-sans">Size Guide</Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes && product.sizes.length > 0 ? product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={product.stock === 0}
                    className={`w-14 h-14 rounded-xl font-bold text-lg border transition-all duration-300 ${
                      product.stock === 0
                        ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                        : selectedSize === size
                        ? "bg-kora border-kora text-white shadow-md shadow-kora/30 scale-105"
                        : "bg-white border-slate-200 text-slate-500 hover:border-kora/50 hover:text-slate-900 shadow-sm"
                    }`}
                  >
                    {size}
                  </button>
                )) : (
                  <span className="text-slate-500 font-sans">One Size</span>
                )}
              </div>
            </div>

            {/* Custom Printing Inputs (Only for shirts!) */}
            {product.category === "Shirts" && (
              <div className="mb-10 font-sans animate-fade-in-up">
                <h3 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-4">
                  Custom Jersey Printing (Optional)
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Name on Shirt</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                      placeholder="e.g. MESSI"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm text-sm font-bold tracking-wider"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Number</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="10"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora transition-colors shadow-sm text-sm font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart Action with Quantity Selector */}
            <div className="flex gap-4 mb-8 h-14 font-sans">
              <div className={`flex items-center justify-between bg-white border border-slate-200 rounded-full px-2 w-32 shrink-0 shadow-sm ${product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors text-xl disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="font-bold text-slate-900 text-lg">{product.stock === 0 ? 0 : quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock === 0 || quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors text-xl disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (!selectedSize && product.sizes?.length > 0) || isAdded}
                className={`flex-1 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-md h-full flex items-center justify-center ${
                  product.stock === 0
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    : isAdded
                    ? "bg-emerald-500 text-white scale-[1.02]"
                    : selectedSize || !product.sizes?.length
                    ? "bg-slate-900 text-white hover:bg-kora hover:text-white hover:scale-[1.02] hover:shadow-kora/30"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {product.stock === 0 ? "Sold Out" : !selectedSize && product.sizes?.length > 0 ? "Select a Size" : isAdded ? "Added to Vault!" : "Add to Vault"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <FaTruckFast className="text-2xl text-kora" />
                <span className="text-sm font-medium font-sans">1-3 Day UAE Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <FaShieldAlt className="text-2xl text-kora" />
                <span className="text-sm font-medium font-sans">7-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: DETAILS & REVIEWS TABS --- */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="flex gap-8 border-b border-slate-200 mb-8 font-bold uppercase">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-lg transition-all border-b-2 ${
                activeTab === "details" ? "border-kora text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              The Intel
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-lg transition-all border-b-2 ${
                activeTab === "reviews" ? "border-kora text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === "details" && (
              <div className="animate-fade-in-up text-slate-600 leading-relaxed space-y-6 font-sans">
                <p>
                  Every kit inside Kora Store is rigorously quality-checked before dispatch. We bypass traditional retail channels to bring you absolute 1:1 specifications.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-slate-900">Fit:</strong> Standard athletic cut. (Size up if selecting a Player Issue version).</li>
                  <li><strong className="text-slate-900">Material:</strong> 100% Recycled Polyester with advanced sweat-wicking tech.</li>
                  <li><strong className="text-slate-900">Care:</strong> Machine wash cold, inside out. Do not tumble dry to protect printing.</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in-up space-y-10 font-sans">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold uppercase text-slate-900">Drop a Review</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Hover &amp; click to rate</span>
                  </div>
                  <div className="mb-4"><StarPicker size="text-2xl" /></div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How was the fit and quality?"
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora mb-4 h-24 resize-none shadow-sm"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !reviewText.trim()}
                    className="bg-slate-900 hover:bg-kora text-white font-bold text-xs uppercase tracking-widest py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-kora/30"
                  >
                    {isSubmitting ? "Dropping Intel..." : "Submit Review"}
                  </button>
                </div>

                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-slate-200 pb-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-slate-900 font-bold font-sans">{review.user?.firstName || "Vault Member"}</p>
                            <div className="flex text-yellow-500 text-xs mt-1">
                              {[...Array(review.rating || 5)].map((_, i) => <FaStar key={i} />)}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-sans">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mt-3 leading-relaxed font-sans">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
                      <p className="text-slate-500 italic font-sans">No reviews yet. Be the first to drop the intel.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );

  return (
    <>
      {/* Mobile layout — shown only on screens < 768px */}
      <div className="block md:hidden">
        {MobileView}
      </div>
      {/* Desktop layout — shown only on screens ≥ 768px */}
      <div className="hidden md:block">
        {DesktopView}
      </div>
    </>
  );
}