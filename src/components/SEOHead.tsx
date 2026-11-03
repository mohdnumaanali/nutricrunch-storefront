import { useEffect } from 'react';
import { Product } from '../types';

export const SITE_URL = 'https://nutricrunch-storefront.vercel.app';
export const SITE_NAME = 'NutriCrunch';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: object | object[];
}

/**
 * Dynamic SEO & Meta Tags Component
 * Automatically updates document head title, meta descriptions, Open Graph (for WhatsApp, Facebook, Instagram),
 * Twitter Cards, Canonical links, and injects clean Schema.org JSON-LD structured data.
 */
export function SEOHead({
  title = 'NutriCrunch™ | Authentic Homemade Panjiri & Kerala Banana Chips',
  description = 'Order authentic homemade dry fruits panjiri roasted in pure cow bilona ghee & crispy Kerala banana chips cooked in cold-pressed coconut oil. Zero preservatives. Express delivery in Warangal & across India.',
  keywords = 'homemade panjiri online, authentic dry fruit panjiri, bilona ghee panjiri, kerala banana chips coconut oil, dry fruit milk masala, traditional postpartum snacks, healthy indian snacks buy online, warangal hanamkonda food',
  canonicalPath = '',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'NutriCrunch - Wholesome Handmade Traditional Indian Foods',
  productPrice,
  productCurrency = 'INR',
  productAvailability = 'https://schema.org/InStock',
  breadcrumbs,
  jsonLd
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Browser Window & Search Engine Title
    document.title = title;

    // Helper: update or insert a meta tag
    const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper: update or insert link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 2. Standard Search Metadata
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'author', 'NutriCrunch Artisanal Kitchen');
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Canonical Link
    const cleanCanonical = canonicalPath.startsWith('http')
      ? canonicalPath
      : `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    setLink('canonical', cleanCanonical);

    // 4. Open Graph (WhatsApp, Facebook, LinkedIn, Instagram)
    const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', cleanCanonical);
    setMeta('property', 'og:image', absoluteOgImage);
    setMeta('property', 'og:image:secure_url', absoluteOgImage);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', ogImageAlt);
    setMeta('property', 'og:locale', 'en_IN');

    // WhatsApp / E-Commerce Product Metadata
    if (productPrice !== undefined) {
      setMeta('property', 'product:price:amount', productPrice.toString());
      setMeta('property', 'product:price:currency', productCurrency);
      setMeta('property', 'product:availability', productAvailability);
      setMeta('property', 'og:price:amount', productPrice.toString());
      setMeta('property', 'og:price:currency', productCurrency);
    }

    // 5. Twitter / X Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@nutricrunch_in');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', absoluteOgImage);
    setMeta('name', 'twitter:image:alt', ogImageAlt);

    // 6. Structured Data Injection (JSON-LD)
    const combinedSchemas: object[] = [];

    // Optional breadcrumb list schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      combinedSchemas.push(generateBreadcrumbSchema(breadcrumbs));
    }

    // Custom provided schemas
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        combinedSchemas.push(...jsonLd);
      } else {
        combinedSchemas.push(jsonLd);
      }
    }

    // Inject combined graph
    let scriptTag = document.getElementById('nutricrunch-dynamic-jsonld') as HTMLScriptElement | null;
    if (combinedSchemas.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'nutricrunch-dynamic-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': combinedSchemas
      });
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up dynamic structured script on route unmount
      const existingScript = document.getElementById('nutricrunch-dynamic-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    canonicalPath,
    ogType,
    ogImage,
    ogImageAlt,
    productPrice,
    productCurrency,
    productAvailability,
    breadcrumbs,
    jsonLd
  ]);

  return null;
}

/**
 * Generates LocalBusiness & Online FoodStore Schema
 * Geotargeted to Warangal, Hanamkonda & Kazipet (Telangana)
 */
export function generateLocalBusinessSchema() {
  return {
    '@type': ['OnlineStore', 'LocalBusiness', 'FoodEstablishment'],
    '@id': `${SITE_URL}/#store`,
    name: 'NutriCrunch Artisanal Foods',
    alternateName: ['NutriCrunch', 'NutriCrunch Homemade Panjiri', 'NutriCrunch Warangal'],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo.png`,
    description:
      'Artisanal food kitchen crafting authentic homemade dry fruits panjiri slow-roasted in pure cow bilona ghee, stone-ground dry fruit milk mix, and crispy Kerala-style banana chips fried in cold-pressed coconut oil.',
    telephone: '+919154797936',
    email: 'care@nutricrunch.in',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash on Delivery, UPI, PhonePe, Google Pay, Net Banking',
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 2,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop #4, Sri Rama Towers, Main Road, Hanamkonda',
      addressLocality: 'Warangal',
      addressRegion: 'Telangana',
      postalCode: '506001',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 17.9784,
      longitude: 79.5941
    },
    areaServed: [
      { '@type': 'City', name: 'Warangal' },
      { '@type': 'City', name: 'Hanamkonda' },
      { '@type': 'City', name: 'Kazipet' },
      { '@type': 'Country', name: 'India' }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00'
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '128',
      reviewCount: '128'
    },
    sameAs: [
      'https://instagram.com/nutricrunch_wgl',
      'https://wa.me/919154797936'
    ]
  };
}

/**
 * Generates Product Schema for Google Search Rich Cards & Merchant Center
 */
export function generateProductSchema(product: Product) {
  const imageUrl = product.images && product.images[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `${SITE_URL}${product.images[0].startsWith('/') ? product.images[0] : `/${product.images[0]}`}`
    : `${SITE_URL}/logo.png`;

  const inStock = product.stock > 0;

  return {
    '@type': 'Product',
    '@id': `${SITE_URL}/product/${product.slug}/#product`,
    name: product.name,
    image: [imageUrl],
    description: product.description || `${product.name} handcrafted with pure ingredients by NutriCrunch.`,
    sku: product.sku || `NC-${product.id}`,
    mpn: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'NutriCrunch'
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price.toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'NutriCrunch Artisanal Kitchen'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '84',
      reviewCount: '84'
    }
  };
}

/**
 * Generates BreadcrumbList Schema for Google Search snippet hierarchies
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`
    }))
  };
}
