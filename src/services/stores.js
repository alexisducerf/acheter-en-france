// Function to fetch stores and commercial amenities from OpenStreetMap for a French zip code
const getStoresByZipCode = (zipCode) => {
  // Construct the Overpass API query
  const overpassQuery = `
    [out:json];
    area["postal_code"="${zipCode}"]->.searchArea;
    (
      // Supermarkets and grocery stores
      node["shop"="supermarket"](area.searchArea);
      way["shop"="supermarket"](area.searchArea);
      node["shop"="convenience"](area.searchArea);
      node["shop"="grocery"](area.searchArea);
      
      // Department stores and malls
      node["shop"="department_store"](area.searchArea);
      way["shop"="department_store"](area.searchArea);
      node["shop"="mall"](area.searchArea);
      way["shop"="mall"](area.searchArea);
      
      // Retail shops of various kinds
      node["shop"="clothes"](area.searchArea);
      node["shop"="shoes"](area.searchArea);
      node["shop"="electronics"](area.searchArea);
      node["shop"="furniture"](area.searchArea);
      node["shop"="bakery"](area.searchArea);
      node["shop"="butcher"](area.searchArea);
      node["shop"="books"](area.searchArea);
      
      // Food and dining establishments
      node["amenity"="restaurant"](area.searchArea);
      node["amenity"="cafe"](area.searchArea);
      node["amenity"="fast_food"](area.searchArea);
      
      // Other commercial venues
      node["shop"](area.searchArea);
      way["shop"](area.searchArea);
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
      console.log('Stores data:', data);

      // Process and return the results
      return processResults(data);
    })
    .catch(error => {
      console.error('Error fetching stores:', error);
      return [];
    });
}

// Function to process and format the results
const processResults = (data) => {
  const stores = [];

  if (data && data.elements) {
    data.elements.forEach(element => {
      // Vérifier si l'élément a des tags et soit un shop, soit un amenity
      if (element.tags && (element.tags.shop || element.tags.amenity)) {
        const store = {
          id: element.id,
          type: element.type,
          latitude: element.lat,
          longitude: element.lon,
          name: element.tags.name || 'Non renseigné',
          // Utiliser shop en priorité, sinon amenity
          category: element.tags.shop || element.tags.amenity || 'other',
          brandName: element.tags.brand || '',
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

        stores.push(store);
      }
    });
  }

  // Log pour debug
  console.log(`Processed ${stores.length} stores from ${data.elements.length} elements`);

  return stores;
}

export { getStoresByZipCode };
