import React, { useState, useEffect } from 'react';
import { Truck, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface CheckoutPageProps {
  navigate: (path: string) => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate, onOrderPlaced }) => {
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hanamkonda',
    district: 'Warangal Urban',
    state: 'Telangana',
    pinCode: '506001',
    deliveryInstructions: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Delivery estimation based on PIN code
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isLocalTriCities, setIsLocalTriCities] = useState(true);

  const triCityPins = ['506001', '506002', '506003', '506004', '506007', '506009', '506011', '506015'];

  useEffect(() => {
    const cleanPin = formData.pinCode.trim();
    const isLocal = triCityPins.includes(cleanPin);
    setIsLocalTriCities(isLocal);

    if (isLocal) {
      setDeliveryFee(subtotal >= 499 ? 0 : 40);
    } else {
      setDeliveryFee(subtotal >= 999 ? 0 : 70);
    }
  }, [formData.pinCode, subtotal]);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#123D24]">Your Bag is Empty</h2>
        <p className="text-xs text-[#5D675A]">Please add products before checking out.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-lg hover:bg-[#0E2E1B] transition-colors"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) errs.name = 'Please enter your full name';

    const cleanPhone = formData.phone.replace(/[\s-+]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City / Town is required';
    if (!formData.state.trim()) errs.state = 'State is required';

    if (!/^[1-9][0-9]{5}$/.test(formData.pinCode.trim())) {
      errs.pinCode = 'Please enter a valid 6-digit Indian PIN code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    const cleanPhone = formData.phone.replace(/[\s-+]/g, '').slice(-10);

    try {
      const orderPayload = {
        customer: {
          name: formData.name.trim(),
          phone: cleanPhone,
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          district: formData.district.trim(),
          state: formData.state.trim() || 'Telangana',
          pinCode: formData.pinCode.trim(),
          deliveryInstructions: formData.deliveryInstructions.trim()
        },
        items: items.map((i) => ({
          productId: i.product.id,
          slug: i.product.slug,
          productName: i.product.name,
          quantity: i.quantity,
          packageWeight: i.product.packageWeight
        })),
        paymentMethod: 'whatsapp'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Failed to place order. Please review your details.');
        setIsSubmitting(false);
        return;
      }

      const order: Order = data.order;
      const orderTotal = order.totalAmount;
      const deliveryText = order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`;

      // Construct pre-filled WhatsApp message
      const productLines = order.items
        .map(
          (item) =>
            `• ${item.productName} (${item.packageWeight}) x ${item.quantity} = ₹${item.price * item.quantity}`
        )
        .join('\n');

      const landmarkText = formData.deliveryInstructions.trim()
        ? `\n• Landmark / Instructions: ${formData.deliveryInstructions.trim()}`
        : '';

      const whatsappMessage =
        `*New NutriCrunch Order*\n` +
        `Order Ref: ${order.orderNumber}\n` +
        `--------------------------------\n` +
        `*Customer Details:*\n` +
        `• Name: ${formData.name.trim()}\n` +
        `• Mobile: +91 ${cleanPhone}\n` +
        `• Delivery Address: ${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pinCode.trim()}${landmarkText}\n\n` +
        `*Products Ordered:*\n` +
        `${productLines}\n\n` +
        `*Price Summary:*\n` +
        `• Subtotal: ₹${order.subtotal}\n` +
        `• Delivery Fee: ${deliveryText}\n` +
        `• *Total Price: ₹${orderTotal}*\n` +
        `--------------------------------\n` +
        `Please confirm my order and share delivery schedule. Thank you!`;

      const whatsappUrl = `https://wa.me/919154797936?text=${encodeURIComponent(whatsappMessage)}`;

      // Clear the user's cart
      clearCart();
      onOrderPlaced(order);

      // Open WhatsApp chat directly
      const opened = window.open(whatsappUrl, '_blank');
      if (!opened) {
        window.location.href = whatsappUrl;
        return;
      }

      // Navigate to order confirmation
      navigate(`/order-confirmation?orderNumber=${order.orderNumber}`);
    } catch (err) {
      setServerError('A network error occurred while processing your order. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedTotal = subtotal + deliveryFee;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1.5 text-xs text-[#5D675A] hover:text-[#123D24] mb-2 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Bag</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D24]">
          Checkout & Delivery Details
        </h1>
        <p className="text-xs text-[#5D675A] mt-1">
          WhatsApp Order System · Direct confirmation with our kitchen at <strong className="text-[#123D24]">+91 9154797936</strong>
        </p>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Order Error:</strong>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customer & Delivery Address Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#123D24] uppercase tracking-wider border-b border-[#123D24]/10 pb-3 flex items-center justify-between">
              <span>1. Customer Details</span>
              <span className="text-[11px] font-normal text-[#5D675A] capitalize">Required for delivery</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rameshwar Rao"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24] ${
                    errors.name ? 'border-rose-500 bg-rose-50' : 'border-[#123D24]/20'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  WhatsApp Mobile Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24] ${
                    errors.phone ? 'border-rose-500 bg-rose-50' : 'border-[#123D24]/20'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                Email Address <span className="text-xs font-normal text-[#5D675A]">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#123D24] uppercase tracking-wider border-b border-[#123D24]/10 pb-3 flex items-center justify-between">
              <span>2. Delivery Address</span>
              <span className="text-[11px] font-normal text-[#5D675A] capitalize">Where to dispatch</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                House / Flat / Street Address <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House No., Street / Colony Name, Area"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24] ${
                  errors.address ? 'border-rose-500 bg-rose-50' : 'border-[#123D24]/20'
                }`}
              />
              {errors.address && <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  City / Town <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Hanamkonda / Warangal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  PIN Code <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="506001"
                  maxLength={6}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24] ${
                    errors.pinCode ? 'border-rose-500 bg-rose-50' : 'border-[#123D24]/20'
                  }`}
                />
                {errors.pinCode && <p className="text-[11px] text-rose-600 mt-1">{errors.pinCode}</p>}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-[#123D24] mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Telangana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                Landmark or Delivery Instructions <span className="text-xs font-normal text-[#5D675A]">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                placeholder="e.g. Near Kakatiya University Gate, call before arrival"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs bg-[#FFFDF7] text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
              />
            </div>
          </div>

          {/* WhatsApp Order Flow Assurance Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-emerald-900">
            <div className="p-2 bg-[#25D366] text-white rounded-xl shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-emerald-950">
                Official WhatsApp Order Confirmation
              </h3>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                When you click <strong>Confirm Order</strong>, your details will be recorded in our production system and you will be redirected to WhatsApp at <strong className="font-mono text-emerald-950">+91 9154797936</strong> with your order pre-filled. You can choose Cash on Delivery or UPI payment directly with us on WhatsApp.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Order Confirmation Summary */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#123D24] border-b border-[#123D24]/10 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-mono font-bold bg-[#123D24]/10 text-[#123D24] px-2 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </h2>

          <div className="divide-y divide-[#123D24]/10 max-h-64 overflow-y-auto space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <h4 className="font-semibold text-[#123D24] truncate">{product.name}</h4>
                  <p className="text-[#5D675A] text-[11px]">
                    Qty: {quantity} × ₹{product.price} ({product.packageWeight})
                  </p>
                </div>
                <span className="font-mono font-bold text-[#123D24] tabular-nums shrink-0">
                  ₹{product.price * quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Math */}
          <div className="space-y-2.5 pt-4 border-t border-[#123D24]/10 text-xs">
            <div className="flex justify-between text-[#5D675A]">
              <span>Items Subtotal</span>
              <span className="font-mono tabular-nums font-semibold text-[#123D24]">
                ₹{subtotal}
              </span>
            </div>

            <div className="flex justify-between text-[#5D675A]">
              <span>
                Delivery Fee ({isLocalTriCities ? 'Tri-Cities Local' : 'National Standard'})
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#56783B]">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="pt-3 border-t border-[#123D24]/10 flex justify-between text-base font-bold text-[#123D24]">
              <span>Total Price</span>
              <span className="font-mono tabular-nums text-xl text-[#123D24]">₹{estimatedTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-5 h-5 shrink-0" />
            <span>
              {isSubmitting ? 'Recording Order...' : `Confirm Order on WhatsApp (₹${estimatedTotal})`}
            </span>
          </button>

          <div className="p-3 bg-[#FFF9E9] rounded-xl border border-[#D8B84B]/40 text-[11px] text-[#5D675A] space-y-1">
            <p className="font-semibold text-[#123D24] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#56783B]" />
              Redirects to +91 9154797936
            </p>
            <p>
              Your name, delivery details, ordered products, and total price will be automatically pre-filled into the WhatsApp chat.
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-[#5D675A] pt-2 border-t border-[#123D24]/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#56783B] shrink-0" />
              <span>Direct communication with NutriCrunch kitchen in Warangal</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#56783B] shrink-0" />
              <span>Same-day dispatch for local Tri-Cities orders</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
