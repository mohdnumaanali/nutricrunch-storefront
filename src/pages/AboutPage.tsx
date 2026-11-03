import React from 'react';
import { ShieldCheck, Heart, Sparkles, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Dynamic SEO & Story Metadata */}
      <SEOHead
        title="Our Story & Philosophy | NutriCrunch™ Artisanal Foods"
        description="Learn about NutriCrunch's roots in Hanamkonda & Warangal. Handcrafting pure cow bilona ghee panjiri and cold-pressed coconut oil snacks with zero shortcuts."
        keywords="about nutricrunch, hanamkonda artisanal food, warangal traditional snacks, bilona ghee panjiri story, zero palm oil snacks"
        canonicalPath="/about"
        ogType="article"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Our Story', url: '/about' }
        ]}
      />
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="text-xs font-bold uppercase tracking-widest text-[#56783B]">
          Our Philosophy & Story
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#123D24] tracking-tight">
          Real Ingredients. <br />
          <span className="text-[#C76525]">Honest Goodness.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#5D675A] leading-relaxed">
          NutriCrunch was born from a conviction: the food we feed ourselves and our families should never be diluted with cheap fillers, industrial palm oil, or hidden chemical additives.
        </p>
      </div>

      {/* Origin Story Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#123D24]/10 shadow-xs space-y-6">
        <h2 className="text-2xl font-bold text-[#123D24]">
          Our Roots in Hanamkonda & Warangal
        </h2>
        <div className="prose text-xs sm:text-sm text-[#20251F]/90 space-y-4 leading-relaxed">
          <p>
            In the heart of Telangana, traditional household kitchens have passed down recipes of nutrient-dense panjiri and crisp savoury snacks for generations. These were foods prepared with utmost devotion—churning curd for pure cow bilona ghee, selecting the plumpest almonds, cracking fresh coconut, and grinding whole wheat on stones.
          </p>
          <p>
            Over recent decades, commercial food production replaced these pure traditions with hydrogenated fats (vanaspati), highly processed palm oil, and refined white sugars. Food lost its soul and its nourishment.
          </p>
          <p>
            NutriCrunch was created to reclaim this standard. We craft our foods in small, hygienic batches in Hanamkonda, following authentic regional recipes while upholding modern food safety standards.
          </p>
        </div>
      </div>

      {/* The 4 Non-Negotiable Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#123D24] text-center">
          Our Four Non-Negotiable Commitments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#123D24]/10 space-y-3">
            <span className="w-10 h-10 bg-[#123D24] text-[#D8B84B] rounded-xl flex items-center justify-center font-bold text-sm">
              01
            </span>
            <h3 className="font-bold text-base text-[#123D24]">100% Zero Palm Oil</h3>
            <p className="text-xs text-[#5D675A] leading-relaxed">
              We strictly forbid the use of palm oil, palm olein, or hydrogenated vegetable fats. Our banana chips are fried exclusively in cold-pressed coconut oil.
            </p>
          </div>

          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#123D24]/10 space-y-3">
            <span className="w-10 h-10 bg-[#123D24] text-[#D8B84B] rounded-xl flex items-center justify-center font-bold text-sm">
              02
            </span>
            <h3 className="font-bold text-base text-[#123D24]">Pure Cow Bilona Desi Ghee</h3>
            <p className="text-xs text-[#5D675A] leading-relaxed">
              Our dry fruits panjiri is slow-roasted in pure cow desi ghee. We never blend animal or artificial fat replacers.
            </p>
          </div>

          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#123D24]/10 space-y-3">
            <span className="w-10 h-10 bg-[#123D24] text-[#D8B84B] rounded-xl flex items-center justify-center font-bold text-sm">
              03
            </span>
            <h3 className="font-bold text-base text-[#123D24]">No Refined White Sugar</h3>
            <p className="text-xs text-[#5D675A] leading-relaxed">
              We sweeten our traditional panjiri exclusively with natural, chemical-free organic jaggery (gur), preserving mineral trace elements.
            </p>
          </div>

          <div className="bg-[#FFFDF7] p-6 rounded-2xl border border-[#123D24]/10 space-y-3">
            <span className="w-10 h-10 bg-[#123D24] text-[#D8B84B] rounded-xl flex items-center justify-center font-bold text-sm">
              04
            </span>
            <h3 className="font-bold text-base text-[#123D24]">Small-Batch Freshness</h3>
            <p className="text-xs text-[#5D675A] leading-relaxed">
              Instead of producing tons that sit on distributor shelves for a year with preservatives, we roast and pack in small batches for peak taste and natural crunch.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#123D24] text-[#FFF9E9] rounded-3xl p-8 sm:p-10 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">
          Taste the Difference of Real Ingredients
        </h3>
        <p className="text-xs sm:text-sm text-[#FFF9E9]/80 max-w-md mx-auto">
          Delivered fresh in Warangal, Hanamkonda, Kazipet and across India.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[#D8B84B] text-[#123D24] text-xs font-bold rounded-xl hover:bg-[#E5C766] transition-colors inline-flex items-center gap-2"
        >
          <span>Shop the NutriCrunch Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
