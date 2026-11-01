import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Users,
  Eye,
  DollarSign,
  ChevronRight,
  X,
  Save,
  MessageSquare,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Upload,
  Database,
  Image as ImageIcon,
  KeyRound,
  Lock,
  EyeOff,
  UserCheck,
  Star,
  MessageSquareHeart,
  Check
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Product, Order, AnalyticsSummary, Inquiry, StoreSettings, CustomerReview } from '../types';
import { ProductImage } from '../components/ProductImage';
import {
  getStoredCatalog,
  saveStoredCatalog,
  clearStoredCatalog,
  getCatalogStorageStats
} from '../utils/productStorage';
import {
  getStoredReviews,
  saveStoredReviews,
  removeStoredReview,
  REVIEWS_UPDATED_EVENT
} from '../utils/reviewStorage';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
  onProductsUpdated?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  navigate,
  onProductsUpdated
}) => {
  const { admin, token, logout, updateCredentials, isAuthenticated } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'inquiries' | 'settings' | 'audit' | 'account'
  >('overview');

  // Overview / Analytics State
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'month' | 'all'>('30days');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Products State - Persistent Loading from localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = getStoredCatalog();
    if (stored && stored.length > 0) return stored;
    return [];
  });
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [storageStats, setStorageStats] = useState(getCatalogStorageStats());
  const [isResettingCatalog, setIsResettingCatalog] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Inquiries & Customer Feedback State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>(() => getStoredReviews());
  const [inquirySubTab, setInquirySubTab] = useState<'reviews' | 'inquiries'>('reviews');
  const [reviewSearch, setReviewSearch] = useState('');

  // Settings State
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Supabase Live Connection State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    configured: boolean;
    url: string | null;
    message: string;
    error?: string;
  } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  // Flash Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Account Settings Form State
  const [accountEmail, setAccountEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (admin?.email) {
      setAccountEmail(admin.email);
    }
  }, [admin]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    loadAnalytics();
    loadProducts();
    loadOrders();
    loadInquiries();
    loadReviews();
    loadSettings();
    loadSupabaseStatus();

    const handleReviewsUpdate = (e: any) => {
      if (e.detail?.reviews) {
        setReviews(e.detail.reviews);
      } else {
        setReviews(getStoredReviews());
      }
    };

    window.addEventListener(REVIEWS_UPDATED_EVENT, handleReviewsUpdate as EventListener);
    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, handleReviewsUpdate as EventListener);
    };
  }, [isAuthenticated, dateRange]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch (e) {
      console.warn('Could not query Supabase status:', e);
    }
  };

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message || 'Supabase database synchronized successfully!');
        loadSupabaseStatus();
        loadProducts();
      } else {
        showFeedback('error', data.error || 'Failed to sync with Supabase.');
      }
    } catch (e) {
      showFeedback('error', 'Network error triggering Supabase sync.');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showFeedback('error', 'Image size exceeds 8MB limit.');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress('Processing image into persistent data format...');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        // Image Persistence: Store Base64 / Data URL directly so images never break on reload
        setProductForm((prev) => ({
          ...prev,
          images: [base64Data, ...(prev.images?.slice(1) || [])]
        }));

        // If editing an existing item, automatically save to localStorage catalog immediately
        if (editingProduct) {
          const updatedCatalog = products.map((p) =>
            p.id === editingProduct.id
              ? { ...p, images: [base64Data, ...(p.images?.slice(1) || [])] }
              : p
          );
          setProducts(updatedCatalog);
          saveStoredCatalog(updatedCatalog);
          setStorageStats(getCatalogStorageStats());
          if (onProductsUpdated) onProductsUpdated();
        }

        // Also sync to server in background for persistent file backup
        try {
          fetch('/api/upload', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              dataUri: base64Data,
              filename: file.name
            })
          }).catch(() => {});
        } catch {}

        showFeedback('success', 'Image successfully saved and persisted in browser storage!');
      } catch (uploadErr) {
        showFeedback('error', 'Error reading image file');
      } finally {
        setIsUploadingImage(false);
        setUploadProgress(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/analytics/summary?range=${dateRange}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadProducts = async () => {
    // 1. Persistent Loading: Check browser localStorage first
    const stored = getStoredCatalog();
    if (stored && stored.length > 0) {
      setProducts(stored);
      setStorageStats(getCatalogStorageStats());
    }

    try {
      const res = await fetch('/api/products?all=true');
      if (res.ok) {
        const data = await res.json();
        const serverProducts: Product[] = data.products || [];

        // If no local custom catalog exists yet, seed it with server catalog
        if (!stored || stored.length === 0) {
          setProducts(serverProducts);
          saveStoredCatalog(serverProducts);
        } else {
          // If custom catalog already exists in localStorage, sync it to server DB in background
          try {
            fetch('/api/products/sync-catalog', {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ products: stored })
            }).catch(() => {});
          } catch {}
        }
        setStorageStats(getCatalogStorageStats());
      }
    } catch (e) {
      console.warn('Network error loading products from server (local catalog preserved):', e);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadReviews = async () => {
    // 1. Load from localStorage first
    const stored = getStoredReviews();
    if (stored && stored.length > 0) {
      setReviews(stored);
    }

    // 2. Fetch from database and sync
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
          saveStoredReviews(data.reviews);
        }
      }
    } catch (e) {
      console.warn('Network notice loading reviews (localStorage preserved):', e);
    }
  };

  const handleDeleteReview = async (id: string, customerName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review from "${customerName}"?`)) {
      return;
    }

    // 1. Immediately update local state and localStorage
    const updated = removeStoredReview(id);
    setReviews(updated);

    // 2. Synchronize with database
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showFeedback('success', `Review from "${customerName}" was deleted successfully.`);
      }
    } catch {
      showFeedback('success', `Review from "${customerName}" removed from local storage.`);
    }
  };

  const handleToggleReviewVerified = async (rev: CustomerReview) => {
    const nextVerified = !rev.verified;
    const updated = reviews.map((r) =>
      r.id === rev.id ? { ...r, verified: nextVerified } : r
    );
    setReviews(updated);
    saveStoredReviews(updated);

    try {
      await fetch(`/api/reviews/${rev.id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ verified: nextVerified })
      });
      showFeedback('success', `Review buyer verification updated for "${rev.name}".`);
    } catch {
      showFeedback('success', `Verification status updated locally.`);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ================= PRODUCTS CRUD WITH IMMEDIATE LOCALSTORAGE PERSISTENCE =================
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Traditional Panjiri',
      price: 499,
      originalPrice: 599,
      packageWeight: '500g',
      stock: 50,
      description: '',
      ingredients: ['California Almonds', 'Pure Cow Desi Ghee', 'Organic Jaggery'],
      allergenInfo: 'Contains Tree Nuts and Dairy.',
      dietary: ['100% Vegetarian', 'Pure Desi Ghee'],
      shelfLife: '4 Months',
      storageInstructions: 'Store in a cool, dry place away from moisture.',
      images: ['/assets/panjiri-pouch.svg'],
      published: true
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showFeedback('error', 'Name and price are required.');
      return;
    }

    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      // Assemble full product entity
      const savedProd: Product = {
        id: editingProduct?.id || `prod-${Date.now()}`,
        slug:
          editingProduct?.slug ||
          productForm.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        name: productForm.name,
        description: productForm.description || '',
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        discountPercent:
          productForm.originalPrice && productForm.originalPrice > productForm.price
            ? Math.round(
                ((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100
              )
            : undefined,
        category: productForm.category || 'Traditional Panjiri',
        ingredients: productForm.ingredients || [],
        allergenInfo: productForm.allergenInfo || 'None reported',
        packageWeight: productForm.packageWeight || '250g',
        stock: Number(productForm.stock ?? 50),
        sku: productForm.sku || `NC-${Date.now().toString().slice(-4)}`,
        published: productForm.published !== undefined ? Boolean(productForm.published) : true,
        isFeatured: Boolean(productForm.isFeatured),
        dietary: productForm.dietary || ['100% Vegetarian'],
        shelfLife: productForm.shelfLife || '3 Months',
        storageInstructions: productForm.storageInstructions || 'Store in a cool, dry place.',
        images:
          productForm.images && productForm.images.length > 0
            ? productForm.images
            : ['/assets/panjiri-pouch.svg'],
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Automatic Saving: Update local state and save directly to browser localStorage immediately
      const updatedCatalog = isEdit
        ? products.map((p) => (p.id === editingProduct.id ? savedProd : p))
        : [savedProd, ...products];

      setProducts(updatedCatalog);
      saveStoredCatalog(updatedCatalog);
      setStorageStats(getCatalogStorageStats());
      if (onProductsUpdated) onProductsUpdated();

      // 2. Persist to server / Supabase
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(productForm)
      });

      const data = await res.json();
      if (res.ok && data.product) {
        const finalizedCatalog = updatedCatalog.map((p) =>
          p.id === savedProd.id ? { ...savedProd, ...data.product } : p
        );
        setProducts(finalizedCatalog);
        saveStoredCatalog(finalizedCatalog);
        setStorageStats(getCatalogStorageStats());
      }

      showFeedback('success', `Product "${productForm.name}" saved and persisted to localStorage!`);
      setIsProductModalOpen(false);
      if (onProductsUpdated) onProductsUpdated();
    } catch (err) {
      // Graceful offline / network blip support: Data already safely in localStorage
      showFeedback('success', `Product "${productForm.name}" safely stored in browser localStorage.`);
      setIsProductModalOpen(false);
      if (onProductsUpdated) onProductsUpdated();
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    // 1. Immediately remove from local state and update localStorage
    const updatedCatalog = products.filter((p) => p.id !== id);
    setProducts(updatedCatalog);
    saveStoredCatalog(updatedCatalog);
    setStorageStats(getCatalogStorageStats());
    if (onProductsUpdated) onProductsUpdated();

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        showFeedback('success', `Product "${name}" deleted from catalog and storage.`);
      }
    } catch (e) {
      showFeedback('success', `Product "${name}" deleted from local catalog.`);
    }
  };

  const handleTogglePublished = async (prod: Product) => {
    const nextPublished = !prod.published;
    const updatedCatalog = products.map((p) =>
      p.id === prod.id ? { ...p, published: nextPublished } : p
    );

    // Immediately update localStorage
    setProducts(updatedCatalog);
    saveStoredCatalog(updatedCatalog);
    setStorageStats(getCatalogStorageStats());
    if (onProductsUpdated) onProductsUpdated();

    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ published: nextPublished })
      });

      if (res.ok) {
        showFeedback(
          'success',
          `Product "${prod.name}" ${nextPublished ? 'Published' : 'Unpublished'}.`
        );
      }
    } catch (e) {
      showFeedback('error', 'Failed to update publication status.');
    }
  };

  // Requirement: Reset Catalog to Defaults Fallback
  const handleResetCatalog = async () => {
    if (
      !window.confirm(
        'Are you sure you want to restore the product catalog to original factory defaults? Any custom added items, prices, or uploaded images will be replaced with original default products.'
      )
    ) {
      return;
    }

    setIsResettingCatalog(true);
    try {
      // 1. Clear custom localStorage catalog
      clearStoredCatalog();

      // 2. Invoke server reset route
      const res = await fetch('/api/products/reset', {
        method: 'POST',
        headers: getHeaders()
      });

      const data = await res.json();
      if (res.ok && data.products) {
        setProducts(data.products);
        saveStoredCatalog(data.products);
        setStorageStats(getCatalogStorageStats());
        showFeedback('success', 'Catalog successfully restored to factory defaults!');
        if (onProductsUpdated) onProductsUpdated();
      } else {
        await loadProducts();
        showFeedback('success', 'Catalog reset complete.');
        if (onProductsUpdated) onProductsUpdated();
      }
    } catch (err) {
      showFeedback('error', 'Error resetting catalog.');
    } finally {
      setIsResettingCatalog(false);
    }
  };

  // ================= ORDERS MANAGEMENT =================
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newOrderStatus) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          note: statusNote || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        showFeedback('success', `Order ${selectedOrder.orderNumber} updated to ${newOrderStatus}`);
        setSelectedOrder(data.order);
        setStatusNote('');
        loadOrders();
        loadAnalytics();
      } else {
        showFeedback('error', data.error || 'Failed to update order status');
      }
    } catch (e) {
      showFeedback('error', 'Network error updating order status');
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reason: refundReason || 'Customer requested cancellation/refund'
        })
      });

      const data = await res.json();

      if (res.ok) {
        showFeedback('success', `Refund recorded for order ${selectedOrder.orderNumber}`);
        setSelectedOrder(data.order);
        setIsRefundModalOpen(false);
        setRefundReason('');
        loadOrders();
        loadAnalytics();
      } else {
        showFeedback('error', data.error || 'Failed to record refund');
      }
    } catch (e) {
      showFeedback('error', 'Network error recording refund');
    }
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showFeedback('error', 'No orders to export.');
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'City',
      'PIN',
      'Items Count',
      'Subtotal',
      'Delivery Fee',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status'
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString().split('T')[0],
      `"${o.customer.name.replace(/"/g, '""')}"`,
      o.customer.phone,
      `"${o.customer.city}"`,
      o.customer.pinCode,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal,
      o.deliveryCharge,
      o.totalAmount,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.orderStatus
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nutricrunch_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('success', 'Orders CSV exported successfully!');
  };

  // ================= SETTINGS SAVE =================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSettingsSavedMessage('Store settings updated successfully!');
        setTimeout(() => setSettingsSavedMessage(null), 4000);
      }
    } catch (e) {
      showFeedback('error', 'Failed to update store settings');
    }
  };

  // ================= ACCOUNT CREDENTIALS UPDATE =================
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFeedback(null);

    if (!currentPassword) {
      setAccountFeedback({
        type: 'error',
        message: 'Current password is required to verify your identity.'
      });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setAccountFeedback({
          type: 'error',
          message: 'New password must be at least 6 characters long.'
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setAccountFeedback({
          type: 'error',
          message: 'New password and confirm new password do not match.'
        });
        return;
      }
    }

    const emailChanged = accountEmail.trim().toLowerCase() !== (admin?.email || '').toLowerCase();
    const passwordChanged = Boolean(newPassword);

    if (!emailChanged && !passwordChanged) {
      setAccountFeedback({
        type: 'error',
        message: 'No changes provided. Enter a new email/username or a new password.'
      });
      return;
    }

    setIsSavingAccount(true);
    try {
      const res = await updateCredentials({
        newEmail: accountEmail.trim(),
        currentPassword,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined
      });

      if (res.success) {
        // Securely clear sensitive password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);

        const successMessage =
          res.message ||
          'Admin credentials successfully updated! Subsequent logins will use your new credentials.';
        setAccountFeedback({
          type: 'success',
          message: successMessage
        });
        showFeedback('success', successMessage);
        loadAnalytics(); // Refresh security audit trail
      } else {
        setAccountFeedback({
          type: 'error',
          message: res.error || 'Failed to update credentials. Please check your current password.'
        });
      }
    } catch (err) {
      setAccountFeedback({
        type: 'error',
        message: 'An unexpected network error occurred while updating credentials.'
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'All' ||
      o.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase();

    const q = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.city.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#20251F] flex flex-col">
      
      {/* Top Admin Bar */}
      <header className="bg-[#123D24] text-[#FFF9E9] px-4 sm:px-6 py-3.5 border-b border-[#0B2516] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#FFF9E9]/10 rounded-lg text-[#D8B84B]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base leading-tight">
              NutriCrunch Administration
            </h1>
            <p className="text-[11px] text-[#FFF9E9]/70">
              Manager: {admin?.name || 'Administrator'} ({admin?.role || 'superadmin'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'account'
                ? 'bg-[#FFF9E9] text-[#123D24] shadow-xs font-bold'
                : 'bg-[#FFF9E9]/10 text-[#FFF9E9] hover:bg-[#FFF9E9]/20'
            }`}
            title="Account & Profile Settings"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Account</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9E9]/10 text-[#FFF9E9] text-xs font-semibold rounded-lg hover:bg-[#FFF9E9]/20 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/60 text-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Flash Feedback */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation Controls */}
        <div className="bg-white p-1.5 rounded-2xl border border-[#123D24]/10 shadow-xs flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Dispatch ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'inquiries'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Inquiries / Feedback ({inquiries.length + reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store & Delivery Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'account'
                ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#FFF9E9]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Date Range Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#123D24]/10 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#123D24]">Real Business Performance</h2>
                <p className="text-xs text-[#5D675A]">
                  Metrics computed directly from qualifying database records.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#FFF9E9] p-1 rounded-xl">
                {(['today', '7days', '30days', 'month', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${
                      dateRange === r
                        ? 'bg-[#123D24] text-[#FFF9E9]'
                        : 'text-[#20251F]/70 hover:text-[#123D24]'
                    }`}
                  >
                    {r === '7days' ? 'Last 7 Days' : r === '30days' ? 'Last 30 Days' : r === 'all' ? 'All Time' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Stat Cards */}
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#56783B] uppercase tracking-wider block">
                    Qualifying Revenue
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-[#123D24] tabular-nums">
                    ₹{analytics.metrics.totalRevenue}
                  </div>
                  <p className="text-[11px] text-[#5D675A]">Paid / Confirmed orders</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#56783B] uppercase tracking-wider block">
                    Total Orders
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-[#123D24] tabular-nums">
                    {analytics.metrics.totalOrders}
                  </div>
                  <p className="text-[11px] text-[#5D675A]">
                    {analytics.metrics.completedOrders} Delivered · {analytics.metrics.pendingOrders} Active
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#56783B] uppercase tracking-wider block">
                    Average Order Value (AOV)
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-[#123D24] tabular-nums">
                    ₹{analytics.metrics.aov}
                  </div>
                  <p className="text-[11px] text-[#5D675A]">Per qualifying purchase</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#56783B] uppercase tracking-wider block">
                    Conversion Rate
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-[#123D24] tabular-nums">
                    {analytics.metrics.conversionRate}
                  </div>
                  <p className="text-[11px] text-[#5D675A]">
                    {analytics.metrics.uniqueVisitors} Unique visitors
                  </p>
                </div>

              </div>
            )}

            {/* Revenue Trend Visual Representation */}
            {analytics && (
              <div className="bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#123D24]">Revenue & Order Momentum</h3>
                    <p className="text-xs text-[#5D675A]">Recorded sales trajectory over time</p>
                  </div>
                  <button
                    onClick={loadAnalytics}
                    className="p-1.5 text-[#5D675A] hover:text-[#123D24] rounded-lg hover:bg-[#FFF9E9]"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {analytics.metrics.totalRevenue === 0 && analytics.metrics.totalOrders === 0 && (
                  <div className="p-3 bg-[#FFF9E9] border border-[#D8B84B]/40 rounded-xl text-xs text-[#5D675A] flex items-center justify-between">
                    <span>No orders recorded in database for this period. Metrics will calculate real-time as customer orders arrive via WhatsApp.</span>
                    <span className="font-mono text-[11px] font-bold text-[#123D24]">0 Orders · ₹0</span>
                  </div>
                )}

                <div className="grid grid-cols-7 gap-2 items-end h-40 pt-6 px-2">
                  {analytics.trends.map((t, idx) => {
                    const maxRev = Math.max(1, ...analytics.trends.map((tr) => tr.revenue));
                    const isZero = t.revenue === 0;
                    const heightPercent = isZero ? 4 : Math.max(10, Math.round((t.revenue / maxRev) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono text-[#123D24] font-bold tabular-nums">
                          ₹{t.revenue}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-colors relative group ${
                            isZero ? 'bg-[#123D24]/10 hover:bg-[#123D24]/20' : 'bg-[#123D24] hover:bg-[#56783B]'
                          }`}
                          style={{ height: isZero ? '4px' : `${heightPercent}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity font-mono">
                            {t.orders} order(s)
                          </div>
                        </div>
                        <span className="text-[10px] text-[#5D675A] font-mono whitespace-nowrap">
                          {t.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sales by Product & City Grids */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sales by Product */}
                <div className="bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#123D24]">Revenue by Product</h3>
                  <div className="divide-y divide-[#123D24]/10">
                    {analytics.salesByProduct.length === 0 ? (
                      <p className="text-xs text-[#5D675A] py-4">No completed product sales yet.</p>
                    ) : (
                      analytics.salesByProduct.map((p, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-[#123D24] font-semibold">{p.name}</strong>
                            <p className="text-[#5D675A] text-[11px]">{p.qty} units sold</p>
                          </div>
                          <span className="font-mono font-bold text-[#123D24] tabular-nums">
                            ₹{p.revenue}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sales by City */}
                <div className="bg-white p-6 rounded-2xl border border-[#123D24]/10 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#123D24]">Regional Geography</h3>
                  <div className="divide-y divide-[#123D24]/10">
                    {analytics.salesByCity.length === 0 ? (
                      <p className="text-xs text-[#5D675A] py-4">No regional order data yet.</p>
                    ) : (
                      analytics.salesByCity.map((c, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#56783B]" />
                            <strong className="text-[#123D24] font-semibold">{c.city}</strong>
                          </div>
                          <span className="font-mono font-bold text-[#123D24] tabular-nums">
                            ₹{c.revenue}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: PRODUCTS CATALOG ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#123D24]/10 shadow-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D675A]" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name, SKU..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FFF9E9] border border-[#123D24]/15 rounded-xl text-xs text-[#20251F] focus:outline-none focus:ring-2 focus:ring-[#123D24]"
                />
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#FFF9E9] text-[#123D24] border border-[#123D24]/10 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>localStorage Saved ({products.length} Products)</span>
                </span>

                <button
                  onClick={openNewProductModal}
                  className="px-4 py-2 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Food Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFFDF7] border-b border-[#123D24]/10 text-[#56783B] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (INR)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123D24]/10">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FFFDF7]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0] || '/assets/panjiri-pouch.svg'}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-lg bg-[#FFF9E9] p-1 border border-[#123D24]/10 shrink-0"
                            />
                            <div>
                              <strong className="text-[#123D24] font-semibold block">{p.name}</strong>
                              <span className="text-[11px] font-mono text-[#5D675A]">{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#5D675A]">{p.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#123D24] tabular-nums">
                          ₹{p.price}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-bold ${
                              p.stock <= 10 ? 'text-rose-600' : 'text-[#56783B]'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#5D675A]">{p.packageWeight}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleTogglePublished(p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                              p.published
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {p.published ? 'Published' : 'Draft / Hidden'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 text-[#123D24] hover:bg-[#FFF9E9] rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#123D24]/10 shadow-xs">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D675A]" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order#, phone, customer..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FFF9E9] border border-[#123D24]/15 rounded-xl text-xs text-[#20251F] focus:outline-none"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#FFF9E9] border border-[#123D24]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#123D24]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-white border border-[#123D24]/20 text-[#123D24] text-xs font-bold rounded-xl hover:bg-[#FFF9E9] transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Export Report to CSV</span>
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFFDF7] border-b border-[#123D24]/10 text-[#56783B] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123D24]/10">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#5D675A]">
                          No orders matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FFFDF7]/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#123D24]">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-[#5D675A] font-mono">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <strong className="text-[#123D24] block">{ord.customer.name}</strong>
                            <span className="text-[11px] font-mono text-[#5D675A]">
                              {ord.customer.phone}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#5D675A]">{ord.customer.city}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#123D24] tabular-nums">
                            ₹{ord.totalAmount}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`uppercase text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                ord.paymentMethod === 'whatsapp'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'text-[#123D24]'
                              }`}
                            >
                              {ord.paymentMethod === 'whatsapp' ? 'WhatsApp' : ord.paymentMethod}
                            </span>
                            <span
                              className={`block text-[10px] uppercase font-mono ${
                                ord.paymentStatus === 'verified' ? 'text-[#56783B]' : 'text-amber-700'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.orderStatus === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Refunded'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setNewOrderStatus(ord.orderStatus);
                              }}
                              className="px-3 py-1 bg-[#123D24] text-[#FFF9E9] text-xs font-semibold rounded-lg hover:bg-[#0E2E1B]"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: INQUIRIES & CUSTOMER FEEDBACK ================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            {/* Top Sub-Nav & Header */}
            <div className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#123D24]/10">
                <div>
                  <h3 className="font-bold text-lg text-[#123D24]">Inquiries & Customer Feedback</h3>
                  <p className="text-xs text-[#5D675A] mt-0.5">
                    Manage customer reviews from the storefront and incoming contact form submissions
                  </p>
                </div>

                {/* Sub-tab Switcher */}
                <div className="flex items-center bg-[#FFF9E9] p-1 rounded-xl border border-[#123D24]/10 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInquirySubTab('reviews')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inquirySubTab === 'reviews'
                        ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                        : 'text-[#20251F]/70 hover:text-[#123D24]'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-[#D8B84B]" />
                    <span>Customer Feedback ({reviews.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInquirySubTab('inquiries')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inquirySubTab === 'inquiries'
                        ? 'bg-[#123D24] text-[#FFF9E9] shadow-xs'
                        : 'text-[#20251F]/70 hover:text-[#123D24]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact Messages ({inquiries.length})</span>
                  </button>
                </div>
              </div>

              {/* SUB-VIEW 1: CUSTOMER REVIEWS & FEEDBACK */}
              {inquirySubTab === 'reviews' && (
                <div className="pt-5 space-y-6">
                  {/* Reviews Summary KPI Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#FFFDF7] p-3.5 rounded-xl border border-[#123D24]/10">
                      <div className="text-[11px] font-bold text-[#5D675A] uppercase tracking-wider">Total Customer Reviews</div>
                      <div className="text-2xl font-bold text-[#123D24] mt-1">{reviews.length}</div>
                      <div className="text-[11px] text-[#5D675A] mt-0.5">Synced across storefront & admin</div>
                    </div>
                    <div className="bg-[#FFFDF7] p-3.5 rounded-xl border border-[#123D24]/10">
                      <div className="text-[11px] font-bold text-[#5D675A] uppercase tracking-wider">Average Rating</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-[#123D24]">
                          {reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
                            : '5.0'}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#D8B84B] text-[#D8B84B]" />
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#5D675A] mt-0.5">Based on verified tri-cities orders</div>
                    </div>
                    <div className="bg-[#FFFDF7] p-3.5 rounded-xl border border-[#123D24]/10">
                      <div className="text-[11px] font-bold text-[#5D675A] uppercase tracking-wider">Verified Buyers</div>
                      <div className="text-2xl font-bold text-[#123D24] mt-1">
                        {reviews.filter((r) => r.verified).length}
                      </div>
                      <div className="text-[11px] text-[#123D24] font-medium mt-0.5">
                        {reviews.length > 0
                          ? `${Math.round((reviews.filter((r) => r.verified).length / reviews.length) * 100)}% verified rate`
                          : '100%'}
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D675A]" />
                      <input
                        type="text"
                        placeholder="Search feedback by customer, location, or quote..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#FFFDF7] border border-[#123D24]/15 rounded-xl text-xs text-[#20251F] focus:outline-none focus:ring-1 focus:ring-[#123D24]"
                      />
                    </div>
                    <div className="text-xs text-[#5D675A] self-center">
                      Showing{' '}
                      <span className="font-bold text-[#123D24]">
                        {
                          reviews.filter((r) => {
                            if (!reviewSearch.trim()) return true;
                            const query = reviewSearch.toLowerCase();
                            return (
                              r.name.toLowerCase().includes(query) ||
                              r.location.toLowerCase().includes(query) ||
                              r.comment.toLowerCase().includes(query) ||
                              (r.productName && r.productName.toLowerCase().includes(query))
                            );
                          }).length
                        }
                      </span>{' '}
                      reviews
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews
                      .filter((r) => {
                        if (!reviewSearch.trim()) return true;
                        const query = reviewSearch.toLowerCase();
                        return (
                          r.name.toLowerCase().includes(query) ||
                          r.location.toLowerCase().includes(query) ||
                          r.comment.toLowerCase().includes(query) ||
                          (r.productName && r.productName.toLowerCase().includes(query))
                        );
                      })
                      .map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-[#FFFDF7] rounded-xl border border-[#123D24]/10 p-5 transition-all hover:border-[#123D24]/20 hover:shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              {/* Avatar Initial */}
                              <div className="w-9 h-9 rounded-full bg-[#123D24] text-[#FFF9E9] flex items-center justify-center font-bold text-sm shrink-0">
                                {rev.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-[#123D24]">{rev.name}</span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5D675A] bg-[#123D24]/5 px-2 py-0.5 rounded-full">
                                    <MapPin className="w-2.5 h-2.5 text-[#123D24]" />
                                    {rev.location}
                                  </span>
                                  {rev.verified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                                      <Check className="w-2.5 h-2.5" />
                                      Verified Buyer
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#5D675A] mt-0.5">
                                  Reviewed for: <strong className="text-[#123D24]">{rev.productName || 'NutriCrunch Specialty'}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Stars & Date */}
                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < rev.rating
                                        ? 'fill-[#D8B84B] text-[#D8B84B]'
                                        : 'text-[#123D24]/20'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-mono text-[#5D675A]">
                                {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Review Quote */}
                          <p className="text-xs text-[#20251F]/85 italic bg-white p-3 rounded-lg border border-[#123D24]/10 leading-relaxed">
                            "{rev.comment}"
                          </p>

                          {/* Management Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#123D24]/5">
                            <button
                              type="button"
                              onClick={() => handleToggleReviewVerified(rev)}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                                rev.verified
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-stone-50 text-[#5D675A] border-stone-200 hover:bg-stone-100'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{rev.verified ? 'Marked as Verified' : 'Mark as Verified Buyer'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id, rev.name)}
                              className="text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Review</span>
                            </button>
                          </div>
                        </div>
                      ))}

                    {reviews.length === 0 && (
                      <div className="py-12 text-center text-xs text-[#5D675A] bg-[#FFFDF7] rounded-xl border border-dashed border-[#123D24]/20">
                        No customer reviews found. Reviews submitted from the storefront will appear here.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 2: CONTACT INQUIRIES */}
              {inquirySubTab === 'inquiries' && (
                <div className="pt-5 divide-y divide-[#123D24]/10">
                  {inquiries.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[#5D675A]">No contact inquiries recorded yet.</p>
                  ) : (
                    inquiries.map((inq) => (
                      <div key={inq.id} className="py-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-[#123D24]">{inq.name}</strong>
                            <span className="font-mono text-[#5D675A]">+91 {inq.phone}</span>
                            {inq.email && <span className="text-[#5D675A]">({inq.email})</span>}
                          </div>
                          <span className="text-[11px] font-mono text-[#5D675A]">
                            {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="font-semibold text-[#123D24]">{inq.subject}</div>
                        <p className="text-[#5D675A] bg-[#FFFDF7] p-3 rounded-xl border border-[#123D24]/10">
                          {inq.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: SETTINGS ================= */}
        {activeTab === 'settings' && settings && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs p-6 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between border-b border-[#123D24]/10 pb-4">
              <div>
                <h3 className="font-bold text-base text-[#123D24]">Store & Delivery Configurations</h3>
                <p className="text-xs text-[#5D675A]">Configure Tri-Cities delivery boundaries and payment options</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

            {settingsSavedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                {settingsSavedMessage}
              </div>
            )}

            {/* Product Catalog & LocalStorage Persistence Management */}
            <div className="p-5 bg-white rounded-2xl border border-[#123D24]/15 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#FFF9E9] text-[#123D24] rounded-xl border border-[#123D24]/10">
                    <Database className="w-5 h-5 text-[#56783B]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#123D24]">
                      Product Catalog & LocalStorage System
                    </h4>
                    <p className="text-[11px] text-[#5D675A]">
                      Immediate client-side caching & persistent Base64 image data storage
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Storage Active ({storageStats.count} Products · {storageStats.formattedSize})
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#FFFDF7] rounded-xl border border-[#123D24]/10 text-xs text-[#5D675A] space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="font-bold text-[#123D24] block text-[11px] uppercase">
                      Persistence Engine
                    </span>
                    <span className="text-emerald-700 font-semibold">Browser LocalStorage</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#123D24] block text-[11px] uppercase">
                      Cached Products
                    </span>
                    <span className="font-mono text-[#123D24] font-bold">
                      {products.length} live catalog items
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#123D24] block text-[11px] uppercase">
                      Image Resilience
                    </span>
                    <span className="text-[#123D24]">Data URLs (Zero 404s)</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#5D675A] pt-1">
                  All newly added items, price changes, and uploaded product images are saved to browser localStorage immediately. Data persists indefinitely across reboots, tab refreshes, and network disconnections.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#123D24]/10">
                <div>
                  <span className="text-xs font-bold text-rose-900 block">Catalog Reset Fallback</span>
                  <span className="text-[11px] text-[#5D675A]">
                    Restore factory original food products (Panjiri & Banana Chips)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResetCatalog}
                  disabled={isResettingCatalog}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold hover:bg-rose-100 hover:text-rose-900 transition-colors shadow-xs disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResettingCatalog ? 'animate-spin' : ''}`} />
                  <span>{isResettingCatalog ? 'Restoring Defaults...' : 'Reset Catalog to Defaults'}</span>
                </button>
              </div>
            </div>

            {/* Supabase PostgreSQL Integration Card */}
            <div className="p-5 bg-[#FFF9E9] rounded-2xl border border-[#123D24]/15 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#123D24] text-[#D8B84B] rounded-xl">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#123D24]">
                      Supabase PostgreSQL Integration
                    </h4>
                    <p className="text-[11px] text-[#5D675A]">
                      Persistent cloud database with Row-Level Security (RLS) policies
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      supabaseStatus?.connected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : supabaseStatus?.configured
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {supabaseStatus?.connected
                      ? '● Supabase Connected'
                      : supabaseStatus?.configured
                      ? '● Schema Sync Required'
                      : '● Local Atomic DB Active'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={loadSupabaseStatus}
                    className="p-1 text-[#123D24] hover:bg-[#F5ECCE] rounded-lg"
                    title="Refresh status"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#5D675A] space-y-1.5 pt-1">
                <p>
                  <strong>Current Endpoint:</strong>{' '}
                  <code className="font-mono text-[#123D24] bg-white px-2 py-0.5 rounded border border-[#123D24]/10">
                    {supabaseStatus?.url || 'https://your-project.supabase.co (Configured in .env)'}
                  </code>
                </p>
                <p className="text-[11px]">
                  {supabaseStatus?.message || 'Local and Supabase tables stay synchronized automatically.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#123D24]/10">
                <button
                  type="button"
                  onClick={handleSyncSupabase}
                  disabled={isSyncingSupabase}
                  className="px-4 py-2 bg-[#56783B] text-white rounded-xl text-xs font-bold hover:bg-[#435E2D] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSupabase ? 'Synchronizing Tables...' : 'Sync Products to Supabase'}</span>
                </button>

                <span className="text-[11px] text-[#5D675A]">
                  Schema migrations located at <code className="font-mono text-[#123D24]">supabase/schema.sql</code>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#123D24] mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">Support Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">Support WhatsApp (E.164)</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">
                  Local Tri-Cities Delivery Fee (INR)
                </label>
                <input
                  type="number"
                  value={settings.serviceZones[0]?.fee || 40}
                  onChange={(e) => {
                    const zones = [...settings.serviceZones];
                    if (zones[0]) zones[0].fee = Number(e.target.value);
                    setSettings({ ...settings, serviceZones: zones });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">
                  Local Tri-Cities Free Delivery Threshold (INR)
                </label>
                <input
                  type="number"
                  value={settings.serviceZones[0]?.freeAbove || 499}
                  onChange={(e) => {
                    const zones = [...settings.serviceZones];
                    if (zones[0]) zones[0].freeAbove = Number(e.target.value);
                    setSettings({ ...settings, serviceZones: zones });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                />
              </div>
            </div>
          </form>
        )}

        {/* ================= TAB 6: AUDIT LOGS ================= */}
        {activeTab === 'audit' && analytics && (
          <div className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-[#123D24]">Administrative Security & Audit Trail</h3>
            <p className="text-xs text-[#5D675A]">
              Immutable audit records for all operations including logins, inventory adjustments, and status changes.
            </p>

            <div className="divide-y divide-[#123D24]/10">
              {analytics.auditLogs?.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#123D24] uppercase text-[11px] bg-[#FFF9E9] px-2 py-0.5 rounded border border-[#123D24]/10">
                      {log.action}
                    </span>
                    <p className="text-[#20251F] mt-1">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-[#5D675A] block">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-mono text-[#5D675A]">IP: {log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: ACCOUNT / PROFILE SETTINGS ================= */}
        {activeTab === 'account' && (
          <div className="space-y-6 max-w-4xl">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FFF9E9] text-[#123D24] rounded-xl border border-[#123D24]/10">
                  <KeyRound className="w-6 h-6 text-[#123D24]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#123D24]">Admin Account & Credentials</h3>
                  <p className="text-xs text-[#5D675A]">
                    Update your administrator login email / username and security password. Changes are immediately persisted to the database and will be required for subsequent logins.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Account Profile Details Card */}
            <div className="bg-[#FFFDF7] rounded-2xl border border-[#123D24]/15 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#5D675A] block uppercase tracking-wider">
                  Active Admin Username / Email
                </span>
                <span className="font-mono font-bold text-sm text-[#123D24] block mt-0.5 break-all">
                  {admin?.email || 'nutricrunch@2026'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#5D675A] block uppercase tracking-wider">
                  Role & Privileges
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#123D24] text-[#FFF9E9] mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="capitalize">{admin?.role || 'Super Admin'}</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#5D675A] block uppercase tracking-wider">
                  Auth Persistence Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Database & Supabase Active
                </span>
              </div>
            </div>

            {/* In-view Account Feedback Toast */}
            {accountFeedback && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 animate-in fade-in ${
                  accountFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs'
                    : 'bg-rose-50 text-rose-900 border border-rose-300 shadow-xs'
                }`}
              >
                {accountFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p>{accountFeedback.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAccountFeedback(null)}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label="Dismiss feedback"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Profile & Credentials Management Form */}
            <form
              onSubmit={handleUpdateAccount}
              className="bg-white rounded-2xl border border-[#123D24]/10 shadow-xs p-6 space-y-6"
            >
              <div className="border-b border-[#123D24]/10 pb-4">
                <h4 className="font-bold text-sm text-[#123D24]">Update Login Credentials</h4>
                <p className="text-xs text-[#5D675A]">
                  Enter your current password to authorize changes to your email or security password.
                </p>
              </div>

              <div className="space-y-5">
                {/* Field 1: New Admin Email / Username */}
                <div>
                  <label className="block text-xs font-bold text-[#123D24] mb-1.5">
                    New Admin Email / Username *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      required
                      placeholder="e.g. nutricrunch@2026 or your_custom_username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] font-medium focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-[#5D675A] mt-1 block">
                    This is the email or username you will enter to log in to the Admin Dashboard.
                  </span>
                </div>

                {/* Field 2: Current Password (Required to authorize) */}
                <div className="p-4 bg-[#FFF9E9]/60 rounded-xl border border-[#123D24]/15 space-y-1.5">
                  <label className="block text-xs font-bold text-[#123D24]">
                    Current Password * (Identity Verification)
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter your current password"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] bg-white focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123D24]"
                      aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-[#5D675A] block">
                    Required for security validation before credentials can be modified.
                  </span>
                </div>

                {/* Password Change Section (Optional) */}
                <div className="pt-2 border-t border-[#123D24]/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#123D24]">
                      Change Password (Optional)
                    </span>
                    <span className="text-[11px] text-[#56783B]">
                      Leave empty to keep your existing password
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 3: New Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#123D24] mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123D24]"
                          aria-label={showNewPass ? 'Hide password' : 'Show password'}
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Field 4: Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-[#123D24] mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#123D24]/20 text-xs text-[#123D24] focus:ring-2 focus:ring-[#123D24] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#123D24]"
                          aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {newPassword && (
                    <div className="text-[11px] text-[#5D675A] bg-[#F7F4EB] p-2.5 rounded-lg flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#56783B]" />
                      <span>
                        Password match:{' '}
                        {confirmPassword ? (
                          newPassword === confirmPassword ? (
                            <strong className="text-emerald-700">Passwords match ✓</strong>
                          ) : (
                            <strong className="text-rose-700">Passwords do not match ✗</strong>
                          )
                        ) : (
                          'Waiting for confirmation'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#123D24]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAccountEmail(admin?.email || '');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setAccountFeedback(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-[#5D675A] hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B] transition-all shadow-sm disabled:opacity-50"
                >
                  {isSavingAccount ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ================= MODAL: PRODUCT EDIT / CREATE ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#123D24]/10 pb-4">
              <h3 className="font-bold text-lg text-[#123D24]">
                {editingProduct ? 'Edit Product Details' : 'Add New Real Food Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[#5D675A] hover:text-[#123D24] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#123D24] mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#123D24] mb-1">Category *</label>
                  <select
                    value={productForm.category || 'Traditional Panjiri'}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                  >
                    <option value="Traditional Panjiri">Traditional Panjiri</option>
                    <option value="Banana Chips & Snacks">Banana Chips & Snacks</option>
                    <option value="Dry Fruits & Grains">Dry Fruits & Grains</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#123D24] mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#123D24] mb-1">Original Price / MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#123D24] mb-1">Stock Units *</label>
                  <input
                    type="number"
                    value={productForm.stock !== undefined ? productForm.stock : ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: Number(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#123D24] mb-1">Package Weight *</label>
                  <input
                    type="text"
                    value={productForm.packageWeight || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, packageWeight: e.target.value })
                    }
                    placeholder="e.g. 500g"
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#123D24] mb-1">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. NC-PANJ-500G"
                    className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                />
              </div>

              {/* Product Image Upload & Preview */}
              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#123D24]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#123D24]">
                    Product Packaging / Food Image *
                  </label>
                  <span className="text-[11px] text-[#56783B] font-medium">
                    Persistent Base64 Data URL (Max 8MB · Zero Broken Links)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Live Preview Box */}
                  <div className="w-20 h-20 rounded-xl bg-white p-2 border border-[#123D24]/20 shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                    <ProductImage
                      src={productForm.images?.[0] || '/assets/panjiri-pouch.svg'}
                      alt="Product Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123D24] text-[#FFF9E9] rounded-lg text-xs font-semibold hover:bg-[#0E2E1B] transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                          disabled={isUploadingImage}
                        />
                      </label>

                      {isUploadingImage && (
                        <span className="text-xs text-[#C76525] font-semibold animate-pulse flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{uploadProgress || 'Processing upload...'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={productForm.images?.[0] || ''}
                        onChange={(e) =>
                          setProductForm({ ...productForm, images: [e.target.value] })
                        }
                        placeholder="Or enter image URL / storage path"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#123D24]/20 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#5D675A]">
                  <span className="font-semibold text-[#123D24]">Brand Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({ ...productForm, images: ['/assets/panjiri-pouch.svg'] })
                    }
                    className="px-2 py-0.5 rounded bg-white border border-[#123D24]/10 hover:bg-[#F5ECCE] text-[#123D24]"
                  >
                    Panjiri Pouch
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({ ...productForm, images: ['/assets/banana-chips-pouch.svg'] })
                    }
                    className="px-2 py-0.5 rounded bg-white border border-[#123D24]/10 hover:bg-[#F5ECCE] text-[#123D24]"
                  >
                    Banana Chips Pouch
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({ ...productForm, images: ['/assets/panjiri-bowl.svg'] })
                    }
                    className="px-2 py-0.5 rounded bg-white border border-[#123D24]/10 hover:bg-[#F5ECCE] text-[#123D24]"
                  >
                    Panjiri Urli Bowl
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({ ...productForm, images: ['/assets/banana-chips-bowl.svg'] })
                    }
                    className="px-2 py-0.5 rounded bg-white border border-[#123D24]/10 hover:bg-[#F5ECCE] text-[#123D24]"
                  >
                    Chips Ceramic Bowl
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#123D24] mb-1">
                  Ingredients (comma separated)
                </label>
                <input
                  type="text"
                  value={productForm.ingredients?.join(', ') || ''}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      ingredients: e.target.value.split(',').map((s) => s.trim())
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#123D24]/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5D675A] hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123D24] text-[#FFF9E9] text-xs font-bold rounded-xl hover:bg-[#0E2E1B]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS & STATUS UPDATE ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#123D24]/10 pb-4">
              <div>
                <span className="text-[11px] text-[#5D675A]">Order Reference</span>
                <h3 className="font-mono font-bold text-lg text-[#123D24]">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#5D675A] hover:text-[#123D24] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer summary */}
              <div className="p-4 bg-[#FFF9E9] rounded-2xl border border-[#123D24]/10 space-y-1">
                <div className="font-bold text-sm text-[#123D24]">{selectedOrder.customer.name}</div>
                <div className="text-[#5D675A]">{selectedOrder.customer.address}</div>
                <div className="text-[#5D675A]">
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pinCode}
                </div>
                <div className="font-mono font-bold text-[#123D24] pt-1">
                  Phone: +91 {selectedOrder.customer.phone}
                </div>
              </div>

              {/* Status transition controls */}
              <div className="p-4 bg-white rounded-2xl border border-[#123D24]/15 space-y-3">
                <label className="block font-bold text-[#123D24]">Update Order Status</label>
                <div className="flex gap-2">
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#123D24]/20 font-semibold text-[#123D24]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>

                  <button
                    onClick={handleUpdateOrderStatus}
                    className="px-4 py-2 bg-[#123D24] text-[#FFF9E9] font-bold rounded-xl hover:bg-[#0E2E1B]"
                  >
                    Update
                  </button>
                </div>

                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional status transition note (e.g. Dispatched with delivery executive Srikanth)"
                  className="w-full px-3 py-2 rounded-xl border border-[#123D24]/20 text-xs"
                />
              </div>

              {/* Items ordered */}
              <div className="space-y-2">
                <div className="font-bold text-[#123D24] uppercase tracking-wider">Order Items</div>
                <div className="divide-y divide-[#123D24]/10 border rounded-xl overflow-hidden">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="p-3 flex items-center justify-between">
                      <div>
                        <strong>{it.productName}</strong>
                        <p className="text-[11px] text-[#5D675A]">
                          Qty: {it.quantity} × ₹{it.price} ({it.packageWeight})
                        </p>
                      </div>
                      <span className="font-mono font-bold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-between font-bold text-sm text-[#123D24] pt-2 border-t">
                <span>Total Amount Paid / Due</span>
                <span className="font-mono text-base">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              {selectedOrder.orderStatus !== 'Refunded' ? (
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100"
                >
                  Record Order Refund
                </button>
              ) : (
                <span className="text-xs font-bold text-rose-700">Order Already Refunded</span>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD REFUND ================= */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-[#123D24] text-base">
              Record Refund for {selectedOrder.orderNumber}
            </h4>
            <p className="text-xs text-[#5D675A]">
              This will update the order status to Refunded, restore inventory quantities, and log the action.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#123D24] mb-1">
                Refund Reason / Notes
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Customer cancelled before dispatch / Package damaged"
                className="w-full p-2.5 rounded-xl border border-[#123D24]/20 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
