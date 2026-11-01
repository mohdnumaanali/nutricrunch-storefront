import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 499;
  const progressToFreeDelivery = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B2516]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFF9E9] text-[#20251F] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#123D24]/10 flex items-center justify-between bg-[#FFFDF7]">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#123D24]">Shopping Bag</h2>
              <span className="text-xs font-mono font-bold bg-[#123D24]/10 text-[#123D24] px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#F5ECCE] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Progress Bar */}
          <div className="bg-[#F5ECCE]/60 px-4 py-2.5 border-b border-[#123D24]/10">
            <div className="flex items-center justify-between text-xs font-medium text-[#123D24] mb-1.5">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#56783B]" />
                {amountNeeded === 0 ? (
                  <span className="font-semibold text-[#56783B]">🎉 You unlocked FREE Local Tri-Cities Delivery!</span>
                ) : (
                  <span>
                    Add <strong className="font-mono">₹{amountNeeded}</strong> more for free local delivery
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px]">{progressToFreeDelivery}%</span>
            </div>
            <div className="w-full bg-[#123D24]/15 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#56783B] h-full transition-all duration-300"
                style={{ width: `${progressToFreeDelivery}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#F5ECCE] rounded-full flex items-center justify-center text-[#123D24]">
                  <Truck className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#123D24]">Your bag is empty</h3>
                  <p className="text-xs text-[#5D675A] max-w-xs mx-auto">
                    Explore our wholesome dry fruits panjiri and crispy banana chips.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-semibold rounded-lg hover:bg-[#0E2E1B] transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-[#123D24]/10 shadow-xs"
                >
                  <div className="w-20 h-20 rounded-lg bg-[#FDF8EB] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    <ProductImage
                      src={product.images && product.images[0] ? product.images[0] : '/assets/panjiri-pouch.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-[#123D24] truncate">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-[#5D675A] hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#5D675A] mt-0.5">
                        Weight: {product.packageWeight}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#123D24]/20 rounded-lg bg-[#FFF9E9]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:bg-[#F5ECCE] text-[#123D24] transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold tabular-nums text-[#123D24]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 hover:bg-[#F5ECCE] text-[#123D24] transition-colors rounded-r-lg disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-[#123D24] tabular-nums">
                          ₹{product.price * quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#123D24]/10 bg-[#FFFDF7] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5D675A]">
                  <span>Bag Subtotal</span>
                  <span className="font-mono tabular-nums font-semibold text-[#123D24]">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-[#5D675A]">
                  <span>Delivery Charges</span>
                  <span className="text-[#56783B] font-medium">
                    {subtotal >= freeDeliveryThreshold ? 'FREE (Tri-Cities)' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#123D24]/10 flex justify-between text-sm font-bold text-[#123D24]">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums text-base">₹{subtotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#56783B]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Instant order confirmation via WhatsApp (+91 9154797936)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="py-3 px-4 border border-[#123D24] text-[#123D24] font-semibold text-xs rounded-lg hover:bg-[#F5ECCE] transition-colors text-center"
                >
                  View Full Cart
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>WhatsApp Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
