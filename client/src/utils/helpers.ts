import { Property, PropertyImage } from './api/propertyApi';

// ─── Image Resolver ───────────────────────────────────────────────────────────
// Handles: array of objects with secure_url/url, array of strings, empty
export const resolveImageUrl = (
  images: any[] | undefined,
  index = 0,
): string | null => {
  if (!images || images.length === 0) return null;
  const img = images[index];
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.secure_url || img.url || null;
};

export const resolveAllImages = (images: any[] | undefined): string[] => {
  if (!images || images.length === 0) return [];
  return images
    .map(img => {
      if (typeof img === 'string') return img;
      return img?.secure_url || img?.url || null;
    })
    .filter(Boolean) as string[];
};

// ─── Price Formatter ──────────────────────────────────────────────────────────
export const formatPrice = (amount: number | undefined | null): string => {
  if (!amount && amount !== 0) return 'N/A';
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
};

export const formatPriceShort = (amount: number | undefined | null): string => {
  if (!amount && amount !== 0) return 'N/A';
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}K`;
  return `Rs. ${amount}`;
};

// ─── Location Parser ──────────────────────────────────────────────────────────
// Returns { lat, lng } from whichever format is available
export const parseCoordinates = (
  property: Partial<Property>,
): { lat: number; lng: number } | null => {
  // Prefer explicit lat/lng fields
  if (property.latitude != null && property.longitude != null) {
    return { lat: property.latitude, lng: property.longitude };
  }
  // Fallback to GeoJSON [lng, lat]
  const coords = property.location?.coordinates;
  if (coords && coords.length === 2) {
    return { lat: coords[1], lng: coords[0] };
  }
  return null;
};

// ─── Property Type Label ──────────────────────────────────────────────────────
export const propertyTypeLabel = (type: string | undefined): string => {
  const map: Record<string, string> = {
    Shared: 'Shared Room',
    Private: 'Private Room',
    Apartment: 'Apartment',
    House: 'Full House',
    Room: 'Room',
  };
  return type ? (map[type] || type) : 'N/A';
};

// ─── Facility Icons (lucide name → display label) ─────────────────────────────
export const FACILITY_ICONS: Record<string, string> = {
  WiFi: '📶',
  AC: '❄️',
  Parking: '🚗',
  Kitchen: '🍳',
  Laundry: '👔',
  Security: '🔒',
  Furnished: '🛋️',
  'Electricity Backup': '⚡',
  Balcony: '🏙️',
};

// ─── API Error Message ────────────────────────────────────────────────────────
export const getApiError = (err: any): string => {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  );
};
