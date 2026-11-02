import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, navigate }) => {
  const { items, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  // Safe Math Guards preventing NaN
  const safeTotalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  
  const safeSubtotal = items.reduce((acc, item) => {
    const price = Number(item.product?.price) || Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - safeSubtotal);
  const freeShippingProgress = Math.min(100, (safeSubtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#123D24]">Shopping Bag</h2>
              <span className="text-xs font-mono font-bold bg-[#123D24]/10 text-[#123D24] px-2 py-0.5 rounded-full">
                {safeTotalItems} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-[#FFFDF7] border-b border-slate-100 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-slate-600 font-medium mb-1.5">
                Add <strong className="text-[#123D24]">₹{remainingForFreeShipping}</strong> more for free local delivery
              </p>
            ) : (
              <p className="text-emerald-700 font-bold mb-1.5 flex items-center gap-1">
                🎉 You qualify for FREE local delivery!
              </p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#123D24] h-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-[#123D24]">Your bag is currently empty</p>
                <button
                  onClick={() => { onClose(); navigate('/shop'); }}
                  className="px-4 py-2 bg-[#123D24] text-white text-xs font-bold rounded-lg hover:bg-[#0E2E1B] transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const itemQty = Number(quantity) || 1;
                const itemPrice = Number(product?.price) || 0;
                const weight = product?.weight || product?.packageWeight || '500g';

                return (
                  <div key={product?.id || Math.random()} className="pt-4 first:pt-0 flex gap-4">
                    <img
                      src={product?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                      alt={product?.name || 'Product'}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs font-bold text-[#123D24] truncate">{product?.name}</h3>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">Weight: {weight}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-200 rounded-lg text-xs">
                          <button
                            onClick={() => updateQuantity(product.id, Math.max(1, itemQty - 1))}
                            className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-semibold text-[#123D24]">{itemQty}</span>
                          <button
                            onClick={() => updateQuantity(product.id, itemQty + 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <span className="font-mono font-bold text-xs text-[#123D24]">
                          ₹{itemPrice * itemQty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-[#FFFDF7] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Bag Subtotal</span>
                  <span className="font-mono font-bold text-[#123D24]">₹{safeSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Delivery Charges</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#123D24]">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base">₹{safeSubtotal}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onClose(); navigate('/cart'); }}
                  className="w-full py-3 px-3 border border-[#123D24] text-[#123D24] font-bold text-xs rounded-xl hover:bg-[#123D24]/5 transition-colors cursor-pointer"
                >
                  View Full Cart
                </button>
                <button
                  onClick={() => { onClose(); navigate('/checkout'); }}
                  className="w-full py-3 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>WhatsApp Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
