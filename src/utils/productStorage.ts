import { Product } from '../types';

export const CATALOG_STORAGE_KEY = 'nutricrunch_custom_catalog';
export const CATALOG_UPDATED_EVENT = 'nutricrunch_catalog_updated';

/**
 * Retrieve saved product catalog from browser localStorage.
 * Returns null if no custom catalog is found or if parsing fails.
 */
export function getStoredCatalog(): Product[] | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate that items are valid product objects
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
  return null;
}

/**
 * Save the entire updated product catalog directly to browser localStorage immediately.
 * Broadcasts a custom event so all open views / components update instantly.
 */
export function saveStoredCatalog(products: Product[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    if (!Array.isArray(products)) return false;

    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));

    // Dispatch custom event for real-time storefront synchronization
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
 * Clear the custom product catalog from browser localStorage.
 * Used for restoring factory defaults.
 */
export function clearStoredCatalog(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.removeItem(CATALOG_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(CATALOG_UPDATED_EVENT, {
        detail: { products: null }
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
    return { isCustom: false, count: 0, sizeBytes: 0, formattedSize: '0 KB' };
  }

  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) {
      return { isCustom: false, count: 0, sizeBytes: 0, formattedSize: '0 KB' };
    }

    const count = (JSON.parse(raw) as any[]).length;
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
    return { isCustom: false, count: 0, sizeBytes: 0, formattedSize: '0 KB' };
  }
}
