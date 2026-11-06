import { getOsmElements, addressFromTags } from './osm';
import { setServiceError } from '../stores/search';

// Stores, restaurants and cafés from OpenStreetMap around a point.
const getStoresByLatLng = (lat, lng) =>
  getOsmElements('stores', lat, lng)
    .then((elements) =>
      elements.map(({ id, type, latitude, longitude, tags }) => ({
        id,
        type,
        latitude,
        longitude,
        name: tags.name || 'Non renseigné',
        // shop first, amenity otherwise
        category: tags.shop || tags.amenity || 'other',
        brandName: tags.brand || '',
        address: addressFromTags(tags),
        phone: tags.phone || '',
        website: tags.website || '',
        openingHours: tags.opening_hours || '',
      }))
    )
    .catch((error) => {
      setServiceError('stores', `Impossible de charger les commerces: ${error.message}`);
      return [];
    });

export { getStoresByLatLng };
