import { Product } from '../types';

export const CATALOG_STORAGE_KEY = 'nutricrunch_custom_catalog';
export const CATALOG_UPDATED_EVENT = 'nutricrunch_catalog_updated';

// Default products bundled in code
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'NutriCrunch Artisanal Panjiri',
    category: 'Panjiri',
    price: 799,
    weight: '500g',
    description: 'Wholesome artisanal dry fruits panjiri slow-roasted in pure cow desi ghee.',
    ingredients: ['Pure Cow Desi Ghee', 'California Almonds', 'Cashews', 'Lotus Seeds', 'Organic Unrefined Jaggery', 'Green Cardamom'],
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    in_stock: true
  },
  {
    id: '2',
    name: 'Kerala-Style Crispy Banana Chips',
    category: 'Banana Chips',
    price: 199,
    weight: '250g',
    description: 'Crispy Nendran banana chips cooked in 100% cold-pressed coconut oil.',
    ingredients: ['Raw Nendran Plantains', 'Cold-Pressed Coconut Oil', 'Rock Salt'],
    image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087',
    in_stock: true
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
