import { searchEstablishments } from './entreprises';
import { setServiceError } from '../stores/search';

// Health categories, in display order → NAF activity codes and search radius.
const CATEGORIES = {
  'Hôpitaux et cliniques': { codes: ['86.10Z'], radiusKm: 15 },
  'Médecins généralistes': { codes: ['86.21Z'], radiusKm: 5 },
  'Médecins spécialistes': { codes: ['86.22A', '86.22B', '86.22C'], radiusKm: 5 },
  Dentistes: { codes: ['86.23Z'], radiusKm: 5 },
  Pharmacies: { codes: ['47.73Z'], radiusKm: 5 },
  'Laboratoires d’analyses': { codes: ['86.90B'], radiusKm: 5 },
  'Infirmiers et sages-femmes': { codes: ['86.90D'], radiusKm: 5 },
  'Kinés, podologues et rééducation': { codes: ['86.90E'], radiusKm: 5 },
  'EHPAD et maisons de retraite': { codes: ['87.10A'], radiusKm: 10 },
};

// Health professionals and facilities around a point (SIRENE register).
const getHealthAmenitiesByLatLng = (lat, lng) =>
  searchEstablishments(lat, lng, CATEGORIES)
    .then((items) => items.map((item) => ({ ...item, amenityType: item.category })))
    .catch((error) => {
      setServiceError('health', `Impossible de charger les équipements de santé: ${error.message}`);
      return [];
    });

export { getHealthAmenitiesByLatLng };
