export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  ingredients: string[];
  allergenInfo: string;
  packageWeight: string;
  stock: number;
  sku: string;
  published: boolean;
  isFeatured: boolean;
  dietary: string[];
  shelfLife: string;
  storageInstructions: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  slug: string;
  quantity: number;
  price: number;
  packageWeight: string;
  image?: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    district?: string;
    state: string;
    pinCode: string;
    deliveryInstructions?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'whatsapp' | 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'verified' | 'failed' | 'refunded';
  orderStatus:
    | 'Pending'
    | 'Confirmed'
    | 'Processing'
    | 'Packed'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'Refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  refundReason?: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  instagramUrl?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  serviceZones: {
    name: string;
    pinCodes: string[];
    fee: number;
    freeAbove: number;
  }[];
  nationalShippingFee: number;
  nationalFreeAbove: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: 'new' | 'responded';
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  rating: number; // 1 to 5 stars
  comment: string;
  verified: boolean;
  productName?: string;
  createdAt: string;
  status?: 'published' | 'pending' | 'hidden';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isCustom?: boolean;
  updatedAt?: string;
}

export interface AnalyticsSummary {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    aov: number;
    totalProducts: number;
    lowStockProducts: number;
    uniqueVisitors: number;
    productViews: number;
    conversionRate: string;
  };
  salesByProduct: { name: string; qty: number; revenue: number }[];
  salesByCity: { city: string; revenue: number }[];
  trends: { label: string; revenue: number; orders: number }[];
  auditLogs: { id: string; action: string; details: string; timestamp: string; ip: string }[];
}
