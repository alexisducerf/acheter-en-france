import { useState, useEffect } from 'react';
import franceData from '../data/france.json';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState({
    city: '',
    postalCode: '',
    coordinates: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);

  // Load saved destinations on mount
  useEffect(() => {
    const savedDestinations = localStorage.getItem('savedDestinations');
    if (savedDestinations) {
      setDestinations(JSON.parse(savedDestinations));
    }
  }, []);

  // Save destinations when they change
  useEffect(() => {
    localStorage.setItem('savedDestinations', JSON.stringify(destinations));
  }, [destinations]);

  // Handle postal code changes and find matching cities
  useEffect(() => {
    if (newDestination.postalCode.length === 5) {
      const matchingCities = franceData.filter(
        city => String(city.Code_postal) === newDestination.postalCode
      );
      setCities(matchingCities);
      
      // Sélectionner automatiquement la première ville si c'est la seule
      if (matchingCities.length > 0) {
        const cityData = matchingCities[0];
        const [lat, lng] = cityData.coordonnees_gps.split(', ').map(Number);
        
        setNewDestination(prev => ({
          ...prev,
          city: cityData.Nom_commune,
          coordinates: { lat, lng }
        }));
      }
    } else {
      setCities([]);
      setNewDestination(prev => ({ 
        ...prev, 
        city: '',
        coordinates: null 
      }));
    }
  }, [newDestination.postalCode]);

  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (newDestination.city && newDestination.postalCode) {
      setIsLoading(true);
      try {
        // Find city data in france.json
        const cityData = franceData.find(
          city => city.Code_postal === parseInt(newDestination.postalCode) && 
                 city.Nom_commune === newDestination.city
        );

        if (!cityData) {
          throw new Error('Ville non trouvée');
        }

        // Extract coordinates
        const [lat, lng] = cityData.coordonnees_gps.split(', ').map(Number);
        
        const destinationWithCoords = {
          ...newDestination,
          coordinates: { lat, lng }
        };

        setDestinations([...destinations, destinationWithCoords]);
        setNewDestination({ city: '', postalCode: '', coordinates: null });
        setCities([]);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la destination:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveDestination = (index) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(newDestinations);
  };

  return (
    <div className="w-full lg:basis-1/3 p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Mes destinations favorites
      </h2>

      <div className="space-y-3 mb-6">
        {destinations.map((dest, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div>
              <span className="font-medium">{dest.city}</span>
              <span className="text-gray-500 ml-2">({dest.postalCode})</span>
              {dest.coordinates && (
                <span className="text-xs text-gray-400 block">
                  lat: {dest.coordinates.lat} <br />
                  lng: {dest.coordinates.lng}
                </span>
              )}
            </div>
            <button
              onClick={() => handleRemoveDestination(index)}
              className="text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddDestination} className="space-y-4">
        <div className="flex space-x-4">
          <div className="w-32">
            <input
              type="text"
              placeholder="Code postal"
              value={newDestination.postalCode}
              onChange={(e) => setNewDestination({
                ...newDestination,
                postalCode: e.target.value.slice(0, 5)
              })}
              pattern="[0-9]*"
              maxLength="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex-1">
            <select
              value={newDestination.city}
              onChange={(e) => setNewDestination({
                ...newDestination,
                city: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
              disabled={cities.length === 0 || isLoading}
            >
              <option value="">Saisissez un code postal</option>
              {cities.map((city, index) => (
                <option key={index} value={city.Nom_commune}>
                  {city.Nom_commune}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Ajouter une destination'}
        </button>
      </form>
    </div>
  );
};

export default Destinations;