"use client";

import { useState, useEffect } from "react";
import { CURRENCY } from "@/lib/constants";
import { getOrders, updateOrderFulfillment, deleteOrder } from "../actions";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchOrders() {
      const ordersData = await getOrders();
      setOrders(ordersData);
      setLoadingOrders(false);
    }
    fetchOrders();
  }, []);

  const handleUpdateOrder = async (orderId: string, status: string, trackingId: string) => {
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status, trackingId } : o));
    
    const res = await updateOrderFulfillment(orderId, status, trackingId || null);
    if (!res?.success) {
      setOrders(originalOrders);
      alert("Failed to update order");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this order? This action will remove it from the database.")) {
      return;
    }
    const originalOrders = [...orders];
    setOrders(orders.filter(o => o.id !== orderId));
    
    const res = await deleteOrder(orderId);
    if (!res?.success) {
      setOrders(originalOrders);
      alert(res?.error || "Failed to delete order");
    }
  };

  const filteredOrders = orders.filter(order => {
    const custName = order.shippingName || "";
    const custEmail = order.user?.email || order.userId || "";
    const refNum = order.referenceNumber || "";
    
    const matchesSearch = custName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          custEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          refNum.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesStatus = selectedStatusFilter === "All" || 
                          order.status.toUpperCase() === selectedStatusFilter.toUpperCase();
                          
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto font-sans">
      
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between sm:items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Order Fulfillment</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search ref, customer, email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-kora focus:ring-2 focus:ring-kora/10 transition-all sm:w-60"
              />
            </div>
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-kora cursor-pointer transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>
      </div>
      
      {loadingOrders ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
          <div className="relative w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-kora animate-spin" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading secured orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredOrders.map(order => {
            const customerEmail = order.user?.email || "";
            const formattedTotal = parseFloat(order.total).toFixed(2);
            
            // Format status colors
            let statusCls = "bg-amber-50 text-amber-700 border-amber-200/60";
            let accentGradient = "from-amber-400 to-orange-500";
            if (order.status === "DELIVERED") {
              statusCls = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
              accentGradient = "from-emerald-400 to-teal-500";
            } else if (order.status === "SHIPPED") {
              statusCls = "bg-blue-50 text-blue-700 border-blue-200/60";
              accentGradient = "from-blue-400 to-indigo-500";
            }

            return (
              <div key={order.id} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300 group relative overflow-hidden">
                
                {/* Gradient top accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentGradient}`} />

                <div className="p-4 sm:p-5">
                  {/* Order header row */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100 mt-1">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</span>
                      <span className="text-sm font-black text-slate-900 uppercase font-mono truncate">{order.referenceNumber || `REF-${order.id.slice(-4).toUpperCase()}`}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mt-2 w-fit ${statusCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.status === "DELIVERED" ? "bg-emerald-500" : order.status === "SHIPPED" ? "bg-blue-500" : "bg-amber-500"
                        }`} />
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-lg font-black text-slate-900">{CURRENCY}{formattedTotal}</span>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                        title="Delete Order"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Customer details info */}
                  <div className="space-y-2 mb-4 bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-xs font-semibold">
                    <p className="text-slate-800 font-extrabold flex justify-between gap-2">
                      <span className="truncate">👤 {order.shippingName || "Vault Customer"}</span>
                      {customerEmail && (
                        <a 
                          href={`mailto:${customerEmail}?subject=Kora Store Order Update: ${order.referenceNumber}`}
                          className="text-kora hover:underline shrink-0"
                          title="Send Email"
                        >
                          ✉️ Email
                        </a>
                      )}
                    </p>
                    <p className="text-slate-500 font-mono truncate text-[11px]">{customerEmail || order.userId}</p>
                    {order.shippingPhone && (
                      <p className="text-slate-600 font-mono text-[11px]">📞 {order.shippingPhone}</p>
                    )}
                    {(order.shippingStreet || order.shippingCity) && (
                      <p className="text-slate-500 text-[10px] uppercase font-bold mt-1.5 border-t border-slate-200/60 pt-1.5 leading-normal">
                        📍 {order.shippingStreet}, {order.shippingCity}
                      </p>
                    )}
                    {order.sellerNote && (
                      <p className="text-amber-800 bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 mt-2 font-bold text-[10px] uppercase tracking-wide italic">
                        📝 Note: {order.sellerNote}
                      </p>
                    )}
                  </div>

                  {/* Ordered Items summary list */}
                  <div className="mb-4 space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-hide">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Ordered Items</span>
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-slate-200/50">
                            {item.product?.images && item.product.images[0] ? (
                              <img src={item.product.images[0]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[7px] text-slate-300 font-black">N/A</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-800 truncate block text-[11px] uppercase">{item.product?.name || "Premium Gear"}</span>
                            <div className="flex gap-1.5 text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                              <span>Size {item.size}</span>
                              <span>•</span>
                              <span>Qty {item.quantity}</span>
                            </div>
                            {/* Custom prints and badges formatting */}
                            {item.playerName ? (
                              <p className="text-[9px] text-[#6B00FF] font-black uppercase mt-0.5 tracking-wider bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded inline-block">
                                Preset Player: {item.playerName} #{item.customNumber || "-"}
                              </p>
                            ) : (item.customName || item.customNumber) ? (
                              <p className="text-[9px] text-[#6B00FF] font-black uppercase mt-0.5 tracking-wider bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded inline-block">
                                Custom Print: {item.customName || "Plain"} #{item.customNumber || "-"}
                              </p>
                            ) : null}
                            {item.patch && (
                              <p className="text-[9px] text-teal-600 font-black uppercase mt-0.5 tracking-wider bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded inline-block ml-1">
                                Patch: {item.patch}
                              </p>
                            )}
                            {item.sellerNote && (
                              <p className="text-[9px] text-amber-700 font-black uppercase mt-0.5 tracking-wider bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block ml-1">
                                Note: {item.sellerNote}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0 font-bold">{CURRENCY}{parseFloat(item.price).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Controls */}
                <div className="space-y-3 px-4 sm:px-5 pb-4 sm:pb-5 pt-4 border-t border-slate-100 shrink-0">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-kora transition-colors">Fulfillment Status</label>
                    <select 
                      value={order.status.toUpperCase()}
                      onChange={(e) => handleUpdateOrder(order.id, e.target.value, order.trackingId || "")}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:border-kora outline-none cursor-pointer font-bold transition-all"
                    >
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-kora transition-colors">Couriers Tracking ID</label>
                    <input 
                      type="text"
                      value={order.trackingId || ""}
                      onChange={(e) => {
                        const newTrackingId = e.target.value;
                        setOrders(orders.map(o => o.id === order.id ? { ...o, trackingId: newTrackingId } : o));
                      }}
                      onBlur={(e) => handleUpdateOrder(order.id, order.status, e.target.value)}
                      placeholder="Enter courier tracking #"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:border-kora outline-none transition-all font-mono"
                    />
                  </div>
                </div>

              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-2xl">📭</div>
              <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">No matching orders in the vault.</p>
              <p className="text-slate-300 text-xs mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
