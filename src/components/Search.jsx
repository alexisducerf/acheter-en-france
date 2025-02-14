import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isLoaded, isLoading, hasErrors} from '../stores/search';

const Search = () => {
  const [formData, setFormData] = useState({
    postalCode: '',
    city: ''
  });



  const handleSubmit = (e) => {

    isLoaded.set(false);
    isLoading.set(true);

    e.preventDefault();
    console.log('Searching for:', formData);
    // Add your search logic here
    // Simulate search completion
    setTimeout(() => {
      isLoaded.set(true);
      isLoading.set(false);
      hasErrors.set(false);
    }, 2000);
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
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