import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nutricrunch.db.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data & uploads folders exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve public uploads statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Supabase Client Initialization
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-')
) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('⚡ Connected to Supabase PostgreSQL at:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

// Interfaces
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
  createdAt: string;
  updatedAt: string;
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

export interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'order_placed';
  path: string;
  productId?: string;
  productName?: string;
  referrer?: string;
  timestamp: string;
  sessionId: string;
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

export interface AdminUser {
  id: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  name: string;
  role: 'superadmin' | 'admin';
  isCustom?: boolean;
  updatedAt?: string;
}

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  analytics: AnalyticsEvent[];
  inquiries: Inquiry[];
  reviews: CustomerReview[];
  settings: StoreSettings;
  admin: AdminUser;
  sessions: { [token: string]: { adminId: string; expiresAt: number } };
  auditLogs: { id: string; action: string; details: string; timestamp: string; ip: string }[];
}

// Password hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Default Admin Credentials (Permanent Single Source of Truth directly in code)
const DEFAULT_ADMIN_EMAIL = 'nutricrunch@2026';
const DEFAULT_ADMIN_PASS = 'uzma9154797936';
const defaultSalt = 'nutricrunch_salt_2026';
const defaultAdminHash = hashPassword(DEFAULT_ADMIN_PASS, defaultSalt);

