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
    <Link href={`/shop/${product.id}`} className="group relative bg-[#0a0514] rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors shadow-lg overflow-hidden flex flex-col h-[380px]">
      <div className="relative flex-1 bg-white/5 flex items-center justify-center p-8 overflow-hidden">
        {product.tag && (
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest z-20 shadow-lg ${
            product.tag === 'Latest' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
          }`}>
            {product.tag}
          </div>
        )}
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-40 h-40 object-contain group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 opacity-100 group-hover:opacity-100" 
        />
      </div>

      <div className="p-5 border-t border-white/5 relative z-20 bg-[#0a0514]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</p>
            <h3 className="text-base font-bold text-white leading-tight line-clamp-1">{product.name}</h3>
          </div>
          <span className="text-lg font-black text-white ml-2 shrink-0 whitespace-nowrap">
            {CURRENCY}{String(product.price).replace(CURRENCY.trim(), '').replace('$', '').trim()}
          </span>
        </div>
        <div className="w-full text-center bg-white/5 group-hover:bg-purple-600 text-white font-bold py-2.5 rounded-lg transition-colors border border-white/10 group-hover:border-transparent text-sm">
          View Gear
        </div>
      </div>
    </Link>
  );
}

export function ProductSkeletonCard() {
  return (
    <div className="group relative bg-[#0a0514] rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col h-[380px] animate-pulse">
      <div className="relative flex-1 bg-white/5 flex items-center justify-center p-8">
        <div className="w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>
      <div className="p-5 border-t border-white/5 relative z-20 bg-[#0a0514]">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-white/10 rounded w-16"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
          <div className="h-6 bg-white/10 rounded w-12 ml-4"></div>
        </div>
        <div className="w-full h-10 bg-white/5 rounded-lg"></div>
      </div>
    </div>
  );
}
