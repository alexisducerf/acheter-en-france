// Function to fetch health amenities from OpenStreetMap for a French zip code
const getHealthAmenitiesByZipCode = (zipCode) => {
  // Construct the Overpass API query
  const overpassQuery = `
    [out:json];
    area["postal_code"="${zipCode}"]->.searchArea;
    (
      // Hospitals and clinics
      node["amenity"="hospital"](area.searchArea);
      way["amenity"="hospital"](area.searchArea);
      relation["amenity"="hospital"](area.searchArea);
      node["amenity"="clinic"](area.searchArea);
      way["amenity"="clinic"](area.searchArea);
      
      // Doctors, dentists, pharmacies
      node["amenity"="doctors"](area.searchArea);
      way["amenity"="doctors"](area.searchArea);
      node["amenity"="dentist"](area.searchArea);
      node["amenity"="pharmacy"](area.searchArea);
      
      // Other healthcare facilities
      node["healthcare"](area.searchArea);
      way["healthcare"](area.searchArea);
      node["amenity"="nursing_home"](area.searchArea);
      node["social_facility"="nursing_home"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  // URL encode the query
  const encodedQuery = encodeURIComponent(overpassQuery);
  const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

  // Fetch data from Overpass API
  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Process and return the results
      return processResults(data);
    })
    .catch(error => {
      console.error('Error fetching health amenities:', error);
      return [];
    });
}

const getHealthAmenitiesByLatLng = (lat, lng) => {
  // Construct the Overpass API query
  const overpassQuery = `
    [out:json];
    (
      // Hospitals and clinics
      node["amenity"="hospital"](around:10000, ${lat}, ${lng});
      way["amenity"="hospital"](around:10000, ${lat}, ${lng});
      relation["amenity"="hospital"](around:10000, ${lat}, ${lng});
      node["amenity"="clinic"](around:10000, ${lat}, ${lng});
      way["amenity"="clinic"](around:10000, ${lat}, ${lng});
      
      // Doctors, dentists, pharmacies
      node["amenity"="doctors"](around:10000, ${lat}, ${lng});
      way["amenity"="doctors"](around:10000, ${lat}, ${lng});
      node["amenity"="dentist"](around:10000, ${lat}, ${lng});
      node["amenity"="pharmacy"](around:10000, ${lat}, ${lng});
      
      // Other healthcare facilities
      node["healthcare"](around:10000, ${lat}, ${lng});
      way["healthcare"](around:10000, ${lat}, ${lng});
      node["amenity"="nursing_home"](around:10000, ${lat}, ${lng});
      node["social_facility"="nursing_home"](around:10000, ${lat}, ${lng});
    );
    out body;
    >;
    out skel qt;
  `;

  // URL encode the query
  const encodedQuery = encodeURIComponent(overpassQuery);
  const apiUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

  // Fetch data from Overpass API
  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données (${response.status})`);
      }
      return response.json();
    })
    .then(data => processResults(data))
    .catch(error => {
      setServiceError('health', `Impossible de charger les équipements de santé: ${error.message}`);
      return [];
    });
}

// Function to process and format the results
const processResults = (data) => {
  const amenities = [];

  if (data && data.elements) {
    data.elements.forEach(element => {
      // Extract relevant information
      if (element.tags) {
        const amenity = {
          id: element.id,
          type: element.type,
          latitude: element.lat,
          longitude: element.lon,
          name: element.tags.name || 'Unknown',
          amenityType: element.tags.amenity || element.tags.healthcare || 'Unknown',
          address: {
            street: element.tags['addr:street'] || '',
            housenumber: element.tags['addr:housenumber'] || '',
            city: element.tags['addr:city'] || '',
            postcode: element.tags['addr:postcode'] || ''
          },
          phone: element.tags.phone || '',
          website: element.tags.website || '',
          openingHours: element.tags.opening_hours || ''
        };

        amenities.push(amenity);
      }
    });
  }

  return amenities;
}

export { getHealthAmenitiesByZipCode, getHealthAmenitiesByLatLng };
