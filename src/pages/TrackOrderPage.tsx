import React, { useState, useEffect } from 'react';
import { Search, Truck, CheckCircle2, Clock, AlertCircle, PackageCheck, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  navigate: (path: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderNumber = '',
  navigate
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statuses = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please provide both your Order Number and registered 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No matching order found. Please verify your details.');
        setIsLoading(false);
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError('A network error occurred while connecting to the tracking service.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (currentStatus: string) => {
    return statuses.indexOf(currentStatus);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
          Live Dispatch Tracking
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D24]">
          Track Your NutriCrunch Order
        </h1>
        <p className="text-xs text-[#5D675A]">
          Enter your unique order number (e.g. NC-2026-1001) and your registered mobile number to securely view the status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#123D24]/10 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                Order Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. NC-2026-1001"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs font-mono bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                Registered Mobile Number <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs font-mono bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Track Order Status'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {order && (
        <div className="bg-white rounded-2xl border border-[#123D24]/10 p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in duration-300">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D24]/10 pb-6">
            <div>
              <div className="text-xs text-[#5D675A]">Tracking Status For</div>
              <h2 className="text-xl font-bold font-mono text-[#123D24] mt-0.5">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-[#5D675A] mt-1">
                Customer: <strong>{order.customer.name}</strong> · Delivery to{' '}
                {order.customer.city}, {order.customer.pinCode}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-[#5D675A] block">Current Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Visual Status Pipeline */}
          {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Refunded' ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#123D24] uppercase tracking-wider">
                Fulfillment & Delivery Progress
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-1/2 left-4 right-4 h-1 bg-[#123D24]/10 -translate-y-1/2 z-0" />

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                  {statuses.map((step, idx) => {
                    const currentIdx = getStatusIndex(order.orderStatus);
                    const isCompleted = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={step} className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-[#56783B] text-white shadow-xs'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          } ${isCurrent ? 'ring-4 ring-[#56783B]/20 font-bold' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-xs font-mono">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            isCurrent
                              ? 'font-bold text-[#123D24]'
                              : isCompleted
                              ? 'font-medium text-[#20251F]'
                              : 'text-gray-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              This order has been marked as <strong>{order.orderStatus}</strong>. If you have questions or require support, please contact us on WhatsApp or phone.
            </div>
          )}

          {/* Status History Log */}
          <div className="space-y-3 pt-4 border-t border-[#123D24]/10">
            <h3 className="text-xs font-bold text-[#123D24] uppercase tracking-wider">
              Activity History
            </h3>
            <div className="space-y-2.5">
              {order.statusHistory?.map((hist: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-[#FFFDF7] rounded-xl border border-[#123D24]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <div>
                    <strong className="text-[#123D24]">{hist.status}</strong>
                    {hist.note && <p className="text-[#5D675A] mt-0.5">{hist.note}</p>}
                  </div>
                  <span className="text-[11px] font-mono text-[#5D675A] shrink-0">
                    {new Date(hist.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items Summary in Tracking */}
          <div className="pt-4 border-t border-[#123D24]/10 space-y-2 text-xs">
            <h3 className="text-xs font-bold text-[#123D24] uppercase tracking-wider mb-2">
              Package Contents
            </h3>
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-[#5D675A]">
                <span>
                  {item.quantity}x {item.productName} ({item.packageWeight})
                </span>
                <span className="font-mono text-[#123D24]">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#123D24]/10 flex justify-between font-bold text-sm text-[#123D24]">
              <span>Total Value</span>
              <span className="font-mono tabular-nums">₹{order.totalAmount}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
