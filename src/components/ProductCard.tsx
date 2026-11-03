import React from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { addToCart, items } = useCart();

  const inCart = items.find((i) => i.product.id === product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#123D24]/10 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image Slot */}
      <div
        onClick={() => navigate(`/product/${product.slug}`)}
        className="relative aspect-4/3 w-full bg-[#FFFDF7] p-6 flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <ProductImage
          src={product.images && product.images.length > 0 ? product.images[0] : '/assets/panjiri-pouch.svg'}
          alt={`${product.name} (${product.packageWeight || product.weight || '500g'}) - Pure Traditional Indian Food Packaging`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Subtle Single Text Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.discountPercent ? (
            <span className="text-[11px] font-bold text-[#C76525] bg-[#FFF9E9] px-2 py-0.5 rounded border border-[#C76525]/20 font-mono">
              {product.discountPercent}% OFF
            </span>
          ) : null}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#0B2516]/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-[11px] font-semibold text-[#56783B] uppercase tracking-wider">
            {product.category}
          </div>

          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="text-base font-bold text-[#123D24] mt-1 cursor-pointer hover:text-[#56783B] transition-colors line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#5D675A] mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="text-xs text-[#5D675A] mt-2 font-medium">
            <span>Pack: {product.packageWeight}</span>
            <span className="mx-1.5 text-[#123D24]/30">·</span>
            <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-[#123D24]/10 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-[#123D24] tabular-nums">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-mono text-[#5D675A] line-through tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : inCart
                ? 'bg-[#56783B] text-white hover:bg-[#435E2D]'
                : 'bg-[#123D24] text-[#FFF9E9] hover:bg-[#0E2E1B]'
            }`}
            aria-label={`Add ${product.name} to bag`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added ({inCart.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