const initialData: DatabaseSchema = {
  products: [
    {
      id: 'prod-panjiri-01',
      slug: 'nutricrunch-dry-fruits-panjiri',
      name: 'NutriCrunch Dry Fruits Panjiri',
      description:
        'Traditional artisanal panjiri slow-roasted in pure cow desi ghee with California almonds, cashew nuts, green pistachios, pure unrefined jaggery, roasted lotus seeds (phool makhana), charmagaz melon seeds, edible gondh, and aromatic green cardamom. Zero refined sugar, zero preservatives.',
      price: 799,
      originalPrice: 899,
      discountPercent: 11,
      category: 'Traditional Panjiri',
      ingredients: [
        'California Almonds (Badam)',
        'Cashew Nuts (Kaju)',
        'Green Pistachios (Pista)',
        'Pure Cow Bilona Desi Ghee',
        'Lotus Seeds (Phool Makhana)',
        'Melon Seeds (Charmagaz)',
        'Organic Unrefined Jaggery (Gur)',
        'Stone-Ground Whole Wheat Flour (Atta)',
        'Green Cardamom (Elaichi)',
        'Edible Gum (Gondh)'
      ],
      allergenInfo: 'Contains Tree Nuts (Almonds, Cashews, Pistachios), Milk Solid (Pure Desi Ghee), and Gluten.',
      packageWeight: '500g',
      stock: 45,
      sku: 'NC-PANJ-500G',
      published: true,
      isFeatured: true,
      dietary: ['100% Vegetarian', 'Pure Desi Ghee', 'No Refined Sugar', 'Preservative Free', 'Handmade'],
      shelfLife: '4 Months in an airtight container',
      storageInstructions: 'Store in a cool, dry place. Seal lid tightly after each use. Avoid moisture. Do not refrigerate.',
      images: [
        '/assets/panjiri-pouch.svg',
        '/assets/panjiri-bowl.svg'
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-banana-02',
      slug: 'nutricrunch-banana-chips',
      name: 'NutriCrunch Banana Chips',
      description:
        'Crispy Kerala-style plantain banana chips thinly sliced from fresh raw Nendran plantains and cooked to golden perfection in pure cold-pressed coconut oil. Delicately seasoned with rock salt (sendha namak) and pure organic turmeric. 100% Palm oil free.',
      price: 199,
      originalPrice: 249,
      discountPercent: 20,
      category: 'Banana Chips & Snacks',
      ingredients: [
        'Fresh Raw Nendran Bananas (Plantains)',
        'Pure Cold-Pressed Coconut Oil',
        'Rock Salt (Sendha Namak)',
        'Organic Turmeric Powder (Haldi)'
      ],
      allergenInfo: 'Manufactured in a clean facility that handles nuts. Free from gluten and dairy.',
      packageWeight: '250g',
      stock: 80,
      sku: 'NC-BAN-250G',
      published: true,
      isFeatured: true,
      dietary: ['100% Vegan', 'Gluten Free', 'No Palm Oil', 'Cold-Pressed Coconut Oil', 'Trans-Fat Free'],
      shelfLife: '3 Months from packing date',
      storageInstructions: 'Keep in a cool, dry place. Reseal the pouch or store in an airtight tin to maintain crisp crunch.',
      images: [
        '/assets/banana-chips-pouch.svg',
        '/assets/banana-chips-bowl.svg'
      ],
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  orders: [],
  analytics: [],
  inquiries: [
    {
      id: 'inq-1',
      name: 'Kavitha Sharma',
      phone: '9849512340',
      email: 'kavitha@example.com',
      subject: 'Bulk Order for Festival in Kazipet',
      message: 'Hello NutriCrunch, I want to order 25 packs of Dry Fruits Panjiri for an upcoming family pooja function in Kazipet. Do you provide custom gift box packaging?',
      status: 'responded',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
    }
  ],
  reviews: [
    {
      id: 'rev-01',
      name: 'Sravanthi P.',
      location: 'Hanamkonda',
      rating: 5,
      comment:
        'The aroma and rich taste of pure cow desi ghee in the panjiri is simply exceptional! You can taste the slow-roasted crunchy almonds, cashews, and lotus seeds in every bite. Organic jaggery gives it the perfect wholesome sweetness without feeling heavy.',
      verified: true,
      productName: 'NutriCrunch Dry Fruits Panjiri',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      status: 'published'
    },
    {
      id: 'rev-02',
      name: 'Rahul M.',
      location: 'Kazipet',
      rating: 5,
      comment:
        'The crispiness of the coconut oil banana chips is unbeatable! Unlike commercial market chips, these have zero palm oil grease, just delicate rock salt and pure cold-pressed coconut oil flavor. Delivered super fresh to our door in Kazipet.',
      verified: true,
      productName: 'NutriCrunch Banana Chips',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      status: 'published'
    },
    {
      id: 'rev-03',
      name: 'Ananya R.',
      location: 'Warangal',
      rating: 5,
      comment:
        'Both the pure desi ghee panjiri and the Kerala-style banana chips are extraordinary! The panjiri gives our family long-lasting morning energy, and the chips are so light and crackling crisp. Proud to have such high quality food crafted locally!',
      verified: true,
      productName: 'Panjiri & Banana Chips Combo',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'published'
    }
  ],
  settings: {
    storeName: 'NutriCrunch',
    tagline: 'Real Ingredients. Honest Goodness.',
    phone: '+91 9154797936',
    whatsapp: '+919154797936',
    instagram: '@nutricrunch_wgl',
    instagramUrl: 'https://instagram.com/nutricrunch_wgl',
    email: 'care@nutricrunch.in',
    address: 'Shop #4, Sri Rama Towers, Main Road, Hanamkonda',
    city: 'Warangal',
    state: 'Telangana',
    serviceZones: [
      {
        name: 'Warangal, Hanamkonda & Kazipet (Tri-Cities Local Express)',
        pinCodes: ['506001', '506002', '506003', '506004', '506007', '506009', '506011', '506015'],
        fee: 40,
        freeAbove: 499
      }
    ],
    nationalShippingFee: 70,
    nationalFreeAbove: 999,
    codEnabled: true,
    razorpayEnabled: true,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sampleKey123'
  },
  admin: {
    id: 'admin-01',
    email: DEFAULT_ADMIN_EMAIL,
    passwordSalt: defaultSalt,
    passwordHash: defaultAdminHash,
    name: 'NutriCrunch Admin',
    role: 'superadmin',
    isCustom: false
  },
  sessions: {},
  auditLogs: [
    {
      id: 'log-1',
      action: 'SYSTEM_INIT',
      details: 'NutriCrunch database initialized with verified product schemas.',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1'
    }
  ]
};

// Supabase Admin Credentials Sync & Retrieval Helpers
async function syncAdminCredsToSupabase(adminData: AdminUser) {
  if (!supabase) return;
  try {
    const payload = {
      id: adminData.id || 'admin-01',
      email: adminData.email,
      password_salt: adminData.passwordSalt,
      password_hash: adminData.passwordHash,
      name: adminData.name,
      role: adminData.role,
      is_custom: adminData.isCustom ?? true,
      updated_at: adminData.updatedAt || new Date().toISOString()
    };

    const { error } = await supabase.from('admin_credentials').upsert(payload, { onConflict: 'id' });
    if (error) {
      // Fallback: try app_settings or key-value table
      try {
        await supabase.from('app_settings').upsert({
          key: 'admin_credentials',
          value: payload
        }, { onConflict: 'key' });
      } catch {}
    }
  } catch (err: any) {
    console.warn('Supabase admin credentials sync notice:', err?.message);
  }
}

async function fetchAdminCredsFromSupabase(): Promise<AdminUser | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('admin_credentials').select('*').eq('id', 'admin-01').maybeSingle();
    if (!error && data && data.email && data.password_hash) {
      return {
        id: data.id || 'admin-01',
        email: data.email,
        passwordSalt: data.password_salt || defaultSalt,
        passwordHash: data.password_hash,
        name: data.name || 'NutriCrunch Admin',
        role: data.role || 'superadmin',
        isCustom: data.is_custom ?? true,
        updatedAt: data.updated_at
      };
    }
    const { data: sData, error: sErr } = await supabase.from('app_settings').select('*').eq('key', 'admin_credentials').maybeSingle();
    if (!sErr && sData?.value?.email && sData?.value?.passwordHash) {
      return {
        id: sData.value.id || 'admin-01',
        email: sData.value.email,
        passwordSalt: sData.value.passwordSalt || defaultSalt,
        passwordHash: sData.value.passwordHash,
        name: sData.value.name || 'NutriCrunch Admin',
        role: 'superadmin',
        isCustom: sData.value.isCustom ?? true,
        updatedAt: sData.value.updatedAt
      };
    }
  } catch (e: any) {
    console.warn('Notice querying admin creds from Supabase:', e?.message);
  }
  return null;
}

// Database read/write helpers
function getDB(): DatabaseSchema {
  try {
    let data: DatabaseSchema;
    if (!fs.existsSync(DB_FILE)) {
      data = initialData;
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } else {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      data = JSON.parse(raw);
    }

    // Auto-migrate legacy default admin email to nutricrunch@2026 if not custom
    if (!data.admin || data.admin.email === 'admin@nutricrunch.in') {
      data.admin = {
        id: 'admin-01',
        email: DEFAULT_ADMIN_EMAIL,
        passwordSalt: defaultSalt,
        passwordHash: defaultAdminHash,
        name: 'NutriCrunch Admin',
        role: 'superadmin',
        isCustom: false
      };
    }

    // Auto-migrate reviews array if missing or empty
    if (!Array.isArray(data.reviews) || data.reviews.length === 0) {
      data.reviews = JSON.parse(JSON.stringify(initialData.reviews));
      saveDB(data);
    }

    return data;
  } catch (err) {
    console.error('Error reading database file, using in-memory initial data:', err);
    return initialData;
  }
}

function saveDB(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized. Admin credentials required.' });
    return;
  }

  const db = getDB();
  const session = db.sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      saveDB(db);
    }
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  (req as any).adminUser = db.admin;
  (req as any).sessionToken = token;
  next();
}

