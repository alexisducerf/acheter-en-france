// Establishments around a point from the API Recherche d'entreprises (SIRENE),
// filtered by NAF activity code: https://recherche-entreprises.api.gouv.fr/docs/
const API_URL = 'https://recherche-entreprises.api.gouv.fr/near_point';
const PER_PAGE = 25; // API maximum
const MIN_INTERVAL_MS = 170; // the API allows 7 requests/second per IP

// Serialise requests so that a search never exceeds the API's rate limit.
let queue = Promise.resolve();
const throttledFetch = (url) => {
  const request = queue.then(() => fetch(url));
  queue = request
    .catch(() => {})
    .then(() => new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS)));
  return request;
};

const fetchPage = async (params, attempt = 0) => {
  const response = await throttledFetch(`${API_URL}?${new URLSearchParams(params)}`);
  if (response.status === 429 && attempt < 2) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return fetchPage(params, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des données (${response.status})`);
  }
  return response.json();
};

// Great-circle distance in metres.
const distance = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
};

// Readable name: shop sign first, then trade name, then legal name.
const displayName = (company, establishment) => {
  const name =
    establishment.liste_enseignes?.[0] || establishment.nom_commercial || company.nom_raison_sociale || company.nom_complet;
  if (!name) return 'Non renseigné';
  // SIRENE names are upper case: "BOULANGERIE SAINT MAURICE" → "Boulangerie Saint Maurice"
  return name.toLowerCase().replace(/(^|[\s'’(-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
};

/**
 * Open establishments of one category around a point, nearest first.
 * @param {{ codes: string[], radiusKm: number, maxPages?: number }} category NAF codes, e.g. ['47.73Z']
 */
const searchCategory = async (lat, lng, { codes, radiusKm, maxPages = 2 }) => {
  const results = new Map(); // siret → establishment

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchPage({
      lat,
      long: lng,
      radius: radiusKm,
      activite_principale: codes.join(','),
      etat_administratif: 'A',
      per_page: PER_PAGE,
      page,
    });

    for (const company of data.results || []) {
      // Companies whose details are not public show placeholder names: skip them.
      if (company.statut_diffusion !== 'O') continue;

      for (const establishment of company.matching_etablissements || []) {
        const latitude = Number(establishment.latitude);
        const longitude = Number(establishment.longitude);
        if (
          establishment.etat_administratif !== 'A' ||
          !codes.includes(establishment.activite_principale) ||
          !latitude ||
          !longitude ||
          results.has(establishment.siret)
        ) {
          continue;
        }

        const metres = distance(lat, lng, latitude, longitude);
        if (metres > radiusKm * 1000) continue;

        results.set(establishment.siret, {
          id: establishment.siret,
          name: displayName(company, establishment),
          latitude,
          longitude,
          distance: metres,
          // The API gives the full address (street, postcode, town) as one string.
          address: { street: establishment.adresse || '' },
        });
      }
    }

    if (page >= (data.total_pages || 0)) break;
  }

  return [...results.values()].sort((a, b) => a.distance - b.distance);
};

/**
 * Searches several categories and tags each result with its category key.
 * @param {Record<string, { codes: string[], radiusKm: number, maxPages?: number }>} categories
 */
export const searchEstablishments = async (lat, lng, categories) => {
  const lists = await Promise.all(
    Object.entries(categories).map(async ([key, category]) =>
      (await searchCategory(lat, lng, category)).map((item) => ({ ...item, category: key }))
    )
  );
  return lists.flat();
};
