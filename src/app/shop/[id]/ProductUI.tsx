"use client";

import { useState } from "react";
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
  
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      // Fallback to a default image if the database array is empty
      image: product.images?.[0] || "https://a.espncdn.com/i/teamlogos/soccer/500/default.png", 
      size: selectedSize,
      quantity: quantity
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: 5, // Hardcoded to 5 stars for now to keep it clean!
          comment: reviewText
        })
      });

      setReviewText(""); // Clear the box
      router.refresh();  // Instantly refresh the page to show the new review!
    } catch (error) {
      console.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05010F] text-slate-200 font-sans selection:bg-purple-500 selection:text-white pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/shop" className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8 font-bold text-sm uppercase tracking-wider">
          <FaChevronLeft /> Back to Vault
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
          
          {/* LEFT: Image Gallery */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="w-full h-[400px] md:h-[600px] bg-[#0a0514] rounded-3xl border border-white/10 flex items-center justify-center p-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent z-0"></div>
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[activeImageIndex] || product.images[0]} 
                  alt="Product View" 
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="relative z-10 text-slate-500">No Image Available</div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {product.images.map((img: string, i: number) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`shrink-0 w-24 h-24 rounded-xl border flex items-center justify-center bg-[#0a0514] overflow-hidden transition-all duration-300 ${
                      activeImageIndex === i ? "border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-16 h-16 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Cart logic */}
          <div className="flex-1 w-full flex flex-col justify-center">
            <div className="mb-8">
              <span className="text-purple-500 font-black tracking-widest uppercase text-xs mb-2 block">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tighter">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-white">{CURRENCY}{product.price}</span>
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  <span className="text-slate-400 ml-2">({product.reviews?.length || 0} Reviews)</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-lg">
                {product.description || "Premium gear sourced directly from Kora Store's exclusive vault."}
              </p>
            </div>

            {/* Size Selector */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold uppercase tracking-wider text-sm">Select Size</h3>
                <Link href="/faq" className="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-4">Size Guide</Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes && product.sizes.length > 0 ? product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-xl font-bold text-lg border transition-all duration-300 ${
                      selectedSize === size 
                        ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] scale-105" 
                        : "bg-[#0a0514] border-white/10 text-slate-400 hover:border-purple-500/50 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                )) : (
                  <span className="text-slate-500">One Size</span>
                )}
              </div>
            </div>

            {/* Add to Cart Action with Quantity Selector */}
            <div className="flex gap-4 mb-8 h-14">
              <div className="flex items-center justify-between bg-[#0a0514] border border-white/10 rounded-full px-2 w-32 shrink-0 shadow-inner">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors text-xl"
                >
                  −
                </button>
                <span className="font-bold text-white text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors text-xl"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={(!selectedSize && product.sizes?.length > 0) || isAdded}
                className={`flex-1 rounded-full font-black uppercase tracking-widest transition-all shadow-lg h-full ${
                  isAdded ? "bg-emerald-500 text-black scale-[1.02]" :
                  (selectedSize || !product.sizes?.length)
                    ? "bg-white text-black hover:bg-purple-500 hover:text-white hover:scale-[1.02]" 
                    : "bg-white/10 text-slate-500 cursor-not-allowed"
                }`}
              >
                {(!selectedSize && product.sizes?.length > 0) ? "Select a Size" : isAdded ? "Added to Vault!" : "Add to Vault"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-slate-400">
                <FaTruckFast className="text-2xl text-purple-400" />
                <span className="text-sm font-medium">1-3 Day UAE Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <FaShieldAlt className="text-2xl text-purple-400" />
                <span className="text-sm font-medium">7-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: DETAILS & REVIEWS TABS --- */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="flex gap-8 border-b border-white/10 mb-8">
            <button 
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-lg font-bold transition-all border-b-2 ${
                activeTab === "details" ? "border-purple-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              The Intel
            </button>
            <button 
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-lg font-bold transition-all border-b-2 ${
                activeTab === "reviews" ? "border-purple-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === "details" && (
              <div className="animate-fade-in-up text-slate-400 leading-relaxed space-y-6">
                <p>
                  Every kit inside Kora Store is rigorously quality-checked before dispatch. We bypass traditional retail channels to bring you absolute 1:1 specifications. 
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-white">Fit:</strong> Standard athletic cut. (Size up if selecting a Player Issue version).</li>
                  <li><strong className="text-white">Material:</strong> 100% Recycled Polyester with advanced sweat-wicking tech.</li>
                  <li><strong className="text-white">Care:</strong> Machine wash cold, inside out. Do not tumble dry to protect printing.</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in-up space-y-10">
                <div className="bg-[#0a0514] border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Drop a Review</h3>
                  <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">Only verified vault members can leave intel.</p>
                  <div className="flex gap-2 text-yellow-500 mb-4 text-xl cursor-pointer">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How was the fit and quality?" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-4 h-24 resize-none"
                  ></textarea>
                  
                  {/* ---> HERE IS THE UPDATED BUTTON <--- */}
                  <button 
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !reviewText.trim()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Dropping Intel..." : "Submit Review"}
                  </button>
                  
                </div>

                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-white/5 pb-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-bold">{review.user?.firstName || "Vault Member"}</p>
                            <div className="flex text-yellow-500 text-xs mt-1">
                              {[...Array(review.rating || 5)].map((_, i) => <FaStar key={i} />)}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-3 leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-slate-500 italic">No reviews yet. Be the first to drop the intel.</p>
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
}