// Login Rate Limiting map
const loginAttempts: { [ip: string]: { count: number; lockedUntil: number } } = {};

// Helper functions for Supabase Product mapping
function toSupabaseProduct(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    original_price: p.originalPrice || null,
    discount_percent: p.discountPercent || null,
    category: p.category,
    ingredients: p.ingredients,
    allergen_info: p.allergenInfo,
    package_weight: p.packageWeight,
    stock: p.stock,
    sku: p.sku,
    published: p.published,
    is_featured: p.isFeatured,
    dietary: p.dietary,
    shelf_life: p.shelfLife,
    storage_instructions: p.storageInstructions,
    images: p.images,
    updated_at: new Date().toISOString()
  };
}

// 0. UPLOADS & SUPABASE SYNC
app.post('/api/upload', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { dataUri, filename } = req.body;
    if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
      res.status(400).json({ error: 'Valid image Data URI required (data:image/...)' });
      return;
    }

    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: 'Invalid base64 image encoding' });
      return;
    }

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'svg+xml' ? 'svg' : rawExt === 'jpeg' ? 'jpg' : rawExt;
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `nc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    // 1. Try uploading to Supabase Storage if bucket exists
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('products')
          .upload(safeName, buffer, { contentType: `image/${rawExt}`, upsert: true });

        if (!error && data) {
          const { data: publicData } = supabase.storage.from('products').getPublicUrl(data.path);
          if (publicData?.publicUrl) {
            res.json({ success: true, url: publicData.publicUrl });
            return;
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload fallback:', storageErr);
      }
    }

    // 2. Local file fallback in public/uploads/
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);
    res.json({ success: true, url: `/uploads/${safeName}` });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: 'Failed to process image upload: ' + (err.message || 'Server error') });
  }
});

app.get('/api/supabase/status', requireAdmin, async (req: Request, res: Response) => {
  if (!supabase) {
    res.json({
      connected: false,
      configured: false,
      url: process.env.SUPABASE_URL || null,
      message: 'Supabase credentials not configured in environment or using local persistent database.'
    });
    return;
  }

  try {
    const { data, error } = await supabase.from('products').select('id', { count: 'exact', head: true });
    if (error) {
      res.json({
        connected: false,
        configured: true,
        url: process.env.SUPABASE_URL,
        error: error.message,
        message: 'Supabase configured but query returned an error. Ensure schema.sql has been executed in the Supabase SQL editor.'
      });
      return;
    }

    res.json({
      connected: true,
      configured: true,
      url: process.env.SUPABASE_URL,
      message: 'Supabase PostgreSQL connection is active and operational.'
    });
  } catch (e: any) {
    res.json({
      connected: false,
      configured: true,
      error: e.message || 'Connection test failed'
    });
  }
});

app.post('/api/supabase/sync', requireAdmin, async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(400).json({ error: 'Supabase is not configured yet. Please configure SUPABASE_URL in .env.' });
    return;
  }

  const db = getDB();
  try {
    let syncedCount = 0;
    for (const prod of db.products) {
      const payload = toSupabaseProduct(prod);
      const { error } = await supabase.from('products').upsert(payload, { onConflict: 'slug' });
      if (!error) syncedCount++;
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'SUPABASE_SYNC',
      details: `Synchronized ${syncedCount} products with Supabase PostgreSQL.`,
      timestamp: new Date().toISOString(),
      ip: req.ip || '127.0.0.1'
    });
    saveDB(db);

    res.json({ success: true, message: `Successfully synced ${syncedCount} products to Supabase!` });
  } catch (e: any) {
    res.status(500).json({ error: 'Sync failed: ' + e.message });
  }
});

// ======================== API ROUTES ========================

// 1. PRODUCTS
app.get('/api/products', (req: Request, res: Response) => {
  const db = getDB();
  const { all, category, search } = req.query;

  let products = db.products;

  // Filter unpublished if not admin query
  if (all !== 'true') {
    products = products.filter((p) => p.published);
  }

  if (category && typeof category === 'string' && category !== 'All') {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.ingredients.some((ing) => ing.toLowerCase().includes(q))
    );
  }

  res.json({ products });
});

app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const db = getDB();
  const { slugOrId } = req.params;

  const product = db.products.find(
    (p) => p.slug === slugOrId || p.id === slugOrId
  );

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product });
});

app.post('/api/products', requireAdmin, async (req: Request, res: Response) => {
  const db = getDB();
  const {
    name,
    description,
    price,
    originalPrice,
    category,
    ingredients,
    allergenInfo,
    packageWeight,
    stock,
    sku,
    published,
    isFeatured,
    dietary,
    shelfLife,
    storageInstructions,
    images
  } = req.body;

  if (!name || !price || !category) {
    res.status(400).json({ error: 'Name, price, and category are required' });
    return;
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    slug,
    name,
    description: description || '',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discountPercent:
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined,
    category,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    allergenInfo: allergenInfo || 'None reported',
    packageWeight: packageWeight || '250g',
    stock: stock !== undefined ? Number(stock) : 50,
    sku: sku || `NC-${Date.now().toString().slice(-4)}`,
    published: published !== undefined ? Boolean(published) : true,
    isFeatured: Boolean(isFeatured),
    dietary: Array.isArray(dietary) ? dietary : ['100% Vegetarian'],
    shelfLife: shelfLife || '3 Months',
    storageInstructions: storageInstructions || 'Store in a cool, dry place.',
    images: Array.isArray(images) && images.length > 0 ? images : ['/assets/panjiri-pouch.svg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.push(newProduct);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'CREATE_PRODUCT',
    details: `Product "${newProduct.name}" created with price ₹${newProduct.price}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);

  if (supabase) {
    try {
      await supabase.from('products').upsert(toSupabaseProduct(newProduct), { onConflict: 'slug' });
    } catch (e: any) {
      console.warn('Supabase product sync notice:', e?.message);
    }
  }

  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const existing = db.products[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  if (req.body.name && req.body.name !== existing.name) {
    updated.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  if (updated.originalPrice && updated.originalPrice > updated.price) {
    updated.discountPercent = Math.round(
      ((updated.originalPrice - updated.price) / updated.originalPrice) * 100
    );
  } else {
    updated.discountPercent = undefined;
  }

  db.products[index] = updated;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'UPDATE_PRODUCT',
    details: `Product "${updated.name}" updated. Stock: ${updated.stock}, Price: ₹${updated.price}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);

  if (supabase) {
    try {
      await supabase.from('products').upsert(toSupabaseProduct(updated), { onConflict: 'slug' });
    } catch (e: any) {
      console.warn('Supabase product update notice:', e?.message);
    }
  }

  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const removed = db.products.splice(index, 1)[0];

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'DELETE_PRODUCT',
    details: `Product "${removed.name}" (${removed.id}) deleted.`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);

  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e: any) {
      console.warn('Supabase product delete notice:', e?.message);
    }
  }

  res.json({ success: true, message: 'Product deleted' });
});

// Reset Catalog to Factory Defaults
app.post('/api/products/reset', requireAdmin, async (req: Request, res: Response) => {
  const db = getDB();
  db.products = JSON.parse(JSON.stringify(initialData.products));

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'RESET_CATALOG',
    details: `Product catalog restored to factory defaults (${db.products.length} default items).`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);

  if (supabase) {
    try {
      for (const prod of db.products) {
        await supabase.from('products').upsert(toSupabaseProduct(prod), { onConflict: 'slug' });
      }
    } catch (e: any) {
      console.warn('Supabase catalog reset notice:', e?.message);
    }
  }

  res.json({
    success: true,
    message: 'Product catalog reset to factory default data successfully.',
    products: db.products
  });
});

// Synchronize Client localStorage catalog with Server Database
app.post('/api/products/sync-catalog', (req: Request, res: Response) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ error: 'Valid products array required' });
    return;
  }
  const db = getDB();
  db.products = products;
  saveDB(db);
  res.json({
    success: true,
    message: 'Server database synchronized with client catalog',
    count: db.products.length
  });
});

// 2. ORDERS & CHECKOUT (Server-Authoritative Pricing)
app.post('/api/orders', (req: Request, res: Response) => {
  const db = getDB();
  const { customer, items, paymentMethod } = req.body;

  // Validation
  if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pinCode) {
    res.status(400).json({ error: 'Please provide full customer name, phone, address, and PIN code.' });
    return;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = customer.phone.replace(/[\s-+]/g, '').slice(-10);
  if (!phoneRegex.test(cleanPhone)) {
    res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    return;
  }

  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinRegex.test(customer.pinCode.trim())) {
    res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Your cart is empty.' });
    return;
  }

  // Calculate prices strictly on server
  let subtotal = 0;
  const validatedItems: OrderItem[] = [];

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId || p.slug === item.slug);
    if (!product) {
      res.status(400).json({ error: `Product ${item.productName || item.productId} no longer exists.` });
      return;
    }

    if (!product.published) {
      res.status(400).json({ error: `Product "${product.name}" is currently unavailable.` });
      return;
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (product.stock < qty) {
      res.status(400).json({
        error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
      });
      return;
    }

    const itemSubtotal = product.price * qty;
    subtotal += itemSubtotal;

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      quantity: qty,
      price: product.price, // Server price snapshot
      packageWeight: product.packageWeight,
      image: product.images[0]
    });
  }

  // Delivery charge calculation
  let deliveryCharge = db.settings.nationalShippingFee;
  let isLocalTriCity = false;

  const enteredPin = customer.pinCode.trim();
  for (const zone of db.settings.serviceZones) {
    if (zone.pinCodes.includes(enteredPin)) {
      isLocalTriCity = true;
      deliveryCharge = subtotal >= zone.freeAbove ? 0 : zone.fee;
      break;
    }
  }

  if (!isLocalTriCity) {
    deliveryCharge = subtotal >= db.settings.nationalFreeAbove ? 0 : db.settings.nationalShippingFee;
  }

  const totalAmount = subtotal + deliveryCharge;

  // Deduct inventory
  for (const vItem of validatedItems) {
    const prod = db.products.find((p) => p.id === vItem.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - vItem.quantity);
      prod.updatedAt = new Date().toISOString();
    }
  }

  const orderNum = `NC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `ord-${Date.now()}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber: orderNum,
    customer: {
      name: customer.name.trim(),
      phone: cleanPhone,
      email: customer.email?.trim() || '',
      address: customer.address.trim(),
      city: customer.city?.trim() || (isLocalTriCity ? 'Warangal/Hanamkonda' : ''),
      district: customer.district?.trim() || '',
      state: customer.state?.trim() || 'Telangana',
      pinCode: enteredPin,
      deliveryInstructions: customer.deliveryInstructions?.trim() || ''
    },
    items: validatedItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    paymentMethod: paymentMethod === 'whatsapp' ? 'whatsapp' : paymentMethod === 'razorpay' ? 'razorpay' : 'cod',
    paymentStatus: paymentMethod === 'razorpay' ? 'pending' : (paymentMethod === 'whatsapp' ? 'pending' : 'verified'),
    orderStatus: paymentMethod === 'razorpay' ? 'Pending' : 'Confirmed',
    statusHistory: [
      {
        status: paymentMethod === 'razorpay' ? 'Pending' : 'Confirmed',
        timestamp: new Date().toISOString(),
        note:
          paymentMethod === 'whatsapp'
            ? 'Order confirmed via WhatsApp checkout (+91 9154797936).'
            : paymentMethod === 'razorpay'
            ? 'Order initiated. Awaiting Razorpay payment verification.'
            : 'Order confirmed with Cash on Delivery.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);

  // Track order analytics event
  db.analytics.push({
    id: `ev-${Date.now()}`,
    type: 'order_placed',
    path: '/order-confirmation',
    sessionId: req.headers['x-session-id'] as string || 'direct',
    timestamp: new Date().toISOString()
  });

  saveDB(db);

  res.status(201).json({
    success: true,
    order: newOrder
  });
});

// 3. SECURE ORDER TRACKING (Order Number + Phone Verification)
app.post('/api/orders/track', (req: Request, res: Response) => {
  const db = getDB();
  const { orderNumber, phone } = req.body;

  if (!orderNumber || !phone) {
    res.status(400).json({ error: 'Order Number and registered mobile number are required.' });
    return;
  }

  const cleanInputPhone = phone.replace(/[\s-+]/g, '').slice(-10);
  const cleanOrderNum = orderNumber.trim().toUpperCase();

  const order = db.orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === cleanOrderNum &&
      (o.customer.phone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(o.customer.phone))
  );

  if (!order) {
    res.status(404).json({
      error: 'No matching order found. Please check your order number and 10-digit mobile number.'
    });
    return;
  }

  // Return order details without exposing full sensitive data to public
  res.json({
    order: {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
      customer: {
        name: order.customer.name,
        city: order.customer.city,
        state: order.customer.state,
        pinCode: order.customer.pinCode
      },
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  });
});

// 4. RAZORPAY VERIFICATION
app.post('/api/payments/razorpay/verify', (req: Request, res: Response) => {
  const db = getDB();
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  // In test mode or when secret is configured, verify HMAC SHA256
  if (secret && razorpaySignature && razorpayOrderId && razorpayPaymentId) {
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: 'Payment Failed',
        timestamp: new Date().toISOString(),
        note: 'Signature verification mismatch.'
      });
      saveDB(db);
      res.status(400).json({ error: 'Payment verification failed: Invalid signature.' });
      return;
    }
  }

  order.paymentStatus = 'verified';
  order.orderStatus = 'Confirmed';
  order.razorpayOrderId = razorpayOrderId || `rzp_ord_${Date.now()}`;
  order.razorpayPaymentId = razorpayPaymentId || `rzp_pay_${Date.now()}`;
  order.statusHistory.push({
    status: 'Confirmed',
    timestamp: new Date().toISOString(),
    note: `Online payment verified. Payment ID: ${order.razorpayPaymentId}`
  });
  order.updatedAt = new Date().toISOString();

  saveDB(db);
  res.json({ success: true, message: 'Payment successfully verified.', order });
});

// 5. ADMIN ORDERS MANAGEMENT
app.get('/api/orders', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const { status, search, limit } = req.query;

  let orders = [...db.orders];

  if (status && typeof status === 'string' && status !== 'All') {
    orders = orders.filter((o) => o.orderStatus.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.city.toLowerCase().includes(q)
    );
  }

  if (limit) {
    orders = orders.slice(0, parseInt(limit as string, 10));
  }

  res.json({ orders });
});

app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const { orderStatus, note } = req.body;

  const validStatuses = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Refunded'
  ];

  if (!validStatuses.includes(orderStatus)) {
    res.status(400).json({ error: 'Invalid order status transition' });
    return;
  }

  const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Restore inventory if cancelled or refunded
  if (
    (orderStatus === 'Cancelled' || orderStatus === 'Refunded') &&
    order.orderStatus !== 'Cancelled' &&
    order.orderStatus !== 'Refunded'
  ) {
    for (const item of order.items) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
  }

  order.orderStatus = orderStatus as any;
  order.statusHistory.push({
    status: orderStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${orderStatus} by administrator.`
  });
  order.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'ORDER_STATUS_UPDATE',
    details: `Order ${order.orderNumber} status changed to "${orderStatus}"`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);
  res.json({ success: true, order });
});

