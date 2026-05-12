import Link from "next/link";
import { CURRENCY } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  images?: string[];
  image?: string; // Support for the legacy hardcoded Trending format
  tag?: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  // Use the first image if it's an array, or the direct image string if it's the legacy object
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image 
      ? product.image 
      : "";

  return (
    <Link href={`/shop/${product.id}`} className="group relative bg-white rounded-2xl border border-slate-200 hover:border-kora transition-all duration-300 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(107,0,255,0.3)] hover:-translate-y-1 overflow-hidden flex flex-col h-[380px]">
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-8 overflow-hidden">
        {product.tag && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-md text-[10px] font-pixel uppercase tracking-widest z-20 shadow-sm ${
            product.tag === 'Latest' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            {product.tag}
          </div>
        )}
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-40 h-40 object-contain drop-shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 opacity-100 group-hover:opacity-100" 
        />
      </div>

      <div className="p-5 border-t border-slate-100 relative z-20 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-kora text-[10px] font-pixel uppercase tracking-widest mb-2">{product.category}</p>
            <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 font-sans">{product.name}</h3>
          </div>
          <span className="text-lg font-bold text-slate-900 ml-2 shrink-0 whitespace-nowrap font-sans">
            {CURRENCY}{String(product.price).replace(CURRENCY.trim(), '').replace('$', '').trim()}
          </span>
        </div>
        <div className="w-full text-center bg-slate-100 group-hover:bg-kora text-slate-700 group-hover:text-white font-pixel text-xs py-3 rounded-lg transition-colors border border-slate-200 group-hover:border-kora">
          View Gear
        </div>
      </div>
    </Link>
  );
}

export function ProductSkeletonCard() {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[380px] animate-pulse">
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-8">
        <div className="w-32 h-32 bg-slate-200 rounded-full blur-xl"></div>
      </div>
      <div className="p-5 border-t border-slate-100 relative z-20 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="h-6 bg-slate-200 rounded w-12 ml-4"></div>
        </div>
        <div className="w-full h-10 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
  );
}
