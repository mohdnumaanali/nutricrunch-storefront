import React from 'react';
import { CheckCircle2, Printer, ArrowRight, Truck, Phone, MapPin, Sparkles } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationPageProps {
  order: Order | null;
  navigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  navigate
}) => {
  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#123D24]">No Order Selected</h2>
        <p className="text-xs text-[#5D675A]">
          If you recently placed an order, you can look up its status using your order number.
        </p>
        <button
          onClick={() => navigate('/track-order')}
          className="px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-lg"
        >
          Track My Order
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Banner */}
      <div className="bg-[#123D24] text-[#FFF9E9] rounded-3xl p-8 sm:p-10 text-center space-y-3 shadow-md">
        <div className="w-16 h-16 mx-auto bg-[#56783B] rounded-full flex items-center justify-center text-white mb-2 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#D8B84B]">
          Order Successfully Placed
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9E9]">
          Thank You, {order.customer.name}!
        </h1>
        <p className="text-xs sm:text-sm text-[#FFF9E9]/80 max-w-md mx-auto">
          Your order has been recorded in our production system. We have initiated fresh packing at our Hanamkonda facility.
        </p>

        <div className="inline-block mt-4 px-4 py-2 bg-[#FFF9E9]/10 rounded-xl border border-[#FFF9E9]/20">
          <span className="text-xs text-[#FFF9E9]/70">Order Reference Number:</span>
          <span className="block text-lg font-mono font-bold text-[#D8B84B] tabular-nums mt-0.5">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {/* Printable Receipt Box */}
      <div
        id="printable-receipt"
        className="bg-white rounded-2xl border border-[#123D24]/10 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D24]/10 pb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="NutriCrunch" className="max-h-12 h-10 w-auto object-contain rounded-full shadow-xs" />
            <div>
              <span className="font-serif font-bold text-[#123D24] text-lg block leading-tight">NutriCrunch</span>
              <p className="text-[11px] text-[#5D675A]">
                Real Ingredients. Honest Goodness. · Warangal, Telangana
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs">
            <span className="text-[#5D675A] block">Date of Purchase:</span>
            <strong className="text-[#123D24] font-semibold">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </strong>
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-[#123D24]/10 pb-6">
          <div>
            <h4 className="font-bold text-[#123D24] uppercase tracking-wider mb-2">
              Delivery Destination
            </h4>
            <div className="space-y-1 text-[#5D675A]">
              <p className="font-semibold text-[#123D24]">{order.customer.name}</p>
              <p>{order.customer.address}</p>
              <p>
                {order.customer.city}, {order.customer.state} - {order.customer.pinCode}
              </p>
              <p className="font-mono tabular-nums">Phone: +91 {order.customer.phone}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#123D24] uppercase tracking-wider mb-2">
              Payment & Status
            </h4>
            <div className="space-y-1 text-[#5D675A]">
              <p>
                Method:{' '}
                <strong className="text-[#123D24] uppercase font-semibold">
                  {order.paymentMethod === 'whatsapp'
                    ? 'WhatsApp Order (+91 9154797936)'
                    : order.paymentMethod === 'cod'
                    ? 'Cash on Delivery'
                    : 'Online Payment (Razorpay)'}
                </strong>
              </p>
              <p>
                Payment Status:{' '}
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    order.paymentStatus === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                Order Status:{' '}
                <strong className="text-[#123D24] font-semibold">{order.orderStatus}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-[#123D24] uppercase tracking-wider">
            Items Ordered
          </h4>
          <div className="divide-y divide-[#123D24]/10">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h5 className="font-semibold text-[#123D24]">{item.productName}</h5>
                  <p className="text-[#5D675A]">
                    Pack: {item.packageWeight} · Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="font-mono font-bold text-[#123D24] tabular-nums">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-[#123D24]/10 space-y-2 text-xs">
          <div className="flex justify-between text-[#5D675A]">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-[#123D24]">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-[#5D675A]">
            <span>Delivery Fee</span>
            <span className="font-mono font-semibold text-[#56783B]">
              {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#123D24] pt-2 border-t border-[#123D24]/10">
            <span>Total Amount Paid / Due</span>
            <span className="font-mono text-lg">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Action Card */}
      <div className="bg-[#FFFDF7] border border-[#25D366]/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#123D24]">Order Connected to WhatsApp (+91 9154797936)</h4>
            <p className="text-[11px] text-[#5D675A]">If your chat window did not open, click the button to connect directly with our kitchen.</p>
          </div>
        </div>
        <a
          href={`https://wa.me/919154797936?text=${encodeURIComponent(
            `*NutriCrunch Order Inquiry*\nOrder Ref: ${order.orderNumber}\nCustomer: ${order.customer.name}\nTotal: ₹${order.totalAmount}\nPlease share dispatch status!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 whitespace-nowrap"
        >
          <span>Open WhatsApp Chat</span>
        </a>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-white border border-[#123D24]/20 text-[#123D24] text-xs font-bold rounded-xl hover:bg-[#F5ECCE] transition-colors flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print or Save Invoice</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/track-order?orderNumber=${order.orderNumber}`)}
            className="px-5 py-2.5 bg-[#56783B] text-white text-xs font-bold rounded-xl hover:bg-[#435E2D] transition-colors flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Delivery Pipeline</span>
          </button>

          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>

    </div>
  );
};
