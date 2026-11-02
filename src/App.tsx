import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams
} from 'react-router-dom';

import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { ProtectedRoute } from './components/ProtectedRoute';

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

// Parameterized wrapper for ProductDetailPage to extract slug from route params
function ProductDetailPageWrapper({
  products,
  navigate
}: {
  products: Product[];
  navigate: (path: string) => void;
}) {
  const { slug } = useParams<{ slug: string }>();
  return <ProductDetailPage slug={slug || ''} products={products} navigate={navigate} />;
}

// Wrapper for ShopPage to read optional category search query param
function ShopPageWrapper({
  products,
  navigate
}: {
  products: Product[];
  navigate: (path: string) => void;
}) {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  return <ShopPage products={products} navigate={navigate} initialCategory={initialCategory} />;
}

// Wrapper for TrackOrderPage to read optional orderNumber search query param
function TrackOrderPageWrapper({ navigate }: { navigate: (path: string) => void }) {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  return <TrackOrderPage initialOrderNumber={initialOrderNumber} navigate={navigate} />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Requirement: Check localStorage first on app startup or refresh
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = getStoredCatalog();
    if (stored && stored.length > 0) {
      return stored;
    }
    return [];
  });
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Scroll to top & record privacy-conscious analytics on route transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pageview',
          path: location.pathname,
          sessionId: sessionStorage.getItem('nc_session_id') || 'sess_direct'
        })
      }).catch(() => {});
    } catch {}
  }, [location.pathname]);

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

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AdminAuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FFF9E9] text-[#20251F] font-sans antialiased">
          {/* Header (hidden inside admin workspace for clean management layout) */}
          {!isAdminRoute && (
            <Header currentPath={location.pathname} navigate={navigate} />
          )}

          {/* Main Route Content */}
          <main className="flex-1">
            <Routes>
              {/* Core Storefront Routes */}
              <Route path="/" element={<HomePage products={products} navigate={navigate} />} />
              <Route
                path="/shop"
                element={<ShopPageWrapper products={products} navigate={navigate} />}
              />
              <Route
                path="/product/:slug"
                element={<ProductDetailPageWrapper products={products} navigate={navigate} />}
              />
              <Route path="/cart" element={<CartPage navigate={navigate} />} />
              <Route
                path="/checkout"
                element={
                  <CheckoutPage
                    navigate={navigate}
                    onOrderPlaced={(order) => setConfirmedOrder(order)}
                  />
                }
              />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmationPage order={confirmedOrder} navigate={navigate} />}
              />
              <Route
                path="/track-order"
                element={<TrackOrderPageWrapper navigate={navigate} />}
              />

              {/* Informational & Policy Pages */}
              <Route path="/about" element={<AboutPage navigate={navigate} />} />
              <Route path="/ingredients" element={<IngredientsPage navigate={navigate} />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faqs" element={<FaqPage navigate={navigate} />} />
              <Route
                path="/policies/shipping"
                element={<PoliciesPage policyType="shipping" navigate={navigate} />}
              />
              <Route
                path="/policies/returns"
                element={<PoliciesPage policyType="returns" navigate={navigate} />}
              />
              <Route
                path="/policies/privacy"
                element={<PoliciesPage policyType="privacy" navigate={navigate} />}
              />
              <Route
                path="/policies/terms"
                element={<PoliciesPage policyType="terms" navigate={navigate} />}
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage navigate={navigate} />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage onProductsUpdated={fetchProducts} navigate={navigate} />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

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
