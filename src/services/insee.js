import axios from 'axios';

async function getCodeInsee(postcode, city) {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city)}&postcode=${postcode}`;

  try {
    const response = await axios.get(url);
    const features = response.data.features;

    if (features.length > 0) {
      return features[0].properties.citycode; // Code INSEE
    } else {
      throw new Error("Aucune correspondance trouvée.");
    }
  } catch (error) {
    console.error("Erreur :", error.message);
    return null;
  }
}

export { getCodeInsee };

export const getInseeData = async (code_insee) => {
  try {
    // Use relative path for local development and production
    const response = await axios.post('/api/getInsee', {
      code_insee
    });

    if (!response.data) {
      console.log('No data received from INSEE');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching INSEE data:', error);

  }
};