import { runOverpassQuery } from './overpass';

// One Overpass request per search covers stores, health and schools: Overpass blocks
// IPs that send too many / too heavy queries, so the three services share this result.

// Search radius per category, in metres.
export const RADIUS = {
  stores: 2000,
  health: 10000,
  schools: 5000,
};

const FOOD_AMENITIES = ['restaurant', 'cafe', 'fast_food'];
const HEALTH_AMENITIES = ['hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 'nursing_home'];
const SCHOOL_AMENITIES = ['school', 'kindergarten', 'university', 'college', 'music_school', 'language_school', 'driving_school'];
const SCHOOL_TAGS = ['primary', 'secondary', 'nursery'];

const anyOf = (values) => `^(${values.join('|')})$`;

const buildQuery = (lat, lng) => {
  const around = (radius) => `(around:${radius},${lat},${lng})`;
  return `
    [out:json][timeout:25];
    (
      nwr["shop"]${around(RADIUS.stores)};
      nwr["amenity"~"${anyOf(FOOD_AMENITIES)}"]${around(RADIUS.stores)};

      nwr["amenity"~"${anyOf(HEALTH_AMENITIES)}"]${around(RADIUS.health)};
      nwr["healthcare"]${around(RADIUS.health)};
      nwr["social_facility"="nursing_home"]${around(RADIUS.health)};

      nwr["amenity"~"${anyOf(SCHOOL_AMENITIES)}"]${around(RADIUS.schools)};
      nwr["school"~"${anyOf(SCHOOL_TAGS)}"]${around(RADIUS.schools)};
    );
    out center tags;
  `;
};

// Great-circle distance in metres.
const distance = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
};

const MATCHERS = {
  stores: (t) => Boolean(t.shop) || FOOD_AMENITIES.includes(t.amenity),
  health: (t) => HEALTH_AMENITIES.includes(t.amenity) || Boolean(t.healthcare) || t.social_facility === 'nursing_home',
  schools: (t) => SCHOOL_AMENITIES.includes(t.amenity) || SCHOOL_TAGS.includes(t.school),
};

// Normalised elements: ways/relations get their centre as coordinates.
const normalise = (data, lat, lng) =>
  (data?.elements || [])
    .filter((el) => el.tags)
    .map((el) => {
      const latitude = el.lat ?? el.center?.lat;
      const longitude = el.lon ?? el.center?.lon;
      return {
        ...el,
        latitude,
        longitude,
        distance: latitude != null ? distance(lat, lng, latitude, longitude) : Infinity,
      };
    });

// In-memory cache of pending/finished requests, keyed by rounded coordinates.
const cache = new Map();

const fetchOsmElements = (lat, lng) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (!cache.has(key)) {
    const request = runOverpassQuery(buildQuery(lat, lng))
      .then((data) => normalise(data, lat, lng))
      .catch((error) => {
        cache.delete(key); // allow a retry on the next search
        throw error;
      });
    cache.set(key, request);
  }
  return cache.get(key);
};

// Elements of one category ('stores' | 'health' | 'schools') within its radius.
export const getOsmElements = async (category, lat, lng) => {
  const elements = await fetchOsmElements(lat, lng);
  return elements.filter((el) => el.distance <= RADIUS[category] && MATCHERS[category](el.tags));
};

export const addressFromTags = (tags) => ({
  street: tags['addr:street'] || '',
  housenumber: tags['addr:housenumber'] || '',
  city: tags['addr:city'] || '',
  postcode: tags['addr:postcode'] || '',
});
