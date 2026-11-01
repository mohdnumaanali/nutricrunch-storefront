# NutriCrunch — Vercel & Supabase Production Deployment Guide

> **“Real Ingredients. Honest Goodness.”**  
> Complete deployment, database migration, and payment configuration manual for NutriCrunch.

---

## 1. Architecture Overview

- **Frontend & Full-Stack Engine:** React 19 + TypeScript + Tailwind CSS v4 + Express Node.js Server (`server.ts`)
- **Database (Dual Support):** 
  - **Embedded Persistent Engine:** Zero-config file database (`data/nutricrunch.db.json`) running out-of-the-box in development and containerized environments (Google Cloud Run / Node hosts).
  - **Supabase PostgreSQL:** Production relational database schema (`supabase/schema.sql`) with Row-Level Security (RLS) policies and seed data ready for 1-click execution in the Supabase SQL Editor.
- **Payments:** Cash on Delivery (COD) + Razorpay UPI / Cards with server-side HMAC-SHA256 signature verification.
- **SEO & Social:** Dynamic XML sitemap (`/sitemap.xml`), `robots.txt`, OpenGraph cards, Twitter cards, and Schema.org `LocalBusiness` JSON-LD markup.

---

## 2. Supabase PostgreSQL Setup

1. Go to [supabase.com](https://supabase.com) and create a new project (e.g., `nutricrunch-production`).
2. Choose a region closest to your primary customer base (e.g. `ap-south-1` Mumbai, India).
3. Open the **SQL Editor** in your Supabase project dashboard.
4. Open the file `supabase/schema.sql` located in this repository.
5. Copy the entire contents of `supabase/schema.sql` and paste it into the Supabase SQL query editor, then click **Run**.
6. This will create:
   - `public.products` (with constraints, indices, and verified initial seeds)
   - `public.orders` (with customer details, order statuses, and price snapshots)
   - `public.order_items` (with relational links to products and orders)
   - `public.inquiries` (customer contact messages)
   - `public.store_settings` (configurable delivery thresholds and fees)
   - `public.analytics_events` (first-party privacy-conscious visitor events)
   - Row-Level Security (RLS) policies ensuring customers only access permitted data and admin routes remain protected.

---

## 3. Razorpay Payment Gateway Integration

1. Register or log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Account & Settings** → **API Keys**.
3. Generate your **Key Id** and **Key Secret** (start in Test Mode first).
4. In your `.env` or Vercel Environment Variables:
   - Set `RAZORPAY_KEY_ID=rzp_live_...` (or `rzp_test_...`)
   - Set `RAZORPAY_KEY_SECRET=...`
5. Server-side verification is handled automatically in `/api/payments/razorpay/verify` using cryptographic HMAC-SHA256 verification.

---

## 4. Vercel Deployment Steps

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "feat: NutriCrunch production e-commerce store"
git branch -M main
git remote add origin https://github.com/your-username/nutricrunch.git
git push -u origin main
```

### Step 2: Import Project in Vercel
1. Log in to [vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Select your `nutricrunch` repository and click **Import**.
3. Framework Preset: **Other** or **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm install`

### Step 3: Configure Environment Variables in Vercel
In the Vercel dashboard under **Settings → Environment Variables**, add:

| Variable Name | Description | Example / Production Value |
|---|---|---|
| `PORT` | Web server port | `3000` |
| `APP_URL` | Canonical domain URL | `https://nutricrunch.in` |
| `ADMIN_JWT_SECRET` | 32+ character random secret | `generate_with_openssl_rand_hex_32` |
| `ADMIN_DEFAULT_EMAIL` | Admin login email | `admin@nutricrunch.in` |
| `ADMIN_DEFAULT_PASSWORD` | Strong administrative password | `YourStrongAdminPassword#2026` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | `...` |
| `SUPABASE_URL` | Supabase Project URL | `https://your-proj.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Private Service Role | `eyJ...` |

Click **Deploy**.

---

## 5. Custom Domain Configuration (e.g. nutricrunch.in)

1. In Vercel, go to **Project Settings → Domains**.
2. Enter your custom domain: `nutricrunch.in` and `www.nutricrunch.in`.
3. In your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains):
   - Add an **A Record**: `@` pointing to `76.76.21.21`
   - Add a **CNAME Record**: `www` pointing to `cname.vercel-dns.com`
4. Vercel will automatically provision a free SSL certificate via Let's Encrypt.

---

## 6. Google Search Console & SEO Verification

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add your property `https://nutricrunch.in`.
3. Verify ownership via DNS TXT record or HTML meta tag in `index.html`.
4. Go to **Sitemaps** in the left sidebar and submit:
   ```
   https://nutricrunch.in/sitemap.xml
   ```
5. Google will crawl the sitemap, which automatically discovers all published products and pages.
6. Verify robots directives at:
   ```
   https://nutricrunch.in/robots.txt
   ```

---

## 7. Pre-Launch Acceptance Verification Checklist

- [x] **Storefront Browsing:** Mobile & Desktop navigation, categories, and product details work smoothly.
- [x] **Shopping Bag:** Line-item addition, quantity increment/decrement, subtotal calculation, and auto-persist.
- [x] **Checkout Validation:** Strict Indian 10-digit mobile number and 6-digit PIN code checking.
- [x] **Tri-Cities Delivery Logic:**
  - Warangal, Hanamkonda & Kazipet PIN codes (506001, etc.) qualify for ₹40 local fee, free above ₹499.
  - National addresses qualify for ₹70 courier shipping, free above ₹999.
- [x] **Order Persistence:** Unique reference (`NC-2026-XXXX`) generated and stored with server-verified prices.
- [x] **Secure Tracking:** Order lookup requires both the Order Number and the matching registered mobile number.
- [x] **Admin Authentication:** Protected route `/admin/login` with PBKDF2 salt hashing, rate limiting (5 attempts), and server tokens.
- [x] **Product Management:** Add, edit, publish/unpublish, manage stock, and delete with safety confirmation.
- [x] **Business Analytics:** Real database metrics (Qualifying Revenue, AOV, Conversion Rate, Sales by City, Sales by Product).
- [x] **SEO & Structured Data:** Schema.org `LocalBusiness` JSON-LD markup and valid sitemap.
- [x] **No Secrets Exposed:** Sensitive secrets are confined to server-side environment variables.
