import { CustomerReview } from '../types';

export const REVIEWS_STORAGE_KEY = 'nutricrunch_customer_reviews';
export const REVIEWS_UPDATED_EVENT = 'nutricrunch_reviews_updated';

export const DEFAULT_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    name: 'Sravanthi P.',
    location: 'Hanamkonda',
    rating: 5,
    comment:
      'The aroma and rich taste of pure cow desi ghee in the panjiri is simply exceptional! You can taste the slow-roasted crunchy almonds, cashews, and lotus seeds in every bite. Organic jaggery gives it the perfect wholesome sweetness without feeling heavy.',
    verified: true,
    productName: 'NutriCrunch Dry Fruits Panjiri',
    createdAt: '2026-10-15T09:30:00.000Z',
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
    createdAt: '2026-10-20T14:15:00.000Z',
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
    createdAt: '2026-10-25T11:45:00.000Z',
    status: 'published'
  }
];

/**
 * Get reviews from localStorage, falling back to default customer reviews
 */
export function getStoredReviews(): CustomerReview[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_CUSTOMER_REVIEWS;
  }

  try {
    const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      // Seed initial default reviews in localStorage
      window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMER_REVIEWS));
      return DEFAULT_CUSTOMER_REVIEWS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as CustomerReview[];
    }
  } catch (err) {
    console.warn('Failed to parse reviews from localStorage:', err);
  }

  return DEFAULT_CUSTOMER_REVIEWS;
}

/**
 * Save reviews to localStorage and broadcast real-time event
 */
export function saveStoredReviews(reviews: CustomerReview[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(
      new CustomEvent(REVIEWS_UPDATED_EVENT, {
        detail: { reviews }
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to save reviews to localStorage:', err);
    return false;
  }
}

/**
 * Append a newly submitted review directly to localStorage
 */
export function addStoredReview(newReview: CustomerReview): CustomerReview[] {
  const current = getStoredReviews();
  const updated = [newReview, ...current.filter((r) => r.id !== newReview.id)];
  saveStoredReviews(updated);
  return updated;
}

/**
 * Remove a review by ID from localStorage
 */
export function removeStoredReview(reviewId: string): CustomerReview[] {
  const current = getStoredReviews();
  const updated = current.filter((r) => r.id !== reviewId);
  saveStoredReviews(updated);
  return updated;
}
