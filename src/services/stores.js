import { searchEstablishments } from './entreprises';
import { setServiceError } from '../stores/search';

// Search radius around the commune, and pages of 25 companies fetched per category
// (the API isn't sorted by distance, so too few pages would drop nearby shops).
export const STORES_RADIUS_KM = 5;
const MAX_PAGES = 4;

// Store categories (keys match the labels in StoresSection) → NAF activity codes.
const CATEGORIES = {
  supermarket: ['47.11D', '47.11F'],
  convenience: ['47.11B', '47.11C'],
  bakery: ['10.71C', '10.71D', '47.24Z'],
  butcher: ['47.22Z', '10.13B'],
  alcohol: ['47.25Z'],
  tobacco: ['47.26Z'],
  newsagent: ['47.62Z'],
  books: ['47.61Z'],
  florist: ['47.76Z'],
  clothes: ['47.71Z'],
  optician: ['47.78A'],
  hairdresser: ['96.02A'],
  restaurant: ['56.10A'],
  fast_food: ['56.10C'],
  cafe: ['56.30Z'],
  gas: ['47.30Z'],
  car_repair: ['45.20A'],
  estate_agent: ['68.31Z'],
};

// Shops, restaurants and services around a point (SIRENE register).
const getStoresByLatLng = (lat, lng) =>
  searchEstablishments(
    lat,
    lng,
    Object.fromEntries(Object.entries(CATEGORIES).map(([key, codes]) => [key, { codes, radiusKm: STORES_RADIUS_KM, maxPages: MAX_PAGES }]))
  ).catch((error) => {
    setServiceError('stores', `Impossible de charger les commerces: ${error.message}`);
    return [];
  });

export { getStoresByLatLng };
