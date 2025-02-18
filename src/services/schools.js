const getSchoolsByLatLng = (lat, lng) => {
  // Construct the Overpass API query with broader search
  const overpassQuery = `
    [out:json];
    (
      // All schools (including those without education_level tag)
      node["amenity"="school"](around:5000, ${lat}, ${lng});
      way["amenity"="school"](around:5000, ${lat}, ${lng});
      
      // Schools with specific education levels
      node["amenity"="school"]["education_level"](around:5000, ${lat}, ${lng});
      way["amenity"="school"]["education_level"](around:5000, ${lat}, ${lng});
      
      // Schools with specific types
      node["school"="primary"](around:5000, ${lat}, ${lng});
      way["school"="primary"](around:5000, ${lat}, ${lng});
      node["school"="secondary"](around:5000, ${lat}, ${lng});
      way["school"="secondary"](around:5000, ${lat}, ${lng});
      
      // Kindergartens and preschools
      node["amenity"="kindergarten"](around:5000, ${lat}, ${lng});
      way["amenity"="kindergarten"](around:5000, ${lat}, ${lng});
      node["school"="nursery"](around:5000, ${lat}, ${lng});
      way["school"="nursery"](around:5000, ${lat}, ${lng});
      
      // Higher education
      node["amenity"="university"](around:5000, ${lat}, ${lng});
      way["amenity"="university"](around:5000, ${lat}, ${lng});
      node["amenity"="college"](around:5000, ${lat}, ${lng});
      way["amenity"="college"](around:5000, ${lat}, ${lng});
      
      // Specialized schools
      node["amenity"="music_school"](around:5000, ${lat}, ${lng});
      way["amenity"="music_school"](around:5000, ${lat}, ${lng});
      node["amenity"="language_school"](around:5000, ${lat}, ${lng});
      way["amenity"="language_school"](around:5000, ${lat}, ${lng});
      node["amenity"="driving_school"](around:5000, ${lat}, ${lng});
      way["amenity"="driving_school"](around:5000, ${lat}, ${lng});
    );
    out body;
    >;
    out skel qt;
  `;

  const encodedQuery = encodeURIComponent(overpassQuery);
  const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => processResults(data))
    .catch(error => {
      console.error('Error fetching schools:', error);
      return [];
    });
};

const processResults = (data) => {
  const schools = [];

  console.log(data);
  

  if (data && data.elements) {
    data.elements.forEach(element => {
      if (element.tags) {
        const school = {
          id: element.id,
          type: element.type,
          latitude: element.lat,
          longitude: element.lon,
          name: element.tags.name || 'Non renseigné',
          schoolType: getSchoolType(element.tags),
          operator: element.tags.operator || '',
          address: {
            street: element.tags['addr:street'] || '',
            housenumber: element.tags['addr:housenumber'] || '',
            city: element.tags['addr:city'] || '',
            postcode: element.tags['addr:postcode'] || ''
          },
          phone: element.tags.phone || '',
          website: element.tags.website || '',
          capacity: element.tags.capacity || '',
          isPrivate: element.tags.operator === 'private' || false
        };

        schools.push(school);
      }
    });
  }

  return schools;
};

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