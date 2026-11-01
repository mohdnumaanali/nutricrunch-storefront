import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, PhoneCall, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, onOpenSearch }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Shop All', path: '/shop' },
    { label: 'Panjiri', path: '/product/nutricrunch-dry-fruits-panjiri' },
    { label: 'Banana Chips', path: '/product/nutricrunch-banana-chips' },
    { label: 'Ingredients & Quality', path: '/ingredients' },
    { label: 'Track Order', path: '/track-order' }
  ];

  return (
    <>
      {/* Slim Promotional Announcement Bar */}
      <div className="bg-[#123D24] text-[#FFF9E9] text-xs font-medium py-1.5 px-4 text-center border-b border-[#0B2516]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span>🌿 Free Local Express Delivery in Warangal, Hanamkonda & Kazipet on orders above ₹499</span>
          <span className="hidden md:inline text-[#D8B84B]">·</span>
          <span className="hidden md:inline text-[#FFF9E9]/90">100% Real Ingredients · No Palm Oil</span>
        </div>
      </div>

      {/* Main Top Navigation: 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-[#FFF9E9]/95 backdrop-blur-md border-b border-[#123D24]/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          
          {/* Zone 1: Brand Logo Container with flex-shrink-0 to prevent collision */}
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="flex-shrink-0 shrink-0 flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123D24] rounded-lg p-1"
          >
            <img
              src="/logo.jpg"
              alt="NutriCrunch"
              className="max-h-12 h-10 sm:h-12 w-auto object-contain rounded-full shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#123D24] whitespace-nowrap">
              NutriCrunch
            </span>
          </button>

          {/* Zone 2: Desktop Navigation Links Container (hidden lg:flex items-center gap-6 ml-6) */}
          <nav className="hidden lg:flex items-center gap-6 ml-6 text-sm font-medium text-[#20251F]">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#123D24] relative py-1 ${
                    isActive ? 'text-[#123D24] font-semibold' : 'text-[#20251F]/80'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#56783B] rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Admin Login button directly in desktop navigation next to Track Order */}
            <button
              onClick={() => navigate('/admin/login')}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentPath.startsWith('/admin')
                  ? 'bg-[#123D24] text-[#FFF9E9] border-[#123D24] shadow-xs'
                  : 'bg-[#F5ECCE] text-[#123D24] border-[#123D24]/20 hover:bg-[#EADBAB] hover:border-[#123D24]/40'
              }`}
              title="Admin Dashboard Login"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#56783B]" />
              <span>Admin Login</span>
            </button>
          </nav>

          {/* Zone 3: Interactive Affordances (Search, Support, Cart Button) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Contact Trigger */}
            <a
              href="tel:+919154797936"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#123D24] hover:text-[#56783B] px-2.5 py-1.5 rounded-md hover:bg-[#F5ECCE] transition-colors"
              title="Call Warangal Support"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap font-mono tabular-nums">+91 9154797936</span>
            </a>

            {/* Search Trigger */}
            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else navigate('/shop');
              }}
              className="p-2 text-[#20251F]/80 hover:text-[#123D24] hover:bg-[#F5ECCE] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#123D24]"
              aria-label="Search food products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#123D24] text-[#FFF9E9] rounded-lg hover:bg-[#0E2E1B] transition-all shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-[#123D24]"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline">Bag</span>
              {itemCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold font-mono tabular-nums bg-[#C76525] text-white rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Toggle - permanently visible across all screen widths */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#20251F] hover:text-[#123D24] hover:bg-[#F5ECCE] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#123D24]"
              aria-label="Toggle navigation menu"
              title="Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation Drawer / Slide-down Menu - openable on all screen widths */}
        {mobileMenuOpen && (
          <div className="bg-[#FFF9E9] border-t border-[#123D24]/10 px-4 sm:px-6 lg:px-8 pt-4 pb-6 shadow-xl">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Menu Branding & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#123D24]/10">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.jpg"
                    alt="NutriCrunch"
                    className="max-h-12 h-11 w-auto object-contain rounded-full shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-serif text-lg font-bold text-[#123D24] block leading-tight">NutriCrunch Menu</span>
                    <span className="text-[11px] text-[#56783B] font-medium block">Real Ingredients · Handcrafted in Warangal</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#F5ECCE] rounded-lg transition-colors"
                  aria-label="Close menu"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links Grid */}
              <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPath === link.path
                        ? 'bg-[#123D24] text-[#FFF9E9]'
                        : 'text-[#20251F] hover:bg-[#F5ECCE]'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    navigate('/about');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#20251F] hover:bg-[#F5ECCE]"
                >
                  About NutriCrunch
                </button>
                <button
                  onClick={() => {
                    navigate('/contact');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#20251F] hover:bg-[#F5ECCE]"
                >
                  Contact & Support
                </button>
                <button
                  onClick={() => {
                    navigate('/admin/login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#123D24] bg-[#F5ECCE] hover:bg-[#EADBAB] flex items-center justify-between transition-colors border border-[#123D24]/15"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#56783B]" />
                    <span>Admin Login</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#56783B] bg-white px-2 py-0.5 rounded-full border border-[#123D24]/10 uppercase tracking-wider">
                    Dashboard
                  </span>
                </button>
              </nav>

              <div className="pt-3 border-t border-[#123D24]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#20251F]/80">
                <a
                  href="tel:+919154797936"
                  className="inline-flex items-center gap-2 py-2 px-3.5 bg-[#F5ECCE] text-[#123D24] rounded-lg font-semibold hover:bg-[#EADBAB] transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call +91 9154797936</span>
                </a>
                <span className="text-[#56783B] font-medium">🌿 100% Traditional Handcrafted Snacks · Warangal, Telangana</span>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
