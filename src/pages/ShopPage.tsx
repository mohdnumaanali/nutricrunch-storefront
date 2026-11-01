import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  products: Product[];
  navigate: (path: string) => void;
  initialCategory?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  navigate,
  initialCategory = 'All'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const categories = useMemo(() => {
    const dynamicCats = Array.from(new Set(products.map((p) => p.category?.trim()).filter(Boolean)));
    return ['All', ...dynamicCats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="text-xs font-semibold text-[#56783B] uppercase tracking-wider">
          Store Catalog
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123D24] mt-1">
          Shop All Real Food Products
        </h1>
        <p className="text-xs sm:text-sm text-[#5D675A] mt-1">
          Handcrafted in small batches with genuine natural ingredients. Delivered fresh in Warangal & across India.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#123D24]/10 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF9E9] rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                  : 'text-[#20251F]/80 hover:text-[#123D24] hover:bg-[#F5ECCE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Area */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D675A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, ingredients..."
              className="w-full pl-9 pr-3 py-2 bg-[#FFF9E9] border border-[#123D24]/15 rounded-xl text-xs text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#5D675A]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FFF9E9] border border-[#123D24]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#123D24] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-[#123D24]/10">
          <div className="w-16 h-16 mx-auto bg-[#FFF9E9] rounded-full flex items-center justify-center text-[#5D675A]">
            <Filter className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-base font-bold text-[#123D24]">No products match your criteria</h3>
          <p className="text-xs text-[#5D675A] max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setSortBy('default');
            }}
            className="px-4 py-2 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-lg hover:bg-[#0E2E1B] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};
