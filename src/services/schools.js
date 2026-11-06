import { getOsmElements, addressFromTags } from './osm';
import { setServiceError } from '../stores/search';

// Schools, kindergartens and other education facilities from OpenStreetMap around a point.
const getSchoolsByLatLng = (lat, lng) =>
  getOsmElements('schools', lat, lng)
    .then((elements) =>
      elements.map(({ id, type, latitude, longitude, tags }) => ({
        id,
        type,
        latitude,
        longitude,
        name: tags.name || 'Non renseigné',
        schoolType: getSchoolType(tags),
        operator: tags.operator || '',
        address: addressFromTags(tags),
        phone: tags.phone || '',
        website: tags.website || '',
        capacity: tags.capacity || '',
        isPrivate: tags.operator === 'private',
      }))
    )
    .catch((error) => {
      setServiceError('schools', `Impossible de charger les établissements scolaires: ${error.message}`);
      return [];
    });

// Update the school type detection
const getSchoolType = (tags) => {
  // Check for empty or invalid tags
  if (!tags || typeof tags !== 'object') return 'établissement scolaire';

  // First check specific amenity and education tags
  if (tags.amenity === 'kindergarten' || tags.school === 'nursery' || tags.isced === '0') return 'maternelle';
  if (tags.education_level === 'primary' || tags.school === 'primary' || tags.isced === '1') return 'primaire';
  if (tags.education_level === 'secondary' || tags.school === 'secondary' || tags.isced === '2') return 'collège';
  if (tags.education_level === 'secondary_senior' || tags.school === 'high_school' || tags.isced === '3') return 'lycée';
  if (tags.amenity === 'university' || tags.isced === '5' || tags.isced === '6') return 'université';
  if (tags.amenity === 'college' || tags.isced === '4') return 'enseignement supérieur';
  if (tags.amenity === 'music_school') return 'école de musique';
  if (tags.amenity === 'language_school') return 'école de langues';
  if (tags.amenity === 'driving_school') return 'auto-école';

  // Try to determine type from name if available
  if (tags.name) {
    const name = tags.name.toLowerCase();
    const normalizedName = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics

    // Common French school name patterns
    if (/(^|\s)(creche|crèche|halte garderie|garderie)($|\s)/.test(name)) return 'crèche';
    if (/(^|\s)(maternelle|petite section|moyenne section|grande section)($|\s)/.test(name)) return 'maternelle';
    if (/(^|\s)(elementaire|élémentaire|primaire|ecole|école)($|\s)/.test(name)) return 'primaire';
    if (/(^|\s)(college|collège)($|\s)/.test(normalizedName)) return 'collège';
    if (/(^|\s)(lycee|lycée)($|\s)/.test(normalizedName)) return 'lycée';
    if (/(^|\s)(universite|université|fac|faculte|faculté)($|\s)/.test(normalizedName)) return 'université';
    if (/(^|\s)(conservatoire|musique)($|\s)/.test(name)) return 'école de musique';
    if (/(^|\s)(langues|berlitz|linguistique)($|\s)/.test(name)) return 'école de langues';
    if (/(^|\s)(auto.?ecole|auto.?école|permis)($|\s)/.test(normalizedName)) return 'auto-école';
    if (/(^|\s)(institut|ecole superieure|école supérieure|iut|bts)($|\s)/.test(normalizedName)) return 'enseignement supérieur';
  }

  // If school tag exists but no specific type was found
  if (tags.amenity === 'school' || tags.building === 'school') {
    return 'établissement scolaire';
  }

  return 'établissement scolaire';
};

export { getSchoolsByLatLng };