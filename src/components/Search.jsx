import { useEffect, useState } from 'react';
import { isLoaded, isLoading, hasErrors, durationPerDestination, codeInsee, geoGasparRisks,
   sismicRisks, soilPollution, legislativesElectionResults, presidentElectionResults,
    legislativesElectionResults2024, inseeData, incrementCompletedTasks, completedTasks, healthAmenities, stores, associations, educationAmenities} from '../stores/search';
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

    completedTasks.set(0);

    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
    
    try {
      isLoaded.set(false);
      isLoading.set(true);
      hasErrors.set(false);    

      // Rechercher dans france.json les données de la ville
      const cityData = franceData.find(city => 
        city.Code_postal === parseInt(formData.postalCode) && 
        city.Nom_commune === formData.city
      );

      if (!cityData) {
        throw new Error('Ville non trouvée');
      }

      // Extraire lat/lng des coordonnées GPS
      const [lat, lng] = cityData.coordonnees_gps.split(', ').map(Number);
      const codeInseeFromPostalCode = cityData.Code_commune_INSEE;
          
      codeInsee.set(codeInseeFromPostalCode);
      incrementCompletedTasks();

      const destinations = getDestinationsFromLocalStorage();
      incrementCompletedTasks();

      durationPerDestination.set([]);
      const durations = await Promise.all(
        destinations.map(async (dest) =>
          getDuration(
            lat,
            lng,
            dest.coordinates.lat,
            dest.coordinates.lng,
            dest.city,
            dest.postalCode
          )
        )
      );

      durationPerDestination.set(durations);
      incrementCompletedTasks();

      const sismicRisksGeo = await getSismicRisks(formData.city, codeInseeFromPostalCode);
      sismicRisks.set(sismicRisksGeo);
      incrementCompletedTasks();

      const soilPollutionGeo = await getSoilPollution(formData.city, codeInseeFromPostalCode);
      soilPollution.set(soilPollutionGeo);
      incrementCompletedTasks();

      const geoGasparRisksGeo = await getGeoGasparRisks(formData.city, codeInseeFromPostalCode);
      geoGasparRisks.set(geoGasparRisksGeo);
      incrementCompletedTasks();

      const storesFetch = await getStoresByZipCode(formData.postalCode);
      stores.set(storesFetch);
      incrementCompletedTasks();

      const healthAmenitiesFetch = await getHealthAmenitiesByLatLng(lat, lng);
      healthAmenities.set(healthAmenitiesFetch);
      incrementCompletedTasks();

      const educationAmenitiesFetch = await getSchoolsByLatLng(lat, lng);
      educationAmenities.set(educationAmenitiesFetch);
      incrementCompletedTasks();

      const associationsFetch = await getAssociationsByZipCode(formData.postalCode);
      associations.set(associationsFetch);
      incrementCompletedTasks();

      const legislativesElectionResultsFetch = await getLegislativesElectionResults(codeInseeFromPostalCode);
      legislativesElectionResults.set(legislativesElectionResultsFetch);
      incrementCompletedTasks();

      const presidentElectionResultsFetch = await getPresidentElectionResults(codeInseeFromPostalCode);
      presidentElectionResults.set(presidentElectionResultsFetch);
      incrementCompletedTasks();

      const legislativesElectionResults2024Fetch = await getLegislativesElectionResults2024(codeInseeFromPostalCode);
      legislativesElectionResults2024.set(legislativesElectionResults2024Fetch);
      incrementCompletedTasks();

      const inseeDataFetch = await getInseeData(codeInseeFromPostalCode);
      incrementCompletedTasks();
      inseeData.set(inseeDataFetch);

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