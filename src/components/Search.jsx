import { useEffect, useState } from 'react';
import { isLoaded, isLoading, hasErrors, durationPerDestination, codeInsee, geoGasparRisks,
   sismicRisks, soilPollution, legislativesElectionResults, presidentElectionResults,
    legislativesElectionResults2024, inseeData, incrementCompletedTasks, completedTasks, healthAmenities, stores, associations, educationAmenities, weatherData} from '../stores/search';
import {getDestinationsFromLocalStorage} from '../utils/helpers';
import {getDuration} from '../services/durations';
import {getGeoGasparRisks, getSismicRisks, getSoilPollution} from '../services/georisks';
import {getLegislativesElectionResults, getPresidentElectionResults, getLegislativesElectionResults2024} from '../services/political';
import { getInseeData } from '../services/insee';
import franceData from '../data/france.json';
import SelectWithCustomArrow from './SelectWithCustomArrow';
import { getStoresByZipCode } from '../services/stores';
import { getHealthAmenitiesByLatLng } from '../services/health';
import { getSchoolsByLatLng } from '../services/schools';
import { getAssociationsByZipCode } from '../services/associations';
import { getWeatherFromLastYear } from '../services/meteo';

const Search = () => {
  const [formData, setFormData] = useState({
    postalCode: '',
    city: ''
  });

  // reset all the stores
  useEffect(() => {
    completedTasks.set(0);
    isLoaded.set(false);
    isLoading.set(false);
    hasErrors.set(false);
    durationPerDestination.set([]);
    codeInsee.set('');
    geoGasparRisks.set(null);
    sismicRisks.set(null);
    soilPollution.set(null);
    legislativesElectionResults.set(null);
    presidentElectionResults.set(null);
    legislativesElectionResults2024.set(null);
    inseeData.set(null);
    healthAmenities.set(null);
    stores.set(null);
    associations.set(null);
    educationAmenities.set(null);
    weatherData.set(null);
  }, []);

  // First, add a new state for cities
  const [cities, setCities] = useState([]);

  // Modify the useEffect that handles postal code changes
  useEffect(() => {
    const postalCode = formData.postalCode;
      
    if(postalCode.length === 5) {        
      const fetchCity = async () => {
        try {
          const response = await fetch('/.netlify/functions/getCityFromZipcode', {
            method: 'POST',
            body: JSON.stringify({ postalCode }),
          });
          const data = await response.json();
          if (response.ok) {
            if (Array.isArray(data.cities)) {
              setCities(data.cities);
              // Set the first city as default if available
              if (data.cities.length > 0) {
                setFormData(prev => ({
                  ...prev,
                  city: data.cities[0].Nom_commune
                }));
              }
            }
          } else {
            console.error('City fetch error:', data);
            setCities([]);
          }
        } catch (error) {
          console.error('City fetch error:', error);
          setCities([]);
        }
      };
      fetchCity();
    } else {
      // Reset cities when postal code is not complete
      setCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.postalCode]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all stores at the beginning of each search
    completedTasks.set(0);
    isLoaded.set(false);
    isLoading.set(true);
    hasErrors.set(false);
    durationPerDestination.set([]);
    codeInsee.set('');
    geoGasparRisks.set(null);
    sismicRisks.set(null);
    soilPollution.set(null);
    legislativesElectionResults.set(null);
    presidentElectionResults.set(null);
    legislativesElectionResults2024.set(null);
    inseeData.set(null);
    healthAmenities.set(null);
    stores.set(null);
    associations.set(null);
    educationAmenities.set(null);
    weatherData.set(null);

    // Scroll to results after a short delay
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
    
    try {
      // Get city data first as it's required for other requests
      const cityData = franceData.find(city => 
        city.Code_postal === parseInt(formData.postalCode) && 
        city.Nom_commune === formData.city
      );

      if (!cityData) {
        throw new Error('Ville non trouvée');
      }

      const [lat, lng] = cityData.coordonnees_gps.split(', ').map(Number);
      const codeInseeFromPostalCode = cityData.Code_commune_INSEE;
      
      codeInsee.set(codeInseeFromPostalCode);
      incrementCompletedTasks();

      // Group 1: Geographic and risk data
      const geoRequests = [
        getSismicRisks(formData.city, codeInseeFromPostalCode),
        getSoilPollution(formData.city, codeInseeFromPostalCode),
        getGeoGasparRisks(formData.city, codeInseeFromPostalCode)
      ];

      // Group 2: Amenities data
      const amenityRequests = [
        getStoresByZipCode(formData.postalCode),
        getHealthAmenitiesByLatLng(lat, lng),
        getSchoolsByLatLng(lat, lng),
        getAssociationsByZipCode(formData.postalCode),
        getWeatherFromLastYear(lat, lng)
      ];

      // Group 3: Political and demographic data
      const politicalRequests = [
        getLegislativesElectionResults(codeInseeFromPostalCode),
        getPresidentElectionResults(codeInseeFromPostalCode),
        getLegislativesElectionResults2024(codeInseeFromPostalCode),
        getInseeData(codeInseeFromPostalCode)
      ];

      // Get destinations data
      const destinations = getDestinationsFromLocalStorage();
      incrementCompletedTasks();

      // Execute all requests in parallel
      const [
        geoResults,
        amenityResults,
        politicalResults,
        durationResults
      ] = await Promise.all([
        Promise.all(geoRequests),
        Promise.all(amenityRequests),
        Promise.all(politicalRequests),
        Promise.all(
          destinations.map(dest => 
            getDuration(lat, lng, dest.coordinates.lat, dest.coordinates.lng, dest.city, dest.postalCode)
          )
        )
      ]);

      // Update stores with results
      const [sismicRisksGeo, soilPollutionGeo, geoGasparRisksGeo] = geoResults;
      sismicRisks.set(sismicRisksGeo);
      soilPollution.set(soilPollutionGeo);
      geoGasparRisks.set(geoGasparRisksGeo);
      incrementCompletedTasks();

      const [storesFetch, healthAmenitiesFetch, educationAmenitiesFetch, associationsFetch, weatherDataFetch] = amenityResults;
      stores.set(storesFetch);
      healthAmenities.set(healthAmenitiesFetch);
      educationAmenities.set(educationAmenitiesFetch);
      associations.set(associationsFetch);
      weatherData.set(weatherDataFetch);
      incrementCompletedTasks();

      const [legislativesResults, presidentResults, legislatives2024Results, inseeDataFetch] = politicalResults;
      legislativesElectionResults.set(legislativesResults);
      presidentElectionResults.set(presidentResults);
      legislativesElectionResults2024.set(legislatives2024Results);
      inseeData.set(inseeDataFetch);
      incrementCompletedTasks();

      durationPerDestination.set(durationResults);
      incrementCompletedTasks();

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
          <SelectWithCustomArrow
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={cities.length === 0}
            placeholder="Saisissez un code postal"
          >
            {cities.map((city, index) => (
              <option key={index} value={city.Nom_commune}>
                {city.Nom_commune}
              </option>
            ))}
          </SelectWithCustomArrow>
          {cities.length === 0 && formData.postalCode.length === 5 && (
            <p className="text-sm text-gray-500 mt-1">
              Chargement des villes...
            </p>
          )}
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