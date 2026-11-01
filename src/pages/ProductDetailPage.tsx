import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { useCart, getOrCreateSessionId } from '../context/CartContext';
import { ProductImage } from '../components/ProductImage';

interface ProductDetailPageProps {
  slug: string;
  products: Product[];
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  products,
  navigate
}) => {
  const { addToCart, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'nutrition' | 'storage'>('ingredients');

  useEffect(() => {
    const found = products.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setProduct(found);
      setSelectedImage(found.images[0] || '/assets/panjiri-pouch.svg');
      setQuantity(1);

      // Track product view event
      try {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'product_view',
            path: `/product/${found.slug}`,
            productId: found.id,
            productName: found.name,
            sessionId: getOrCreateSessionId()
          })
        }).catch(() => {});
      } catch {}
    }
  }, [slug, products]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#123D24]">Product Not Found</h2>
        <p className="text-xs text-[#5D675A]">
          The product you are looking for may have been updated or moved.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 bg-[#123D24] text-white text-xs font-bold rounded-lg hover:bg-[#0E2E1B]"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const inCart = items.find((i) => i.product.id === product.id);
  const isOutOfStock = product.stock <= 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#5D675A]">
        <button onClick={() => navigate('/')} className="hover:text-[#123D24]">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/shop')} className="hover:text-[#123D24]">
          Shop
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#123D24] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main 2-Column Split: Image Gallery Left & Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Gallery & Alternative Views */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-white rounded-3xl p-8 border border-[#123D24]/10 shadow-sm flex items-center justify-center overflow-hidden">
            <ProductImage
              src={selectedImage || (product.images && product.images[0]) || '/assets/panjiri-pouch.svg'}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnail Selectors */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl bg-white p-2 border-2 transition-all overflow-hidden ${
                    selectedImage === img
                      ? 'border-[#123D24] shadow-xs'
                      : 'border-[#123D24]/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  <ProductImage
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Local Dispatch Notice */}
          <div className="p-4 bg-[#F5ECCE]/50 rounded-2xl border border-[#123D24]/10 flex items-start gap-3 text-xs text-[#123D24]">
            <Truck className="w-4 h-4 text-[#56783B] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">
                Direct Dispatch from Hanamkonda Kitchen
              </strong>
              <span className="text-[#5D675A] text-[11.5px] mt-0.5 block leading-relaxed">
                Same-day / next-day delivery across Warangal, Hanamkonda & Kazipet. 100% Free delivery on orders ₹499+.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
              {product.category}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123D24] mt-1 tracking-tight">
              {product.name}
            </h1>

            {/* Price Snapshot */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-[#123D24] tabular-nums">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base font-mono text-[#5D675A] line-through tabular-nums">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-[#C76525] bg-[#FFF9E9] border border-[#C76525]/20 px-2 py-0.5 rounded font-mono">
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-[#5D675A] mt-1">Inclusive of all taxes.</p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#20251F]/90 leading-relaxed">
            {product.description}
          </p>

          {/* Package Weight & SKU Metadata */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#123D24]/10 text-xs">
            <div>
              <span className="text-[#5D675A] block">Net Package Weight:</span>
              <strong className="text-[#123D24] text-sm font-semibold">{product.packageWeight}</strong>
            </div>
            <div>
              <span className="text-[#5D675A] block">Stock Status:</span>
              <strong
                className={`text-sm font-semibold ${
                  product.stock > 0 ? 'text-[#56783B]' : 'text-rose-600'
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Temporarily Out of Stock'}
              </strong>
            </div>
          </div>

          {/* Quantity Stepper & Add to Bag / Buy Now */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#123D24]">Quantity:</span>
              <div className="flex items-center border border-[#123D24]/20 rounded-xl bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-[#123D24] hover:bg-[#F5ECCE] rounded-l-xl transition-colors disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-mono font-bold text-[#123D24] tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 text-[#123D24] hover:bg-[#F5ECCE] rounded-r-xl transition-colors disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : inCart
                    ? 'bg-[#56783B] text-white hover:bg-[#435E2D]'
                    : 'bg-[#123D24] text-[#FFF9E9] hover:bg-[#0E2E1B]'
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Bag ({inCart.quantity}) · Add More</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-6 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#1EBE5D] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                <span>Buy via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dietary Checkmarks */}
          <div className="p-4 bg-white rounded-2xl border border-[#123D24]/10 space-y-2">
            <span className="text-[11px] font-bold uppercase text-[#56783B] tracking-wider block">
              NutriCrunch Clean Quality Standards
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {product.dietary.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs text-[#123D24] bg-[#FFF9E9] border border-[#123D24]/15 px-2.5 py-1 rounded-md font-medium"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs: Ingredients / Allergens / Storage */}
          <div className="bg-white rounded-2xl border border-[#123D24]/10 overflow-hidden">
            <div className="flex border-b border-[#123D24]/10 bg-[#FFFDF7]">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${
                  activeTab === 'ingredients'
                    ? 'text-[#123D24] border-b-2 border-[#123D24] bg-white'
                    : 'text-[#5D675A] hover:text-[#123D24]'
                }`}
              >
                Ingredients ({product.ingredients.length})
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${
                  activeTab === 'nutrition'
                    ? 'text-[#123D24] border-b-2 border-[#123D24] bg-white'
                    : 'text-[#5D675A] hover:text-[#123D24]'
                }`}
              >
                Allergens & Notes
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${
                  activeTab === 'storage'
                    ? 'text-[#123D24] border-b-2 border-[#123D24] bg-white'
                    : 'text-[#5D675A] hover:text-[#123D24]'
                }`}
              >
                Shelf Life & Storage
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'ingredients' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#5D675A]">
                    Every verified ingredient present in this recipe:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[#20251F]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#56783B]" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-[#123D24] block font-semibold mb-1">
                      Allergen Declaration:
                    </strong>
                    <p className="text-[#5D675A] leading-relaxed">{product.allergenInfo}</p>
                  </div>
                  <div className="pt-2 border-t border-[#123D24]/10">
                    <strong className="text-[#123D24] block font-semibold mb-1">
                      Responsible Natural Food Note:
                    </strong>
                    <p className="text-[#5D675A] leading-relaxed">
                      NutriCrunch food products are wholesome traditional preparations. We do not make unverified medicinal or curative claims. Always consult a medical healthcare provider for specific clinical dietary requirements.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-[#123D24] block font-semibold mb-1">
                      Shelf Life:
                    </strong>
                    <p className="text-[#5D675A]">{product.shelfLife}</p>
                  </div>
                  <div>
                    <strong className="text-[#123D24] block font-semibold mb-1">
                      Storage Instructions:
                    </strong>
                    <p className="text-[#5D675A] leading-relaxed">
                      {product.storageInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
