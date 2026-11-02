import React from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { items, updateQuantity, removeItem } = useCart();

  const safeTotalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const safeSubtotal = items.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const deliveryFee = safeSubtotal >= 499 ? 0 : 40;
  const total = safeSubtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-1.5 text-xs text-[#5D675A] hover:text-[#123D24] mb-2 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shop</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D24]">
          Shopping Bag ({safeTotalItems} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#123D24]/10 text-center space-y-4">
          <ShoppingBag className="w-16 h-16 mx-auto text-slate-300" />
          <h2 className="text-lg font-bold text-[#123D24]">Your bag is currently empty</h2>
          <p className="text-xs text-[#5D675A]">Explore our wholesome artisanal products to get started.</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#123D24]/10 space-y-4">
            <div className="divide-y divide-[#123D24]/10">
              {items.map(({ product, quantity }) => {
                const itemQty = Number(quantity) || 1;
                const itemPrice = Number(product?.price) || 0;
                const weight = product?.weight || product?.packageWeight || '500g';

                return (
                  <div key={product?.id || Math.random()} className="py-4 first:pt-0 flex items-center gap-4">
                    <img
                      src={product?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                      alt={product?.name || 'Product'}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#123D24] truncate">{product?.name}</h3>
                      <p className="text-xs text-[#5D675A]">Weight: {weight}</p>
                      <p className="text-xs font-mono font-semibold text-[#123D24] mt-1">₹{itemPrice} each</p>
                    </div>

                    <div className="flex items-center border border-[#123D24]/20 rounded-lg text-xs">
                      <button
                        onClick={() => updateQuantity(product.id, Math.max(1, itemQty - 1))}
                        className="p-1.5 hover:bg-slate-100 text-[#123D24] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-mono font-bold text-[#123D24]">{itemQty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, itemQty + 1)}
                        className="p-1.5 hover:bg-slate-100 text-[#123D24] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-sm text-[#123D24] tabular-nums shrink-0 w-16 text-right">
                      ₹{itemPrice * itemQty}
                    </span>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#123D24]/10 space-y-6">
            <h2 className="text-base font-bold text-[#123D24] border-b border-[#123D24]/10 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-[#5D675A]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-[#123D24]">₹{safeSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-mono font-bold text-[#56783B]">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-3 border-t border-[#123D24]/10 flex justify-between font-bold text-base text-[#123D24]">
                <span>Total Amount</span>
                <span className="font-mono text-xl">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
