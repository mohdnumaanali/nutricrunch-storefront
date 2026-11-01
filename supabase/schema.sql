-- ============================================================
-- NutriCrunch E-Commerce: Production Supabase PostgreSQL Schema
-- Tagline: "Real Ingredients. Honest Goodness."
-- Authoritative Schema with Row Level Security (RLS) & Triggers
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price),
    discount_percent INTEGER,
    category TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    allergen_info TEXT NOT NULL,
    package_weight TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku TEXT UNIQUE NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    dietary TEXT[] NOT NULL DEFAULT '{}',
    shelf_life TEXT NOT NULL,
    storage_instructions TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for storefront speed
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_district TEXT,
    customer_state TEXT NOT NULL DEFAULT 'Telangana',
    customer_pincode TEXT NOT NULL,
    delivery_instructions TEXT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN (
        'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'
    )),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    refund_reason TEXT,
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    slug TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    package_weight TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 5. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'responded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. First-Party Analytics Event Log
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    path TEXT NOT NULL,
    product_id TEXT,
    product_name TEXT,
    referrer TEXT,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read published products; only authenticated admin can modify
CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    USING (published = true);

CREATE POLICY "Admins have full access to products"
    ON public.products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Orders: Customers can insert orders via server/checkout; order tracking verified by phone
CREATE POLICY "Public can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Order Items
CREATE POLICY "Public can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins have full access to order items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Inquiries
CREATE POLICY "Public can submit inquiries"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view inquiries"
    ON public.inquiries FOR SELECT
    TO authenticated
    USING (true);

-- Settings
CREATE POLICY "Public can read store settings"
    ON public.store_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update store settings"
    ON public.store_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- Initial Seed Data: NutriCrunch Verified Products
-- ============================================================

INSERT INTO public.products (
    slug, name, description, price, original_price, discount_percent, category,
    ingredients, allergen_info, package_weight, stock, sku, published, is_featured,
    dietary, shelf_life, storage_instructions, images
) VALUES 
(
    'nutricrunch-dry-fruits-panjiri',
    'NutriCrunch Dry Fruits Panjiri',
    'Traditional artisanal panjiri slow-roasted in pure cow desi ghee with California almonds, cashew nuts, green pistachios, pure unrefined jaggery, roasted lotus seeds (phool makhana), charmagaz melon seeds, edible gondh, and aromatic green cardamom. Zero refined sugar, zero preservatives.',
    799.00,
    899.00,
    11,
    'Traditional Panjiri',
    ARRAY[
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
    'Contains Tree Nuts (Almonds, Cashews, Pistachios), Milk Solid (Pure Desi Ghee), and Gluten.',
    '500g',
    45,
    'NC-PANJ-500G',
    true,
    true,
    ARRAY['100% Vegetarian', 'Pure Desi Ghee', 'No Refined Sugar', 'Preservative Free', 'Handmade'],
    '4 Months in an airtight container',
    'Store in a cool, dry place. Seal lid tightly after each use. Avoid moisture. Do not refrigerate.',
    ARRAY['/assets/panjiri-pouch.svg']
),
(
    'nutricrunch-banana-chips',
    'NutriCrunch Banana Chips',
    'Crispy Kerala-style plantain banana chips thinly sliced from fresh raw Nendran plantains and cooked to golden perfection in pure cold-pressed coconut oil. Delicately seasoned with rock salt (sendha namak) and pure organic turmeric. 100% Palm oil free.',
    199.00,
    249.00,
    20,
    'Banana Chips & Snacks',
    ARRAY[
        'Fresh Raw Nendran Bananas (Plantains)',
        'Pure Cold-Pressed Coconut Oil',
        'Rock Salt (Sendha Namak)',
        'Organic Turmeric Powder (Haldi)'
    ],
    'Manufactured in a clean facility that handles nuts. Free from gluten and dairy.',
    '250g',
    80,
    'NC-BAN-250G',
    true,
    true,
    ARRAY['100% Vegan', 'Gluten Free', 'No Palm Oil', 'Cold-Pressed Coconut Oil', 'Trans-Fat Free'],
    '3 Months from packing date',
    'Keep in a cool, dry place. Reseal the pouch or store in an airtight tin to maintain crisp crunch.',
    ARRAY['/assets/banana-chips-pouch.svg']
)
ON CONFLICT (slug) DO NOTHING;
