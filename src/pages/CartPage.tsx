import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/ProductImage';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();

  const freeDeliveryThreshold = 499;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-[#F5ECCE] rounded-full flex items-center justify-center text-[#123D24]">
          <Truck className="w-10 h-10 opacity-50" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D24]">Your Shopping Bag is Empty</h1>
          <p className="text-xs sm:text-sm text-[#5D675A] max-w-md mx-auto">
            You haven't added any products yet. Browse our wholesome Panjiri roasted in pure bilona ghee and crispy banana chips.
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors inline-flex items-center gap-2"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs text-[#5D675A] hover:text-[#123D24] mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D24]">
            Review Your Shopping Bag
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs divide-y divide-[#123D24]/10">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-[#FFFDF7] p-2 border border-[#123D24]/10 shrink-0 overflow-hidden flex items-center justify-center">
                  <ProductImage
                    src={product.images && product.images[0] ? product.images[0] : '/assets/panjiri-pouch.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/product/${product.slug}`)}
                    className="font-bold text-sm sm:text-base text-[#123D24] cursor-pointer hover:text-[#56783B] truncate"
                  >
                    {product.name}
                  </h3>
                  <div className="text-xs text-[#5D675A] mt-0.5 space-x-2">
                    <span>Pack: {product.packageWeight}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">₹{product.price} each</span>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border border-[#123D24]/20 rounded-lg bg-[#FFF9E9]">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1.5 hover:bg-[#F5ECCE] text-[#123D24] transition-colors rounded-l-lg"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold tabular-nums text-[#123D24]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-1.5 hover:bg-[#F5ECCE] text-[#123D24] transition-colors rounded-r-lg disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-mono font-bold text-sm sm:text-base text-[#123D24] tabular-nums min-w-[70px] text-right">
                    ₹{product.price * quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-1.5 text-[#5D675A] hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tri-Cities Notice Banner */}
          <div className="p-4 bg-[#F5ECCE]/60 rounded-xl border border-[#123D24]/10 flex items-center gap-3 text-xs text-[#123D24]">
            <Truck className="w-4 h-4 text-[#56783B] shrink-0" />
            <span>
              {isFreeDelivery
                ? '🎉 Congratulations! Your order qualifies for FREE Local Express Delivery in Warangal, Hanamkonda & Kazipet.'
                : `Add ₹${freeDeliveryThreshold - subtotal} more to qualify for Free Local Express Delivery in Tri-Cities.`}
            </span>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#123D24] border-b border-[#123D24]/10 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#5D675A]">
              <span>Items Subtotal</span>
              <span className="font-mono tabular-nums font-semibold text-[#123D24]">
                ₹{subtotal}
              </span>
            </div>
            <div className="flex justify-between text-[#5D675A]">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-[#56783B]">
                {isFreeDelivery ? 'FREE' : 'Calculated at checkout'}
              </span>
            </div>
            <div className="pt-3 border-t border-[#123D24]/10 flex justify-between text-base font-bold text-[#123D24]">
              <span>Estimated Total</span>
              <span className="font-mono tabular-nums">₹{subtotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Proceed to WhatsApp Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 text-[11px] text-[#5D675A] pt-2 border-t border-[#123D24]/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#56783B] shrink-0" />
              <span>Instant order pre-fill to WhatsApp (+91 9154797936)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#56783B] shrink-0" />
              <span>Cash on Delivery & Direct UPI supported</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
