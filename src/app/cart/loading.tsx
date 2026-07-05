export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="relative w-16 h-16">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-kora/10 animate-ping"></div>
        {/* Inner spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-kora animate-spin"></div>
      </div>
      <h3 className="text-slate-900 font-extrabold uppercase tracking-widest text-[10px] mt-6 animate-pulse">
        Loading...
      </h3>
    </div>
  );
}
