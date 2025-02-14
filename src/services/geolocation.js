import axios from 'axios';

const getLatLngFromZipCode = async (zipCode) => {
  try {
    // Respect Nominatim usage policy with delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`, {
      params: {
        postalcode: zipCode,
        country: 'France',
        format: 'json',
      },
      headers: {
        'User-Agent': 'OuAcheterEnFrance/1.0' // Required by Nominatim
      }
    }
    );

    if (response.data && response.data.length > 0) {
      return {
        lat: response.data[0].lat,
        lng: response.data[0].lon
      };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding ${zipCode}:`, error.message);
    return null;
  }
};

export { getLatLngFromZipCode };
