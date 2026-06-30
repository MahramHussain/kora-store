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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight self-start md:self-center">Order Fulfillment</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search ref, customer, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 placeholder-slate-400 outline-none focus:border-[#6B00FF] focus:ring-1 focus:ring-[#6B00FF] transition-all shadow-2xs sm:w-60"
          />
          <select 
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-[#6B00FF] cursor-pointer shadow-2xs transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>
      
      {loadingOrders ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-kora rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading secured orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => {
            const customerEmail = order.user?.email || "";
            const formattedTotal = parseFloat(order.total).toFixed(2);
            
            // Format status colors
            let statusCls = "bg-amber-50 text-amber-700 border-amber-200/60";
            if (order.status === "DELIVERED") {
              statusCls = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
            } else if (order.status === "SHIPPED") {
              statusCls = "bg-blue-50 text-blue-700 border-blue-200/60";
            }

            return (
              <div key={order.id} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden">
                
                {/* Visual Glow Header Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  order.status === "DELIVERED"
                    ? "from-emerald-400 to-teal-500"
                    : order.status === "SHIPPED"
                    ? "from-blue-400 to-indigo-500"
                    : "from-amber-400 to-[#6B00FF]"
                }`} />

                <div>
                  {/* Order header row */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</span>
                      <span className="text-sm font-black text-slate-900 uppercase font-mono">{order.referenceNumber || `REF-${order.id.slice(-4).toUpperCase()}`}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black text-slate-900">{CURRENCY}{formattedTotal}</span>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Order"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Customer details info */}
                  <div className="space-y-2 mb-4 bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs font-semibold">
                    <p className="text-slate-800 font-extrabold flex justify-between">
                      <span>👤 {order.shippingName || "Vault Customer"}</span>
                      {customerEmail && (
                        <a 
                          href={`mailto:${customerEmail}?subject=Kora Store Order Update: ${order.referenceNumber}`}
                          className="text-[#6B00FF] hover:underline"
                          title="Send Email"
                        >
                          ✉️ Email
                        </a>
                      )}
                    </p>
                    <p className="text-slate-500 font-mono truncate">{customerEmail || order.userId}</p>
                    {order.shippingPhone && (
                      <p className="text-slate-600 font-mono">📞 {order.shippingPhone}</p>
                    )}
                    {(order.shippingStreet || order.shippingCity) && (
                      <p className="text-slate-500 text-[10px] uppercase font-bold mt-1.5 border-t border-slate-200/60 pt-1.5 leading-normal">
                        📍 {order.shippingStreet}, {order.shippingCity}
                      </p>
                    )}
                  </div>

                  {/* Ordered Items summary list */}
                  <div className="mb-6 space-y-2 max-h-36 overflow-y-auto pr-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Ordered Items</span>
                    {order.items && order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center p-1 shrink-0 border border-slate-200/50">
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
                            {(item.customName || item.customNumber) && (
                              <p className="text-[9px] text-[#6B00FF] font-black uppercase mt-0.5 tracking-wider bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded inline-block">
                                Print: {item.customName || "Plain"} #{item.customNumber || "-"}
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
                <div className="space-y-3.5 pt-4 border-t border-slate-100 shrink-0">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-[#6B00FF] transition-colors">Fulfillment Status</label>
                    <select 
                      value={order.status.toUpperCase()}
                      onChange={(e) => handleUpdateOrder(order.id, e.target.value, order.trackingId || "")}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#6B00FF] outline-none cursor-pointer font-bold transition-all shadow-2xs"
                    >
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-[#6B00FF] transition-colors">Couriers Tracking ID</label>
                    <input 
                      type="text"
                      value={order.trackingId || ""}
                      onChange={(e) => {
                        const newTrackingId = e.target.value;
                        setOrders(orders.map(o => o.id === order.id ? { ...o, trackingId: newTrackingId } : o));
                      }}
                      onBlur={(e) => handleUpdateOrder(order.id, order.status, e.target.value)}
                      placeholder="Enter courier tracking #"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-[#6B00FF] outline-none transition-all shadow-2xs font-mono"
                    />
                  </div>
                </div>

              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">No matching orders in the vault.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
