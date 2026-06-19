"use client";

import { useState, useEffect } from "react";
import { CURRENCY } from "@/lib/constants";
import { getOrders, updateOrderFulfillment } from "../actions";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Order Fulfillment</h2>
      
      {loadingOrders ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-kora rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading secured orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order <span className="text-slate-900 font-bold">#{order.id.slice(-6).toUpperCase()}</span></span>
                  <span className="text-base font-black text-emerald-600">{CURRENCY}{parseFloat(order.total).toFixed(2)}</span>
                </div>
                
                <p className="text-xs font-semibold text-slate-700 mb-6 truncate bg-slate-50 border border-slate-100 p-2 rounded-lg font-mono">
                  {order.user?.email || order.userId}
                </p>
                
                <div className="space-y-4 mb-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-kora transition-colors">Fulfillment Status</label>
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateOrder(order.id, e.target.value, order.trackingId || "")}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-kora outline-none cursor-pointer font-bold transition-all shadow-sm"
                    >
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-kora transition-colors">Tracking ID</label>
                    <input 
                      type="text"
                      value={order.trackingId || ""}
                      onChange={(e) => {
                        const newTrackingId = e.target.value;
                        setOrders(orders.map(o => o.id === order.id ? { ...o, trackingId: newTrackingId } : o));
                      }}
                      onBlur={(e) => handleUpdateOrder(order.id, order.status, e.target.value)}
                      placeholder="Enter courier tracking #"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-kora outline-none transition-all shadow-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">No recent orders in the vault.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
