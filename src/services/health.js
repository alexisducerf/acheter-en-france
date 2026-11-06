import { getOsmElements, addressFromTags } from './osm';
import { setServiceError } from '../stores/search';

// Hospitals, doctors, pharmacies and other health facilities from OpenStreetMap around a point.
const getHealthAmenitiesByLatLng = (lat, lng) =>
  getOsmElements('health', lat, lng)
    .then((elements) =>
      elements.map(({ id, type, latitude, longitude, tags }) => ({
        id,
        type,
        latitude,
        longitude,
        name: tags.name || 'Unknown',
        amenityType: tags.amenity || tags.healthcare || 'Unknown',
        address: addressFromTags(tags),
        phone: tags.phone || '',
        website: tags.website || '',
        openingHours: tags.opening_hours || '',
      }))
    )
    .catch((error) => {
      setServiceError('health', `Impossible de charger les équipements de santé: ${error.message}`);
      return [];
    });

export { getHealthAmenitiesByLatLng };
