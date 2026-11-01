import React from 'react';
import { Leaf, ShieldCheck, Check, X, AlertTriangle, ArrowRight } from 'lucide-react';

interface IngredientsPageProps {
  navigate: (path: string) => void;
}

export const IngredientsPage: React.FC<IngredientsPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-[#56783B]">
          Product Transparency & Quality
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123D24]">
          Verified Ingredients & Honest Sourcing
        </h1>
        <p className="text-xs sm:text-sm text-[#5D675A] leading-relaxed">
          We believe you have an absolute right to know every ingredient that enters your home. Here is our complete, transparent sourcing disclosure.
        </p>
      </div>

      {/* Product 1: Dry Fruits Panjiri Breakdown */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#123D24]/10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D24]/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase text-[#56783B]">Product 01</span>
            <h2 className="text-2xl font-bold text-[#123D24] mt-0.5">
              NutriCrunch Dry Fruits Panjiri (500g)
            </h2>
          </div>
          <button
            onClick={() => navigate('/product/nutricrunch-dry-fruits-panjiri')}
            className="px-4 py-2 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-lg self-start sm:self-auto hover:bg-[#0E2E1B]"
          >
            Order Panjiri (₹799)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123D24] uppercase tracking-wider">
              Exact Ingredients Used
            </h3>
            <ul className="space-y-2 text-xs text-[#20251F]">
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>California Almonds (Badam):</strong> Hand-sorted, gently roasted for crisp bite and natural healthy fats.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Cashew Nuts (Kaju):</strong> Creamy roasted Indian cashews providing smooth natural richness.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Green Pistachios (Pista):</strong> Natural Iranian pistachios roasted with zero added food coloring.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Pure Cow Bilona Desi Ghee:</strong> Churned from whole curd, roasted slow to release rich golden nutty aroma.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Lotus Seeds (Phool Makhana):</strong> Puffed water lily seeds providing light crunch and dietary fiber.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Melon Seeds (Charmagaz):</strong> Cleaned melon seeds rich in natural plant protein and zinc.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Organic Unrefined Jaggery (Gur):</strong> Chemical-free traditional jaggery providing mild caramel sweetness.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Stone-Ground Whole Wheat Flour (Atta):</strong> Coarsely stone-ground wheat flour slow-roasted until golden brown.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Edible Gum (Gondh) & Green Cardamom (Elaichi):</strong> Fried edible gum for authentic texture, cardamom for digestive aroma.
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123D24] uppercase tracking-wider">
              Allergens & Preparation
            </h3>
            
            <div className="p-4 bg-[#F5ECCE]/50 rounded-xl border border-[#123D24]/10 text-xs space-y-2">
              <strong className="text-[#123D24] block">Allergen Declaration:</strong>
              <p className="text-[#5D675A] leading-relaxed">
                Contains Tree Nuts (Almonds, Cashews, Pistachios), Milk Solids (Pure Cow Desi Ghee), and Gluten (Wheat).
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#123D24]/10 text-xs space-y-2">
              <strong className="text-[#123D24] block">Storage & Shelf Life:</strong>
              <p className="text-[#5D675A] leading-relaxed">
                4 Months from the packaging date when stored in an airtight container in a dry place. Do not refrigerate. Use a dry spoon.
              </p>
            </div>

            <div className="p-4 bg-[#FFF9E9] rounded-xl border border-[#123D24]/10 text-xs space-y-2">
              <strong className="text-[#56783B] block font-bold">100% Honest Transparency Note:</strong>
              <p className="text-[#5D675A] leading-relaxed">
                NutriCrunch does not claim panjiri is a medical miracle or clinical cure for medical conditions. It is a time-tested, nutrient-dense traditional food crafted to provide wholesome sustained energy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product 2: Banana Chips Breakdown */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#123D24]/10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D24]/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase text-[#56783B]">Product 02</span>
            <h2 className="text-2xl font-bold text-[#123D24] mt-0.5">
              NutriCrunch Banana Chips (250g)
            </h2>
          </div>
          <button
            onClick={() => navigate('/product/nutricrunch-banana-chips')}
            className="px-4 py-2 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-lg self-start sm:self-auto hover:bg-[#0E2E1B]"
          >
            Order Banana Chips (₹199)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123D24] uppercase tracking-wider">
              Exact Ingredients Used
            </h3>
            <ul className="space-y-2 text-xs text-[#20251F]">
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Fresh Raw Nendran Bananas (Plantains):</strong> Sourced raw and green, sliced precisely to optimal thin thickness.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Pure Cold-Pressed Coconut Oil:</strong> Extracted without heat or solvents. Gives authentic Kerala aroma without oily residue.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Rock Salt (Sendha Namak):</strong> Unrefined mineral rock salt sprinkled delicately for clean seasoning.
                </div>
              </li>
              <li className="p-2.5 bg-[#FFFDF7] rounded-lg border border-[#123D24]/10 flex items-start gap-2">
                <span className="font-bold text-[#56783B]">•</span>
                <div>
                  <strong>Pure Organic Turmeric Powder:</strong> High-curcumin turmeric powder for authentic golden color and mild warmth.
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123D24] uppercase tracking-wider">
              Allergens & Preparation
            </h3>
            
            <div className="p-4 bg-[#F5ECCE]/50 rounded-xl border border-[#123D24]/10 text-xs space-y-2">
              <strong className="text-[#123D24] block">Allergen Declaration:</strong>
              <p className="text-[#5D675A] leading-relaxed">
                100% Vegan & Gluten Free. Packed in a facility that also processes tree nuts.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#123D24]/10 text-xs space-y-2">
              <strong className="text-[#123D24] block">Zero Palm Oil Certification:</strong>
              <p className="text-[#5D675A] leading-relaxed">
                We test every batch of cooking oil. We guarantee zero palm oil, zero cottonseed oil, and zero synthetic anti-foaming agents.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table: Real Food vs Commercial Shortcuts */}
      <div className="bg-white rounded-3xl p-8 border border-[#123D24]/10 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[#123D24]">
          The NutriCrunch Standard vs Commercial Market Snacks
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#123D24]/10 text-[#56783B] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Element</th>
                <th className="py-3 px-4 font-bold text-[#123D24]">NutriCrunch Foods</th>
                <th className="py-3 px-4 font-bold text-gray-500">Typical Commercial Brands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#123D24]/10">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#123D24]">Cooking / Roasting Fat</td>
                <td className="py-3 px-4 text-[#56783B] font-semibold">
                  Pure Bilona Cow Ghee & Cold-Pressed Coconut Oil
                </td>
                <td className="py-3 px-4 text-gray-500">
                  Refined Palm Olein or Hydrogenated Vegetable Fat (Vanaspati)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#123D24]">Sweetening Agent</td>
                <td className="py-3 px-4 text-[#56783B] font-semibold">
                  Natural Organic Unrefined Jaggery (Gur)
                </td>
                <td className="py-3 px-4 text-gray-500">
                  Refined White Sulfur Sugar or High-Fructose Corn Syrup
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#123D24]">Dry Fruits Density</td>
                <td className="py-3 px-4 text-[#56783B] font-semibold">
                  Generous whole almonds, cashews, pistachios, melon seeds
                </td>
                <td className="py-3 px-4 text-gray-500">
                  Small peanut bits with heavy flour filler
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#123D24]">Preservatives & Colors</td>
                <td className="py-3 px-4 text-[#56783B] font-semibold">
                  Zero Preservatives, Zero Synthetic Dyes
                </td>
                <td className="py-3 px-4 text-gray-500">
                  TBHQ, BHA antioxidants, artificial yellow food colors
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
