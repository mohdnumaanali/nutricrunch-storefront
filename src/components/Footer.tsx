import React from 'react';
import { ShieldCheck, Truck, Sparkles, MapPin, Phone, Mail, ArrowUpRight, Instagram } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#123D24] text-[#FFF9E9] border-t border-[#0B2516]">
      {/* 3 Trust Pillars Bar */}
      <div className="border-b border-[#FFF9E9]/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#FFF9E9]/10 rounded-lg text-[#D8B84B] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFF9E9]">100% Real Ingredients</h4>
              <p className="text-xs text-[#FFF9E9]/70 mt-0.5">
                Pure cow bilona ghee, California almonds, and cold-pressed coconut oil. No palm oil or chemical preservatives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#FFF9E9]/10 rounded-lg text-[#D8B84B] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFF9E9]">Local Tri-Cities Express</h4>
              <p className="text-xs text-[#FFF9E9]/70 mt-0.5">
                Direct fresh dispatch across Warangal, Hanamkonda & Kazipet with same-day/next-day delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#FFF9E9]/10 rounded-lg text-[#D8B84B] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFF9E9]">Honest Goodness Guarantee</h4>
              <p className="text-xs text-[#FFF9E9]/70 mt-0.5">
                Small-batch hygienic production. What is written on our ingredients label is exactly what is inside.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="NutriCrunch"
                className="max-h-12 h-12 w-auto object-contain rounded-full bg-[#FFF9E9] p-0.5 shadow-sm"
              />
              <span className="font-serif text-2xl font-bold text-[#FFF9E9] tracking-tight">
                NutriCrunch
              </span>
            </div>
            <p className="text-sm text-[#FFF9E9]/80 max-w-sm leading-relaxed">
              Real Ingredients. Honest Goodness. Wholesome traditional dry fruits panjiri and crispy Kerala-style banana chips crafted with unwavering integrity.
            </p>
            
            <div className="space-y-2 text-xs text-[#FFF9E9]/80 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D8B84B] shrink-0" />
                <span>Shop #4, Sri Rama Towers, Main Road, Hanamkonda, Warangal, Telangana - 506001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D8B84B] shrink-0" />
                <a href="tel:+919154797936" className="hover:text-white font-mono tabular-nums">
                  +91 9154797936
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D8B84B] shrink-0" />
                <a href="mailto:care@nutricrunch.in" className="hover:text-white">
                  care@nutricrunch.in
                </a>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="pt-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#D8B84B] mb-2">
                Follow Us on Social Media
              </span>
              <a
                href="https://instagram.com/nutricrunch_wgl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#FFF9E9]/10 hover:bg-[#FFF9E9]/20 text-[#FFF9E9] rounded-lg text-xs font-semibold transition-all border border-[#FFF9E9]/15 group"
                aria-label="NutriCrunch on Instagram @nutricrunch_wgl"
              >
                <Instagram className="w-4 h-4 text-[#D8B84B] group-hover:scale-110 transition-transform" />
                <span>@nutricrunch_wgl</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#FFF9E9]/60 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#D8B84B] mb-3">
              Store Catalog
            </h5>
            <ul className="space-y-2 text-sm text-[#FFF9E9]/80">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">
                  Shop All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/product/nutricrunch-dry-fruits-panjiri')}
                  className="hover:text-white transition-colors"
                >
                  Dry Fruits Panjiri (500g)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/product/nutricrunch-banana-chips')}
                  className="hover:text-white transition-colors"
                >
                  Kerala Banana Chips (250g)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/track-order')} className="hover:text-white transition-colors">
                  Track My Order
                </button>
              </li>
            </ul>
          </div>

          {/* Brand & Sourcing */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#D8B84B] mb-3">
              Transparency
            </h5>
            <ul className="space-y-2 text-sm text-[#FFF9E9]/80">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  About Our Brand
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/ingredients')} className="hover:text-white transition-colors">
                  Ingredients & Quality
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faqs')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#D8B84B] mb-3">
              Policies
            </h5>
            <ul className="space-y-2 text-sm text-[#FFF9E9]/80">
              <li>
                <button onClick={() => navigate('/policies/shipping')} className="hover:text-white transition-colors">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/policies/returns')} className="hover:text-white transition-colors">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/policies/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/policies/terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-[#FFF9E9]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF9E9]/60">
          <p>© {new Date().getFullYear()} NutriCrunch Foods Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="https://instagram.com/nutricrunch_wgl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#FFF9E9]/75 hover:text-[#D8B84B] transition-colors"
              title="NutriCrunch Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-[#D8B84B]" />
              <span>@nutricrunch_wgl</span>
            </a>
            <span>·</span>
            <span>FSSAI Certified Partner Facilities</span>
            <span>·</span>
            <span>Crafted with Pride in Telangana</span>
            <span>·</span>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-[#FFF9E9]/50 hover:text-[#D8B84B] transition-colors font-medium"
              title="Private Administrative Login"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
