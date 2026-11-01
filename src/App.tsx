import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { Product, Order } from './types';
import {
  getStoredCatalog,
  saveStoredCatalog,
  CATALOG_UPDATED_EVENT
} from './utils/productStorage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Requirement: Check localStorage first on app startup or refresh
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = getStoredCatalog();
    if (stored && stored.length > 0) {
      return stored;
    }
    return [];
  });
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Privacy-conscious first-party analytics track
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pageview',
          path,
          sessionId: sessionStorage.getItem('nc_session_id') || 'sess_direct'
        })
      }).catch(() => {});
    } catch {}
  };

  // Fetch verified products: checks localStorage first, falls back to server, and syncs
  const fetchProducts = async () => {
    // 1. Persistent Loading: Check browser localStorage first
    const stored = getStoredCatalog();
    if (stored && stored.length > 0) {
      setProducts(stored);
      // Synchronize in background with server database
      try {
        fetch('/api/products/sync-catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: stored })
        }).catch(() => {});
      } catch {}
      return;
    }

    // 2. Fall back to backend database if no localStorage catalog exists
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const serverProducts = data.products || [];
        setProducts(serverProducts);
        // Persist to localStorage immediately
        if (serverProducts.length > 0) {
          saveStoredCatalog(serverProducts);
        }
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Real-time catalog change listener (when products are added, edited, or reset in Admin)
    const handleCatalogUpdate = (e: any) => {
      const customProducts = e.detail?.products ?? getStoredCatalog();
      if (customProducts && customProducts.length > 0) {
        setProducts(customProducts);
      } else {
        // Fall back to server if catalog was reset
        fetch('/api/products')
          .then((res) => res.json())
          .then((data) => setProducts(data.products || []))
          .catch(() => {});
      }
    };

    window.addEventListener(CATALOG_UPDATED_EVENT, handleCatalogUpdate as EventListener);
    window.addEventListener('storage', (e) => {
      if (e.key === 'nutricrunch_custom_catalog') {
        const stored = getStoredCatalog();
        if (stored && stored.length > 0) {
          setProducts(stored);
        }
      }
    });

    // Auto-refresh when tab gains focus or becomes visible
    const handleVisibilityOrFocus = () => {
      const stored = getStoredCatalog();
      if (stored && stored.length > 0) {
        setProducts(stored);
      } else {
        fetchProducts();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener(CATALOG_UPDATED_EVENT, handleCatalogUpdate as EventListener);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  // Simple route matcher
  const renderRoute = () => {
    // 1. Admin Routes
    if (currentPath === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminDashboardPage navigate={navigate} onProductsUpdated={fetchProducts} />;
    }

    // 2. Product Detail Route (/product/:slug)
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      return <ProductDetailPage slug={slug} products={products} navigate={navigate} />;
    }

    // 3. Shop All
    if (currentPath.startsWith('/shop')) {
      const urlParams = new URLSearchParams(window.location.search);
      const cat = urlParams.get('category') || 'All';
      return <ShopPage products={products} navigate={navigate} initialCategory={cat} />;
    }

    // 4. Cart & Checkout
    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} />;
    }
    if (currentPath === '/checkout') {
      return (
        <CheckoutPage
          navigate={navigate}
          onOrderPlaced={(order) => setConfirmedOrder(order)}
        />
      );
    }
    if (currentPath.startsWith('/order-confirmation')) {
      return <OrderConfirmationPage order={confirmedOrder} navigate={navigate} />;
    }

    // 5. Track Order
    if (currentPath.startsWith('/track-order')) {
      const urlParams = new URLSearchParams(window.location.search);
      const ordNum = urlParams.get('orderNumber') || '';
      return <TrackOrderPage initialOrderNumber={ordNum} navigate={navigate} />;
    }

    // 6. Content & Policies
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/ingredients') {
      return <IngredientsPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/faqs') {
      return <FaqPage navigate={navigate} />;
    }
    if (currentPath === '/policies/shipping') {
      return <PoliciesPage policyType="shipping" navigate={navigate} />;
    }
    if (currentPath === '/policies/returns') {
      return <PoliciesPage policyType="returns" navigate={navigate} />;
    }
    if (currentPath === '/policies/privacy') {
      return <PoliciesPage policyType="privacy" navigate={navigate} />;
    }
    if (currentPath === '/policies/terms') {
      return <PoliciesPage policyType="terms" navigate={navigate} />;
    }

    // 7. Default Homepage
    return <HomePage products={products} navigate={navigate} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <AdminAuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FFF9E9] text-[#20251F] font-sans antialiased">
          
          {/* Header (hidden inside admin dashboard for focused workspace) */}
          {!isAdminRoute && (
            <Header currentPath={currentPath} navigate={navigate} />
          )}

          {/* Main Page Content */}
          <main className="flex-1">{renderRoute()}</main>

          {/* Footer (hidden inside admin dashboard) */}
          {!isAdminRoute && <Footer navigate={navigate} />}

          {/* Global Slide-over Cart Drawer */}
          <CartDrawer navigate={navigate} />

          {/* Accessible WhatsApp Contact Floating Button (Storefront only) */}
          {!isAdminRoute && <WhatsAppFloatingButton />}

        </div>
      </CartProvider>
    </AdminAuthProvider>
  );
}
