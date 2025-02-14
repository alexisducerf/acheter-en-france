import axios from 'axios';
import { formatDuration } from '../utils/helpers';

const getDuration = async (originLat, originLng, destLat, destLng, city = '', postalCode = '') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}`, {
      params: {
        overview: 'false',
        alternatives: false,
      }
    }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const minutes = Math.round(response.data.routes[0].duration / 60);

      return {
        duration: formatDuration(minutes),
        distance: Math.round(response.data.routes[0].distance / 1000),
        city,
        postalCode
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting duration:', error.message);
    return null;
  }
};


export { getDuration };