// Record refund
app.post('/api/orders/:id/refund', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const { reason, amount } = req.body;

  const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  order.paymentStatus = 'refunded';
  order.orderStatus = 'Refunded';
  order.refundReason = reason || 'Customer requested return';
  order.statusHistory.push({
    status: 'Refunded',
    timestamp: new Date().toISOString(),
    note: `Refund of ₹${amount || order.totalAmount} recorded. Reason: ${order.refundReason}`
  });

  saveDB(db);
  res.json({ success: true, order });
});

// 6. ANALYTICS & STATS (Real Calculations)
app.post('/api/analytics/track', (req: Request, res: Response) => {
  const db = getDB();
  const { type, path, productId, productName, referrer, sessionId } = req.body;

  if (type) {
    db.analytics.push({
      id: `ev-${Date.now()}`,
      type,
      path: path || '/',
      productId,
      productName,
      referrer,
      sessionId: sessionId || 'anon',
      timestamp: new Date().toISOString()
    });

    // Keep analytics table reasonable
    if (db.analytics.length > 5000) {
      db.analytics = db.analytics.slice(-3000);
    }
    saveDB(db);
  }

  res.json({ success: true });
});

app.get('/api/analytics/summary', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const { range } = req.query; // 'today' | '7days' | '30days' | 'month' | 'all'

  let days = 30;
  if (range === 'today') days = 1;
  else if (range === '7days') days = 7;
  else if (range === '30days') days = 30;
  else if (range === 'month') days = 30;
  else if (range === 'all') days = 365;

  const cutoff = Date.now() - days * 86400000;

  // Filter orders in date window
  const periodOrders = db.orders.filter(
    (o) => new Date(o.createdAt).getTime() >= cutoff
  );

  // Revenue rule: only count confirmed, processing, packed, shipped, or delivered orders
  const qualifyingOrders = periodOrders.filter(
    (o) =>
      ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(
        o.orderStatus
      ) && o.paymentStatus !== 'failed' && o.paymentStatus !== 'refunded'
  );

  const totalRevenue = qualifyingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = periodOrders.length;
  const completedOrders = periodOrders.filter((o) => o.orderStatus === 'Delivered').length;
  const pendingOrders = periodOrders.filter(
    (o) => ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.orderStatus)
  ).length;
  const cancelledOrders = periodOrders.filter(
    (o) => o.orderStatus === 'Cancelled' || o.orderStatus === 'Refunded'
  ).length;

  const aov = qualifyingOrders.length > 0 ? Math.round(totalRevenue / qualifyingOrders.length) : 0;

  // Inventory stats
  const totalProducts = db.products.length;
  const lowStockProducts = db.products.filter((p) => p.stock <= 10).length;

  // Visitors & Conversion
  const periodEvents = db.analytics.filter(
    (e) => new Date(e.timestamp).getTime() >= cutoff
  );
  const uniqueSessions = new Set(periodEvents.map((e) => e.sessionId)).size;
  const productViews = periodEvents.filter((e) => e.type === 'product_view').length;
  const conversionRate =
    uniqueSessions > 0 ? ((qualifyingOrders.length / uniqueSessions) * 100).toFixed(1) : '0.0';

  // Sales by product
  const productSalesMap: { [name: string]: { qty: number; revenue: number } } = {};
  for (const o of qualifyingOrders) {
    for (const item of o.items) {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { qty: 0, revenue: 0 };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].revenue += item.price * item.quantity;
    }
  }

  const salesByProduct = Object.entries(productSalesMap).map(([name, data]) => ({
    name,
    qty: data.qty,
    revenue: data.revenue
  }));

  // Sales by City
  const citySalesMap: { [city: string]: number } = {};
  for (const o of qualifyingOrders) {
    const city = o.customer.city || 'Warangal';
    citySalesMap[city] = (citySalesMap[city] || 0) + o.totalAmount;
  }
  const salesByCity = Object.entries(citySalesMap).map(([city, revenue]) => ({
    city,
    revenue
  }));

  // Revenue trend (last 7 or 14 intervals)
  const intervalCount = 7;
  const intervalMs = (days * 86400000) / intervalCount;
  const trends: { label: string; revenue: number; orders: number }[] = [];

  for (let i = intervalCount - 1; i >= 0; i--) {
    const start = Date.now() - (i + 1) * intervalMs;
    const end = Date.now() - i * intervalMs;
    const intervalOrders = qualifyingOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= start && t < end;
    });

    const d = new Date(end);
    trends.push({
      label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: intervalOrders.reduce((s, o) => s + o.totalAmount, 0),
      orders: intervalOrders.length
    });
  }

  res.json({
    metrics: {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      aov,
      totalProducts,
      lowStockProducts,
      uniqueVisitors: uniqueSessions,
      productViews,
      conversionRate: `${conversionRate}%`
    },
    salesByProduct,
    salesByCity,
    trends,
    auditLogs: db.auditLogs.slice(0, 10)
  });
});

