import { Product } from '../types';

export const CATALOG_STORAGE_KEY = 'nutricrunch_custom_catalog';
export const CATALOG_UPDATED_EVENT = 'nutricrunch_catalog_updated';

// Default products bundled in code
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-panjiri-01',
    slug: 'nutricrunch-dry-fruits-panjiri',
    name: 'NutriCrunch Artisanal Panjiri',
    category: 'Traditional Panjiri',
    price: 799,
    originalPrice: 899,
    discountPercent: 11,
    packageWeight: '500g',
    weight: '500g',
    stock: 45,
    sku: 'NC-PANJ-500G',
    published: true,
    isFeatured: true,
    description: 'Wholesome artisanal dry fruits panjiri slow-roasted in pure cow desi ghee.',
    ingredients: ['Pure Cow Desi Ghee', 'California Almonds', 'Cashews', 'Lotus Seeds', 'Organic Unrefined Jaggery', 'Green Cardamom'],
    allergenInfo: 'Contains Tree Nuts, Milk Solid (Pure Desi Ghee), Gluten.',
    dietary: ['100% Vegetarian', 'Pure Desi Ghee', 'No Refined Sugar', 'Preservative Free'],
    shelfLife: '4 Months',
    storageInstructions: 'Store in a cool, dry place. Seal tightly.',
    images: ['/assets/panjiri-pouch.svg', '/assets/panjiri-bowl.svg'],
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
  },
  {
    id: 'prod-banana-02',
    slug: 'nutricrunch-banana-chips',
    name: 'Kerala-Style Crispy Banana Chips',
    category: 'Banana Chips & Snacks',
    price: 199,
    originalPrice: 249,
    discountPercent: 20,
    packageWeight: '250g',
    weight: '250g',
    stock: 80,
    sku: 'NC-BAN-250G',
    published: true,
    isFeatured: true,
    description: 'Crispy Nendran banana chips cooked in 100% cold-pressed coconut oil.',
    ingredients: ['Raw Nendran Plantains', 'Cold-Pressed Coconut Oil', 'Rock Salt'],
    allergenInfo: 'Manufactured in facility handling nuts. Gluten-free.',
    dietary: ['100% Vegan', 'Gluten Free', 'No Palm Oil', 'Cold-Pressed Coconut Oil'],
    shelfLife: '3 Months',
    storageInstructions: 'Store in a cool, dry place.',
    images: ['/assets/banana-chips-pouch.svg', '/assets/banana-chips-bowl.svg'],
    image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087'
  }
];

/**
 * Retrieves catalog. Returns saved admin changes if present in localStorage,
 * otherwise falls back to INITIAL_PRODUCTS.
 */
export function getStoredCatalog(): Product[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_PRODUCTS;
  }

  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return INITIAL_PRODUCTS;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return []; // Admin explicitly removed all products

      const isValid = parsed.every(
        (item) => item && typeof item === 'object' && item.id && item.name && typeof item.price === 'number'
      );
      if (isValid) {
        return parsed as Product[];
      }
    }
  } catch (err) {
    console.warn('Failed to parse catalog from localStorage:', err);
  }
  return INITIAL_PRODUCTS;
}

/**
 * Saves modified product list (from Admin panel) to browser localStorage.
 */
export function saveStoredCatalog(products: Product[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    if (!Array.isArray(products)) return false;

    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));

    window.dispatchEvent(
      new CustomEvent(CATALOG_UPDATED_EVENT, {
        detail: { products }
      })
    );

    return true;
  } catch (err) {
    console.error('Failed to save catalog to localStorage:', err);
    return false;
  }
}

/**
 * Clears custom catalog from localStorage and restores INITIAL_PRODUCTS.
 */
export function clearStoredCatalog(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.removeItem(CATALOG_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(CATALOG_UPDATED_EVENT, {
        detail: { products: INITIAL_PRODUCTS }
      })
    );
  } catch (err) {
    console.warn('Failed to clear catalog from localStorage:', err);
  }
}

/**
 * Calculates storage diagnostics for the admin settings panel.
 */
export function getCatalogStorageStats(): {
  isCustom: boolean;
  count: number;
  sizeBytes: number;
  formattedSize: string;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isCustom: false, count: INITIAL_PRODUCTS.length, sizeBytes: 0, formattedSize: '0 KB' };
  }

  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) {
      return { isCustom: false, count: INITIAL_PRODUCTS.length, sizeBytes: 0, formattedSize: '0 KB' };
    }

    const parsed = JSON.parse(raw);
    const count = Array.isArray(parsed) ? parsed.length : 0;
    const sizeBytes = new Blob([raw]).size;
    const formattedSize =
      sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(sizeBytes / 1024).toFixed(1)} KB`;

    return {
      isCustom: true,
      count,
      sizeBytes,
      formattedSize
    };
  } catch {
    return { isCustom: false, count: INITIAL_PRODUCTS.length, sizeBytes: 0, formattedSize: '0 KB' };
  }
}
