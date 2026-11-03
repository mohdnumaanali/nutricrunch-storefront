import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Heart,
  Leaf,
  HelpCircle,
  Send,
  Star,
  MessageSquare,
  MessageSquareHeart,
  X,
  MapPin,
  Check
} from 'lucide-react';
import { Product, CustomerReview } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import {
  getStoredReviews,
  addStoredReview,
  REVIEWS_UPDATED_EVENT,
  DEFAULT_CUSTOMER_REVIEWS
} from '../utils/reviewStorage';
import { SEOHead, generateLocalBusinessSchema } from '../components/SEOHead';

interface HomePageProps {
  products: Product[];
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ products, navigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Customer Reviews State - Loaded from localStorage first for instant display
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    return getStoredReviews();
  });

  // 'Leave a Review' Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    location: '',
    rating: 5,
    comment: '',
    productName: 'NutriCrunch Dry Fruits Panjiri'
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync reviews with backend and listen to storage events
  useEffect(() => {
    const fetchServerReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
          }
        }
      } catch (err) {
        // LocalStorage fallback already active
      }
    };

    fetchServerReviews();

    const handleReviewsUpdate = (e: any) => {
      if (e.detail?.reviews) {
        setReviews(e.detail.reviews);
      } else {
        setReviews(getStoredReviews());
      }
    };

    window.addEventListener(REVIEWS_UPDATED_EVENT, handleReviewsUpdate as EventListener);
    window.addEventListener('storage', (e) => {
      if (e.key === 'nutricrunch_customer_reviews') {
        setReviews(getStoredReviews());
      }
    });

    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, handleReviewsUpdate as EventListener);
    };
  }, []);

  // Single source of truth: Dynamic hero product fetched directly from database
  const heroProduct = useMemo(() => {
    return products.find((p) => p.isFeatured) || products[0];
  }, [products]);

  // Dynamic customer reviews to showcase in the Customer Feedback & Reviews section
  const displayReviews = useMemo(() => {
    return reviews.slice(0, 3);
  }, [reviews]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterConsent) return;
    setNewsletterStatus('Thank you for subscribing to NutriCrunch food stories and seasonal batch releases!');
    setNewsletterEmail('');
  };

  const ingredientsList = [
    {
      name: 'Pure Cow Bilona Desi Ghee',
      desc: 'Slowly prepared using traditional curd-churning methods. Imparts rich natural aroma and healthy fats without industrial hydrogenated oils.',
      category: 'Healthy Fats'
    },
    {
      name: 'California Almonds & Cashews',
      desc: 'Whole, hand-sorted crunchy nuts rich in plant protein, vitamin E, and dietary fiber, roasted gently to golden crispness.',
      category: 'Nuts & Seeds'
    },
    {
      name: 'Cold-Pressed Coconut Oil',
      desc: 'Pure, unrefined edible coconut oil extracted without chemical solvents or heat. 100% Palm Oil Free.',
      category: 'Snack Cooking Oil'
    },
    {
      name: 'Raw Nendran Plantains',
      desc: 'Sourced directly from trusted regional farms, sliced thin and cooked fresh for authentic Kerala-style crunch.',
      category: 'Natural Produce'
    },
    {
      name: 'Organic Unrefined Jaggery',
      desc: 'Pure, chemical-free gur containing natural minerals and iron. Zero refined white sugar or artificial sweeteners.',
      category: 'Natural Sweetener'
    },
    {
      name: 'Lotus Seeds & Green Cardamom',
      desc: 'Crisp roasted phool makhana and hand-crushed whole green cardamom pods for delicate fragrance and gut comfort.',
      category: 'Botanical Spices'
    }
  ];

  const handleOpenReviewModal = () => {
    setReviewFeedback(null);
    setReviewForm({
      name: '',
      location: '',
      rating: 5,
      comment: '',
      productName: 'NutriCrunch Dry Fruits Panjiri'
    });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.location.trim() || !reviewForm.comment.trim()) {
      setReviewFeedback({
        type: 'error',
        message: 'Please provide your name, location, and feedback comment.'
      });
      return;
    }

    setIsSubmittingReview(true);
    setReviewFeedback(null);

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: reviewForm.name.trim(),
      location: reviewForm.location.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      verified: true,
      productName: reviewForm.productName,
      createdAt: new Date().toISOString(),
      status: 'published'
    };

    // 1. Instant LocalStorage Persistence
    const updated = addStoredReview(newReview);
    setReviews(updated);

    // 2. Server Database Persistence
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setReviewFeedback({
          type: 'success',
          message: 'Thank you! Your feedback has been published and saved successfully.'
        });
      } else {
        setReviewFeedback({
          type: 'success',
          message: 'Thank you! Your feedback has been saved to your local storage.'
        });
      }
    } catch {
      setReviewFeedback({
        type: 'success',
        message: 'Thank you! Your feedback has been saved locally.'
      });
    } finally {
      setIsSubmittingReview(false);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewFeedback(null);
      }, 1500);
    }
  };

  const faqs = [
    {
      q: 'Do you deliver in Warangal, Hanamkonda, and Kazipet?',
      a: 'Yes! We are locally based in Hanamkonda and provide fast, direct express delivery across the entire Tri-Cities area (PIN codes: 506001, 506002, 506003, 506004, 506007, 506009, 506011, 506015). Orders above ₹499 enjoy 100% free delivery.'
    },
    {
      q: 'Are any preservatives, palm oil, or artificial colors added?',
      a: 'Never. NutriCrunch operates on our strict creed: "Real Ingredients. Honest Goodness." Our banana chips are cooked exclusively in pure cold-pressed coconut oil (zero palm oil), and our panjiri is roasted in pure bilona cow ghee with unrefined jaggery.'
    },
    {
      q: 'How long does the Dry Fruits Panjiri stay fresh?',
      a: 'Our Dry Fruits Panjiri stays fresh for 4 months when kept sealed in its airtight pouch or stored in an airtight glass/steel container in a cool, dry place away from direct sunlight. Do not refrigerate.'
    },
    {
      q: 'Can I pay via Cash on Delivery (COD) or UPI?',
      a: 'Yes, we gladly accept Cash on Delivery upon arrival at your doorstep, as well as instant secure online payments via UPI, Google Pay, PhonePe, Paytm, and Debit/Credit cards.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Dynamic SEO, Social Preview & Local Business Structured Data */}
      <SEOHead
        title="NutriCrunch™ | Authentic Homemade Panjiri & Kerala Banana Chips"
        description="Buy authentic homemade dry fruits panjiri slow-roasted in pure cow bilona ghee & crispy banana chips cooked in cold-pressed coconut oil. Express delivery in Warangal & across India."
        keywords="homemade panjiri online, authentic dry fruit panjiri, bilona ghee panjiri, kerala banana chips coconut oil, postpartum panjiri warangal, hanamkonda snacks, healthy indian snacks"
        canonicalPath="/"
        ogType="website"
        jsonLd={generateLocalBusinessSchema()}
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] to-[#FFF9E9] pt-8 pb-16 border-b border-[#123D24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#56783B]">
                <Leaf className="w-4 h-4 text-[#56783B]" />
                <span>Small Bites, Big Nutrition!</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#123D24] tracking-tight leading-[1.12]">
                Real Ingredients. <br />
                <span className="text-[#C76525]">Honest Goodness.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#20251F]/80 max-w-xl leading-relaxed">
                Wholesome artisanal dry fruits panjiri slow-roasted in pure cow desi ghee, and crispy Kerala-style banana chips cooked in cold-pressed coconut oil. No shortcuts, no palm oil, no artificial preservatives.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="px-6 py-3.5 bg-[#123D24] text-[#FFF9E9] text-sm font-bold rounded-xl hover:bg-[#0E2E1B] transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate('/ingredients')}
                  className="px-6 py-3.5 bg-transparent border-2 border-[#123D24] text-[#123D24] text-sm font-bold rounded-xl hover:bg-[#F5ECCE] transition-colors"
                >
                  Explore Our Ingredients
                </button>
              </div>

              {/* Trust Callout Strip */}
              <div className="pt-6 border-t border-[#123D24]/10 grid grid-cols-3 gap-4 text-xs font-semibold text-[#123D24]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#56783B] shrink-0" />
                  <span>Pure Cow Desi Ghee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#56783B] shrink-0" />
                  <span>Zero Palm Oil</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#56783B] shrink-0" />
                  <span>Warangal Local Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Visual Card (Dynamically bound to database product) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-white p-6 sm:p-8 border border-[#123D24]/10 shadow-lg">
                <div className="aspect-4/3 rounded-2xl bg-[#FFFDF7] p-4 flex items-center justify-center overflow-hidden">
                  <ProductImage
                    src={heroProduct?.images && heroProduct.images.length > 0 ? heroProduct.images[0] : undefined}
                    alt={heroProduct?.name || 'NutriCrunch Featured Delicacy'}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#56783B] uppercase tracking-wider">
                      Featured Delicacy
                    </span>
                    <h3 className="text-lg font-bold text-[#123D24]">
                      {heroProduct ? `${heroProduct.name} (${heroProduct.packageWeight})` : 'NutriCrunch Panjiri'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-[#123D24] tabular-nums">
                      ₹{heroProduct?.price ?? 799}
                    </span>
                    {heroProduct?.originalPrice && heroProduct.originalPrice > heroProduct.price && (
                      <span className="block text-xs font-mono text-[#5D675A] line-through tabular-nums">
                        ₹{heroProduct.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(heroProduct ? `/product/${heroProduct.slug}` : '/shop')}
                  className="w-full mt-4 py-3 bg-[#C76525] text-white text-xs font-bold rounded-xl hover:bg-[#A95119] transition-colors text-center shadow-xs cursor-pointer"
                >
                  View Product Details & Ingredients
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED PRODUCTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
              Handcrafted in Small Batches
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D24] mt-1">
              Featured Food Products
            </h2>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123D24] hover:text-[#56783B] transition-colors group"
          >
            <span>Browse Complete Range</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}

          {/* Sourcing Promise Card */}
          <div className="bg-[#123D24] text-[#FFF9E9] rounded-2xl p-8 flex flex-col justify-between border border-[#0B2516]">
            <div className="space-y-4">
              <span className="inline-block p-3 bg-[#FFF9E9]/10 rounded-xl text-[#D8B84B]">
                <Heart className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-[#FFF9E9]">
                Clean Label Transparency
              </h3>
              <p className="text-xs text-[#FFF9E9]/80 leading-relaxed">
                Every single ingredient on our packaging is verified. No hidden palm oil, no artificial flavor enhancers, and no unrefined shortcuts.
              </p>
            </div>

            <div className="pt-6 border-t border-[#FFF9E9]/10">
              <button
                onClick={() => navigate('/ingredients')}
                className="w-full py-2.5 px-4 bg-[#FFF9E9] text-[#123D24] text-xs font-bold rounded-lg hover:bg-[#F5ECCE] transition-colors text-center"
              >
                Read Ingredients Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CUSTOMER FEEDBACK & REVIEWS (Replaces Explore by Culinary Category) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#123D24]/10 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10">
          
          {/* Section Header: 'Loved by Local Food Lovers' + Overall Rating Badge + Share Feedback Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#123D24]/10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#56783B]">
                <MessageSquareHeart className="w-4 h-4 text-[#C76525]" />
                <span>Verified Customer Testimonials</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123D24] tracking-tight">
                Loved by Local Food Lovers
              </h2>
              
              {/* Overall Rating Badge */}
              <div className="inline-flex flex-wrap items-center gap-2.5 bg-[#FFF9E9] border border-[#D8B84B]/40 px-3.5 py-1.5 rounded-full shadow-2xs">
                <span className="font-extrabold text-sm text-[#123D24] font-mono">4.9</span>
                <div className="flex items-center gap-0.5 text-[#D8B84B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D8B84B] text-[#D8B84B]" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#5D675A]">
                  based on 120+ local orders
                </span>
              </div>
            </div>

            {/* 'Leave a Review' Action Button */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={handleOpenReviewModal}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-all shadow-xs group cursor-pointer"
              >
                <Star className="w-4 h-4 text-[#D8B84B] fill-[#D8B84B] group-hover:scale-110 transition-transform" />
                <span>Share Your Feedback</span>
              </button>
            </div>
          </div>

          {/* Review Cards: 3 clean testimonial cards matching the NutriCrunch theme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-[#123D24]/10 shadow-xs hover:border-[#123D24]/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  {/* 5 Gold Star Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#D8B84B]">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D8B84B] text-[#D8B84B]" />
                      ))}
                    </div>
                    {rev.productName && (
                      <span className="text-[10px] font-semibold text-[#C76525] bg-[#FFF9E9] px-2 py-0.5 rounded border border-[#C76525]/15">
                        {rev.productName}
                      </span>
                    )}
                  </div>

                  {/* Customer Quote praising pure desi ghee panjiri and crispy coconut oil banana chips */}
                  <p className="text-xs sm:text-sm text-[#20251F]/90 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer: Customer Name, Location Badge & Green 'Verified Buyer' Tag */}
                <div className="pt-4 border-t border-[#123D24]/10 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#123D24] truncate">
                      {rev.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#5D675A] mt-0.5">
                      <MapPin className="w-3 h-3 text-[#56783B] shrink-0" />
                      <span>{rev.location}</span>
                    </div>
                  </div>

                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. INGREDIENTS SHOWCASE */}
      <section className="bg-[#FFFDF7] py-16 border-y border-[#123D24]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
              Full Ingredient Transparency
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D24] mt-1">
              Nothing Hidden. Nothing Artificial.
            </h2>
            <p className="text-xs sm:text-sm text-[#5D675A] mt-2 leading-relaxed">
              We list every single ingredient because we are proud of every single source.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredientsList.map((ing, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl border border-[#123D24]/10 shadow-xs space-y-2 hover:border-[#56783B]/40 transition-colors"
              >
                <span className="text-[11px] font-bold uppercase text-[#56783B] tracking-wide">
                  {ing.category}
                </span>
                <h4 className="font-bold text-base text-[#123D24]">{ing.name}</h4>
                <p className="text-xs text-[#5D675A] leading-relaxed">{ing.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/ingredients')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors"
            >
              <span>Explore Ingredients & Quality Testing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. BRAND STORY & LOCAL PROUD HERITAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#123D24] text-[#FFF9E9] rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#0B2516]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D8B84B]">
              <Sparkles className="w-4 h-4 text-[#D8B84B]" />
              <span>Our Brand Origin</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFF9E9] tracking-tight leading-tight">
              Rooted in Traditional Kitchens, <br />
              Prepared for Modern Lives.
            </h2>

            <p className="text-sm sm:text-base text-[#FFF9E9]/80 leading-relaxed">
              NutriCrunch was founded in Hanamkonda, Warangal, with a simple uncompromising principle: food should be made with honest, recognizable ingredients that nourish without compromise. 
            </p>

            <p className="text-sm text-[#FFF9E9]/80 leading-relaxed">
              When market shelves became crowded with snacks fried in cheap palm oil and sweetened with artificial glucose syrups, we chose the slower, honorable path. Our panjiri is made with pure cow ghee and organic jaggery; our banana chips are cooked purely in cold-pressed coconut oil. Real food, pure nutrition.
            </p>

            <div className="pt-4 flex flex-wrap gap-6 text-xs text-[#FFF9E9]/90 font-medium">
              <div>
                <strong className="block text-lg font-mono text-[#D8B84B]">100%</strong>
                <span>Preservative Free</span>
              </div>
              <div>
                <strong className="block text-lg font-mono text-[#D8B84B]">0%</strong>
                <span>Palm Oil or Vanaspati</span>
              </div>
              <div>
                <strong className="block text-lg font-mono text-[#D8B84B]">Small Batch</strong>
                <span>Hygienic Roasting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-[#56783B]">
            Questions & Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D24] mt-1">
            Common Customer Inquiries
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#123D24]/10 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#123D24] hover:bg-[#FFFDF7] transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-lg text-[#56783B] font-mono">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-[#5D675A] leading-relaxed border-t border-[#123D24]/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. NEWSLETTER SIGNUP WITH CONSENT */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F5ECCE] rounded-3xl p-8 sm:p-10 border border-[#123D24]/10 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-[#123D24]">
            Receive Fresh Batch Alerts & Authentic Recipes
          </h3>
          <p className="text-xs sm:text-sm text-[#5D675A] max-w-lg mx-auto">
            Subscribe for seasonal small-batch releases, festival special packs, and traditional healthy eating tips. We respect your inbox and never send spam.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto space-y-3 pt-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#123D24]/20 bg-white text-xs text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
              />
              <button
                type="submit"
                disabled={!newsletterConsent}
                className="px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors disabled:opacity-50 shrink-0"
              >
                Subscribe
              </button>
            </div>

            <label className="flex items-center justify-center gap-2 text-[11px] text-[#5D675A] cursor-pointer">
              <input
                type="checkbox"
                checked={newsletterConsent}
                onChange={(e) => setNewsletterConsent(e.target.checked)}
                className="rounded border-[#123D24]/30 text-[#123D24] focus:ring-[#123D24]"
              />
              <span>I consent to receiving occasional email updates from NutriCrunch.</span>
            </label>

            {newsletterStatus && (
              <p className="text-xs font-semibold text-[#56783B] pt-2">{newsletterStatus}</p>
            )}
          </form>
        </div>
      </section>

      {/* ================= MODAL: SHARE YOUR FEEDBACK ================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#123D24]/10 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#123D24]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FFF9E9] text-[#123D24] rounded-xl border border-[#123D24]/10">
                  <Star className="w-5 h-5 text-[#D8B84B] fill-[#D8B84B]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#123D24]">
                    Share Your Feedback
                  </h3>
                  <p className="text-xs text-[#5D675A]">
                    Loved by local families in Warangal, Hanamkonda & Kazipet
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 text-[#5D675A] hover:text-[#123D24] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close review modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Feedback Alert */}
            {reviewFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  reviewFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}
              >
                {reviewFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{reviewFeedback.message}</span>
              </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="space-y-5 text-xs">
              
              {/* 1. Rating (1 to 5 Stars) */}
              <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#123D24]/10 space-y-2 text-center">
                <label className="block font-bold text-xs text-[#123D24]">
                  Rate Your Experience *
                </label>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isSelected = (hoverRating ?? reviewForm.rating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: starVal })}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-[#D8B84B] hover:scale-125 transition-transform focus:outline-none cursor-pointer"
                        title={`Rate ${starVal} Star${starVal > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isSelected
                              ? 'fill-[#D8B84B] text-[#D8B84B]'
                              : 'text-gray-300 fill-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] font-bold text-[#56783B]">
                  {reviewForm.rating === 5 && '★★★★★ 5.0 - Exceptional (Loved the Taste & Freshness)'}
                  {reviewForm.rating === 4 && '★★★★☆ 4.0 - Very Good'}
                  {reviewForm.rating === 3 && '★★★☆☆ 3.0 - Good'}
                  {reviewForm.rating === 2 && '★★☆☆☆ 2.0 - Average'}
                  {reviewForm.rating === 1 && '★☆☆☆☆ 1.0 - Needs Improvement'}
                </div>
              </div>

              {/* 2. Customer Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#123D24] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    required
                    placeholder="e.g. Sravanthi P. or Rahul M."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] bg-white focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#123D24] mb-1.5">
                    Location / Area *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                      required
                      placeholder="e.g. Hanamkonda or Kazipet"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] bg-white focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-[#56783B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* 3. Product Selection */}
              <div>
                <label className="block font-bold text-[#123D24] mb-1.5">
                  Item Enjoyed
                </label>
                <select
                  value={reviewForm.productName}
                  onChange={(e) => setReviewForm({ ...reviewForm, productName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] bg-white focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                >
                  <option value="NutriCrunch Dry Fruits Panjiri">
                    NutriCrunch Dry Fruits Panjiri (Pure Cow Desi Ghee)
                  </option>
                  <option value="NutriCrunch Banana Chips">
                    NutriCrunch Banana Chips (Cold-Pressed Coconut Oil)
                  </option>
                  <option value="Panjiri & Banana Chips Combo">
                    Both / Family Snack Box
                  </option>
                </select>
              </div>

              {/* 4. Review Text */}
              <div>
                <label className="block font-bold text-[#123D24] mb-1.5">
                  Your Review & Comments *
                </label>
                <textarea
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  placeholder="Tell us what you liked about the aroma of pure desi ghee, the crispiness of cold-pressed coconut oil, or your overall experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] bg-white focus:ring-2 focus:ring-[#123D24] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#123D24]/10">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5D675A] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#FFF9E9] border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
