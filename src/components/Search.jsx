import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors, durationPerDestination} from '../stores/search';
import {getDestinationsFromLocalStorage} from '../utils/helpers';
import {getDuration} from '../services/durations';
import { getLatLngFromZipCode } from '../services/geolocation';

const Search = () => {
  const [formData, setFormData] = useState({
    postalCode: '87200',
    city: 'Saint Junien'
  });
  
  // Move the useStore hook to the top level
  const $durationPerDestination = useStore(durationPerDestination);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      isLoaded.set(false);
      isLoading.set(true);
      hasErrors.set(false);

      const cityCoordinates = await getLatLngFromZipCode(formData.postalCode);
      const destinations = getDestinationsFromLocalStorage();
      
      // Reset durations before new search
      durationPerDestination.set([]);
      
      // Use Promise.all to handle all durations concurrently
      const durations = await Promise.all(
        destinations.map(async (dest) => {
          return await getDuration(
            cityCoordinates.lat, 
            cityCoordinates.lng, 
            dest.coordinates.lat, 
            dest.coordinates.lng, 
            dest.city, 
            dest.postalCode
          );
        })
      );
      
      // Set all durations at once
      durationPerDestination.set(durations);
      
      isLoaded.set(true);
    } catch (error) {
      console.error('Search error:', error);
      hasErrors.set(true);
    } finally {
      isLoading.set(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'postalCode' && value.length > 5) return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full lg:basis-1/3 p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Recherche par localisation
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4" method="post">
        <div className="space-y-2">
          <label 
            htmlFor="postalCode" 
            className="block text-sm font-medium text-gray-700"
          >
            Code Postal
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            pattern="[0-9]*"
            inputMode="numeric"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="75001"
            required
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="city" 
            className="block text-sm font-medium text-gray-700"
          >
            Ville
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Paris"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Rechercher
        </button>
      </form>
    </div>
  );
};

export default Search;