import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqPageProps {
  navigate: (path: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ navigate }) => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const allFaqs = [
    {
      category: 'Delivery & Tri-Cities Coverage',
      q: 'Which areas do you deliver in locally?',
      a: 'We provide express local delivery directly across the Warangal, Hanamkonda, and Kazipet Tri-Cities area (PIN codes: 506001, 506002, 506003, 506004, 506007, 506009, 506011, 506015). We also ship to all major cities across India via reliable express couriers.'
    },
    {
      category: 'Delivery & Tri-Cities Coverage',
      q: 'What is the delivery fee and free shipping threshold?',
      a: 'For Warangal, Hanamkonda & Kazipet, delivery is completely FREE on orders above ₹499. For orders below ₹499, a nominal local dispatch fee of ₹40 applies. For the rest of India, shipping is ₹70, and free above ₹999.'
    },
    {
      category: 'Ingredients & Preparation',
      q: 'Is there any palm oil in your banana chips?',
      a: 'Never. NutriCrunch has a strict zero-palm-oil policy. Our banana chips are fried exclusively in pure cold-pressed coconut oil and delicately sprinkled with pure rock salt and turmeric.'
    },
    {
      category: 'Ingredients & Preparation',
      q: 'What kind of ghee is used in the Dry Fruits Panjiri?',
      a: 'We use pure cow bilona desi ghee made from curd churning. We do not use commercial butter oil or hydrogenated vegetable fat (vanaspati).'
    },
    {
      category: 'Ingredients & Preparation',
      q: 'Is there refined white sugar in the panjiri?',
      a: 'No. Our panjiri is sweetened solely with organic, chemical-free unrefined jaggery (gur), providing natural sweetness along with trace minerals.'
    },
    {
      category: 'Storage & Freshness',
      q: 'How should I store the Panjiri and Banana Chips?',
      a: 'Store both in an airtight container in a cool, dry place away from direct sunlight and humidity. Do not refrigerate the panjiri. Use a dry spoon for scooping.'
    },
    {
      category: 'Ordering & Payment',
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is supported for all local and national delivery addresses. You may pay in cash or via UPI scan upon arrival.'
    },
    {
      category: 'Ordering & Payment',
      q: 'How can I track my order once placed?',
      a: 'Visit the "Track Order" page from our header or footer, and enter your unique order reference number (e.g. NC-2026-1001) alongside your registered mobile number.'
    }
  ];

  const filtered = allFaqs.filter(
    (f) =>
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
          Help & Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123D24]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#5D675A]">
          Find answers about our real food ingredients, local Warangal delivery, and ordering.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D675A]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions or keywords..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#123D24]/15 rounded-xl text-xs text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
        />
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#123D24]/10 overflow-hidden shadow-xs"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#123D24] hover:bg-[#FFFDF7] transition-colors"
            >
              <span>{item.q}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-[#56783B] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#5D675A] shrink-0" />
              )}
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-xs text-[#5D675A] leading-relaxed border-t border-[#123D24]/5 pt-3">
                <span className="inline-block text-[10px] font-bold text-[#56783B] bg-[#FFF9E9] px-2 py-0.5 rounded mb-2">
                  {item.category}
                </span>
                <p>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-[#5D675A]">
          Have a different question?{' '}
          <button
            onClick={() => navigate('/contact')}
            className="font-bold text-[#123D24] hover:underline"
          >
            Contact our care team directly
          </button>
        </p>
      </div>
    </div>
  );
};
