const getSchoolsByLatLng = (lat, lng) => {
  // Construct the Overpass API query
  const overpassQuery = `
    [out:json];
    (
      // Primary schools
      node["amenity"="school"]["education_level"="primary"](around:5000, ${lat}, ${lng});
      way["amenity"="school"]["education_level"="primary"](around:5000, ${lat}, ${lng});
      
      // Secondary schools (collèges)
      node["amenity"="school"]["education_level"="secondary"](around:5000, ${lat}, ${lng});
      way["amenity"="school"]["education_level"="secondary"](around:5000, ${lat}, ${lng});
      
      // High schools (lycées)
      node["amenity"="school"]["education_level"="secondary_senior"](around:5000, ${lat}, ${lng});
      way["amenity"="school"]["education_level"="secondary_senior"](around:5000, ${lat}, ${lng});
      
      // Universities and higher education
      node["amenity"="university"](around:5000, ${lat}, ${lng});
      way["amenity"="university"](around:5000, ${lat}, ${lng});
      node["amenity"="college"](around:5000, ${lat}, ${lng});
      way["amenity"="college"](around:5000, ${lat}, ${lng});
      
      // Other educational facilities
      node["amenity"="kindergarten"](around:5000, ${lat}, ${lng});
      way["amenity"="kindergarten"](around:5000, ${lat}, ${lng});
      node["amenity"="music_school"](around:5000, ${lat}, ${lng});
      node["amenity"="language_school"](around:5000, ${lat}, ${lng});
      node["amenity"="driving_school"](around:5000, ${lat}, ${lng});
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

const getSchoolType = (tags) => {
  if (tags.amenity === 'kindergarten') return 'maternelle';
  if (tags.education_level === 'primary') return 'primaire';
  if (tags.education_level === 'secondary') return 'collège';
  if (tags.education_level === 'secondary_senior') return 'lycée';
  if (tags.amenity === 'university') return 'université';
  if (tags.amenity === 'college') return 'enseignement supérieur';
  if (tags.amenity === 'music_school') return 'école de musique';
  if (tags.amenity === 'language_school') return 'école de langues';
  if (tags.amenity === 'driving_school') return 'auto-école';
  return 'établissement scolaire';
};

export { getSchoolsByLatLng };