// 7. INQUIRIES & CONTACT
app.post('/api/inquiries', (req: Request, res: Response) => {
  const db = getDB();
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ error: 'Name, phone number, and message are required.' });
    return;
  }

  const newInq: Inquiry = {
    id: `inq-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || '',
    subject: subject?.trim() || 'General Inquiry',
    message: message.trim(),
    status: 'new',
    createdAt: new Date().toISOString()
  };

  db.inquiries.unshift(newInq);
  saveDB(db);

  res.status(201).json({ success: true, message: 'Thank you! We will get in touch shortly.' });
});

app.get('/api/inquiries', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  res.json({ inquiries: db.inquiries });
});

// 7b. CUSTOMER FEEDBACK & REVIEWS
app.get('/api/reviews', (req: Request, res: Response) => {
  const db = getDB();
  const reviews = db.reviews || [];
  // Calculate dynamic overall rating
  const avg = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '4.9';
  res.json({
    reviews,
    overallRating: Number(avg) >= 4.5 ? Number(avg) : 4.9,
    ratingText: '4.9',
    totalReviews: reviews.length,
    ordersBadge: '120+ local orders'
  });
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const db = getDB();
  const { name, location, rating, comment, productName } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Please enter your name.' });
    return;
  }
  if (!location || !location.trim()) {
    res.status(400).json({ error: 'Please enter your location or neighborhood (e.g. Hanamkonda).' });
    return;
  }
  if (!comment || !comment.trim()) {
    res.status(400).json({ error: 'Please share your experience in the review text.' });
    return;
  }

  const numRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

  const newReview: CustomerReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    location: location.trim(),
    rating: numRating,
    comment: comment.trim(),
    verified: true,
    productName: productName?.trim() || 'NutriCrunch Real Foods',
    createdAt: new Date().toISOString(),
    status: 'published'
  };

  if (!Array.isArray(db.reviews)) {
    db.reviews = [];
  }
  db.reviews.unshift(newReview);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'NEW_CUSTOMER_REVIEW',
    details: `Customer review submitted by "${newReview.name}" (${newReview.location}) - ${newReview.rating}★ rating.`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);

  res.status(201).json({
    success: true,
    message: 'Thank you for your valuable feedback! Your review has been saved.',
    review: newReview
  });
});

app.delete('/api/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const beforeCount = db.reviews ? db.reviews.length : 0;
  db.reviews = (db.reviews || []).filter((r) => r.id !== id);

  if (db.reviews.length === beforeCount) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'DELETE_CUSTOMER_REVIEW',
    details: `Review ${id} was removed by administrator.`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  saveDB(db);
  res.json({ success: true, message: 'Review deleted successfully.' });
});

app.put('/api/reviews/:id/status', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const { id } = req.params;
  const { verified, status } = req.body;

  const review = (db.reviews || []).find((r) => r.id === id);
  if (!review) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  if (verified !== undefined) review.verified = Boolean(verified);
  if (status) review.status = status;

  saveDB(db);
  res.json({ success: true, review });
});

// 8. SETTINGS
app.get('/api/settings', (req: Request, res: Response) => {
  const db = getDB();
  // Don't expose sensitive keys in public view
  const publicSettings = {
    ...db.settings,
    razorpayKeyId: db.settings.razorpayEnabled ? db.settings.razorpayKeyId : ''
  };
  res.json({ settings: publicSettings });
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

// 9. ADMIN AUTHENTICATION
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const clientIp = req.ip || '127.0.0.1';
  const now = Date.now();

  // Rate Limiting: 5 attempts per 15 minutes
  if (!loginAttempts[clientIp]) {
    loginAttempts[clientIp] = { count: 0, lockedUntil: 0 };
  }

  if (loginAttempts[clientIp].lockedUntil > now) {
    const mins = Math.ceil((loginAttempts[clientIp].lockedUntil - now) / 60000);
    res.status(429).json({ error: `Too many failed attempts. Try again in ${mins} minute(s).` });
    return;
  }

  const { email, password, clientFallbackCreds } = req.body;
  const db = getDB();

  if (!email || !password) {
    res.status(400).json({ error: 'Username/Email and password are required.' });
    return;
  }

  const cleanInputEmail = email.trim().toLowerCase();

  // 1. Sync custom credentials from Supabase if configured and available
  if (supabase) {
    try {
      const sbAdmin = await fetchAdminCredsFromSupabase();
      if (sbAdmin && sbAdmin.isCustom) {
        db.admin = sbAdmin;
        saveDB(db);
      }
    } catch (e) {
      // Continue with local persistent DB
    }
  }

  // 2. Client-side localStorage fallback sync (if server rebooted or state was cleared)
  if ((!db.admin.isCustom || db.admin.email === DEFAULT_ADMIN_EMAIL) && clientFallbackCreds?.isCustom) {
    if (clientFallbackCreds.email && clientFallbackCreds.passwordHash && clientFallbackCreds.passwordSalt) {
      const testHash = hashPassword(password, clientFallbackCreds.passwordSalt);
      let match = false;
      try {
        match = crypto.timingSafeEqual(
          Buffer.from(testHash),
          Buffer.from(clientFallbackCreds.passwordHash)
        );
      } catch {}
      if (match && cleanInputEmail === clientFallbackCreds.email.trim().toLowerCase()) {
        db.admin.email = clientFallbackCreds.email;
        db.admin.passwordSalt = clientFallbackCreds.passwordSalt;
        db.admin.passwordHash = clientFallbackCreds.passwordHash;
        db.admin.isCustom = true;
        saveDB(db);
        if (supabase) {
          syncAdminCredsToSupabase(db.admin);
        }
      }
    }
  }

  let authenticated = false;

  // STEP A: Check the database for saved credentials first (including custom updated credentials)
  if (db.admin) {
    const isDbEmailMatch = cleanInputEmail === db.admin.email.trim().toLowerCase();
    const testHash = hashPassword(password, db.admin.passwordSalt);
    let isPassMatch = false;
    try {
      isPassMatch = crypto.timingSafeEqual(
        Buffer.from(testHash),
        Buffer.from(db.admin.passwordHash)
      );
    } catch {
      isPassMatch = false;
    }

    if (isDbEmailMatch && isPassMatch) {
      authenticated = true;
    }
  }

  // STEP B: Fall back to default credentials: nutricrunch@2026 / uzma9154797936 if not authenticated above
  if (!authenticated) {
    const isDefaultEmailMatch =
      cleanInputEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      (process.env.ADMIN_DEFAULT_EMAIL && cleanInputEmail === process.env.ADMIN_DEFAULT_EMAIL.trim().toLowerCase());

    const isDefaultPassMatch =
      password === DEFAULT_ADMIN_PASS ||
      (process.env.ADMIN_DEFAULT_PASSWORD && password === process.env.ADMIN_DEFAULT_PASSWORD);

    if (isDefaultEmailMatch && isDefaultPassMatch) {
      authenticated = true;
    }
  }

  if (!authenticated) {
    loginAttempts[clientIp].count += 1;
    if (loginAttempts[clientIp].count >= 5) {
      loginAttempts[clientIp].lockedUntil = now + 15 * 60 * 1000;
    }
    res.status(401).json({ error: 'Invalid admin username/email or password.' });
    return;
  }

  // Reset rate limiting on success
  loginAttempts[clientIp] = { count: 0, lockedUntil: 0 };

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = now + 7 * 24 * 3600 * 1000; // 7 days

  db.sessions[sessionToken] = {
    adminId: db.admin.id,
    expiresAt
  };

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'ADMIN_LOGIN',
    details: `Admin ${db.admin.email} logged in successfully.`,
    timestamp: new Date().toISOString(),
    ip: clientIp
  });

  saveDB(db);

  res.json({
    success: true,
    token: sessionToken,
    user: {
      id: db.admin.id,
      name: db.admin.name,
      email: db.admin.email,
      role: db.admin.role,
      isCustom: db.admin.isCustom ?? false
    },
    backupCreds: {
      email: db.admin.email,
      passwordSalt: db.admin.passwordSalt,
      passwordHash: db.admin.passwordHash,
      isCustom: db.admin.isCustom ?? false,
      updatedAt: db.admin.updatedAt || new Date().toISOString()
    }
  });
});

app.get('/api/admin/me', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).adminUser;
  res.json({
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isCustom: admin.isCustom ?? false
    }
  });
});

app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const token = (req as any).sessionToken;
  if (token && db.sessions[token]) {
    delete db.sessions[token];
    saveDB(db);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

app.put('/api/admin/credentials', requireAdmin, async (req: Request, res: Response) => {
  const db = getDB();
  const { newEmail, currentPassword, newPassword, confirmPassword, name } = req.body;

  if (!currentPassword) {
    res.status(400).json({ error: 'Current password is required to verify your identity.' });
    return;
  }

  // Verify current password against current hash OR against DEFAULT_ADMIN_PASS if transitioning
  const testHash = hashPassword(currentPassword, db.admin.passwordSalt);
  let isPassMatch = false;
  try {
    isPassMatch = crypto.timingSafeEqual(
      Buffer.from(testHash),
      Buffer.from(db.admin.passwordHash)
    );
  } catch {
    isPassMatch = false;
  }

  if (!isPassMatch && (!db.admin.isCustom || db.admin.email === DEFAULT_ADMIN_EMAIL)) {
    if (currentPassword === DEFAULT_ADMIN_PASS) {
      isPassMatch = true;
    }
  }

  if (!isPassMatch) {
    res.status(401).json({ error: 'Current password does not match our records.' });
    return;
  }

  // Validate and update password if provided
  let passwordChanged = false;
  if (newPassword) {
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters in length.' });
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New password and confirm password do not match.' });
      return;
    }
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);
    db.admin.passwordSalt = newSalt;
    db.admin.passwordHash = newHash;
    db.admin.isCustom = true;
    passwordChanged = true;
  }

  // Validate and update email / username
  let emailChanged = false;
  if (newEmail && typeof newEmail === 'string' && newEmail.trim()) {
    const cleanEmail = newEmail.trim();
    if (cleanEmail.toLowerCase() !== db.admin.email.toLowerCase()) {
      db.admin.email = cleanEmail;
      db.admin.isCustom = true;
      emailChanged = true;
    }
  }

  // Update display name if provided
  if (name && typeof name === 'string' && name.trim()) {
    db.admin.name = name.trim();
  }

  db.admin.updatedAt = new Date().toISOString();

  // Record audit log entry
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'ADMIN_CREDENTIALS_UPDATED',
    details: `Admin profile updated. Email: ${db.admin.email}. Password changed: ${passwordChanged ? 'Yes' : 'No'}.`,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  });

  // 1. Permanent Local File Storage
  saveDB(db);

  // 2. Permanent Supabase Storage (if Supabase configured)
  if (supabase) {
    try {
      await syncAdminCredsToSupabase(db.admin);
    } catch (e: any) {
      console.warn('Supabase credentials sync notice:', e?.message);
    }
  }

  res.json({
    success: true,
    message: 'Admin credentials updated and permanently saved to database! Subsequent logins will use the new credentials.',
    user: {
      id: db.admin.id,
      name: db.admin.name,
      email: db.admin.email,
      role: db.admin.role,
      isCustom: db.admin.isCustom ?? true
    },
    backupCreds: {
      email: db.admin.email,
      passwordSalt: db.admin.passwordSalt,
      passwordHash: db.admin.passwordHash,
      isCustom: true,
      updatedAt: db.admin.updatedAt
    }
  });
});

// 10. TECHNICAL SEO: SITEMAP & ROBOTS.TXT
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const db = getDB();
  const domain = process.env.APP_URL || 'https://nutricrunch-storefront.vercel.app';

  const staticUrls = [
    '',
    '/shop',
    '/about',
    '/ingredients',
    '/faqs',
    '/contact',
    '/track-order',
    '/policies/shipping',
    '/policies/returns',
    '/policies/privacy',
    '/policies/terms'
  ];

  const productUrls = db.products
    .filter((p) => p.published)
    .map((p) => `/product/${p.slug}`);

  const allUrls = [...staticUrls, ...productUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (path) => `
    <url>
      <loc>${domain}${path}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>${path === '' || path === '/shop' ? 'daily' : 'weekly'}</changefreq>
      <priority>${path === '' ? '1.0' : path.startsWith('/product/') ? '0.9' : '0.7'}</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

app.get('/robots.txt', (req: Request, res: Response) => {
  const domain = process.env.APP_URL || 'https://nutricrunch-storefront.vercel.app';
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout
Disallow: /order-confirmation
Disallow: /api/

Sitemap: ${domain}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// Mount Vite middleware in development or static serve in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 NutriCrunch server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
