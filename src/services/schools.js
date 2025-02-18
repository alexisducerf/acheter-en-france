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
  // Check multiple tag combinations
  if (tags.amenity === 'kindergarten' || tags.school === 'nursery') return 'maternelle';
  if (tags.education_level === 'primary' || tags.school === 'primary') return 'primaire';
  if (tags.education_level === 'secondary' || tags.school === 'secondary') return 'collège';
  if (tags.education_level === 'secondary_senior' || tags.school === 'high_school') return 'lycée';
  if (tags.amenity === 'university') return 'université';
  if (tags.amenity === 'college') return 'enseignement supérieur';
  if (tags.amenity === 'music_school') return 'école de musique';
  if (tags.amenity === 'language_school') return 'école de langues';
  if (tags.amenity === 'driving_school') return 'auto-école';
  
  // Try to determine type from name if no specific tags
  const name = (tags.name || '').toLowerCase();
  if (name.includes('maternelle')) return 'maternelle';
  if (name.includes('primaire') || name.includes('élémentaire')) return 'primaire';
  if (name.includes('collège')) return 'collège';
  if (name.includes('lycée')) return 'lycée';
  if (name.includes('université')) return 'université';
  
  return 'établissement scolaire';
};

export { getSchoolsByLatLng };