import {
  isLoaded, isLoading, hasErrors, durationPerDestination, codeInsee, geoGasparRisks, sismicRisks, soilPollution,
  legislativesElectionResults, presidentElectionResults, legislativesElectionResults2024, inseeData,
  incrementCompletedTasks, completedTasks, totalTasks, healthAmenities, stores, associations, educationAmenities,
  weatherData, waterData, searchedLocation, serviceErrors, savedSearchDate,
} from '../stores/search';
import { getDestinationsFromLocalStorage } from './helpers';
import { saveSearch, getSavedSearch } from './history';
import { getDuration } from '../services/durations';
import { getGeoGasparRisks, getSismicRisks, getSoilPollution } from '../services/georisks';
import { getLegislativesElectionResults, getPresidentElectionResults, getLegislativesElectionResults2024 } from '../services/political';
import { getInseeData } from '../services/insee';
import { getStoresByLatLng } from '../services/stores';
import { getHealthAmenitiesByLatLng } from '../services/health';
import { getSchoolsByLatLng } from '../services/schools';
import { getAssociationsByZipCode } from '../services/associations';
import { getWeatherFromLastYear } from '../services/meteo';
import { tapWaterAnalysis } from '../services/water';
import franceData from '../data/france.json';

// Every atom holding a search result: reset before a search, saved to and restored from history.
const RESULT_ATOMS = {
  durationPerDestination,
  codeInsee,
  searchedLocation,
  serviceErrors,
  geoGasparRisks,
  sismicRisks,
  soilPollution,
  legislativesElectionResults,
  presidentElectionResults,
  legislativesElectionResults2024,
  inseeData,
  healthAmenities,
  stores,
  associations,
  educationAmenities,
  weatherData,
  waterData,
};

const INITIAL_VALUES = { durationPerDestination: [], codeInsee: '', serviceErrors: {} };

const resetResults = () => {
  Object.entries(RESULT_ATOMS).forEach(([name, store]) => store.set(INITIAL_VALUES[name] ?? null));
  savedSearchDate.set(null);
};

const scrollToResults = () => {
  setTimeout(() => {
    document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

// Fetches every data source for a commune, fills the atoms, then saves the result to history.
export const runSearch = async ({ postalCode, city }) => {
  completedTasks.set(0);
  isLoaded.set(false);
  isLoading.set(true);
  hasErrors.set(false);
  resetResults();
  scrollToResults();

  try {
    // Get city data first as it's required for other requests
    const cityData = franceData.find((c) => c.Code_postal === parseInt(postalCode) && c.Nom_commune === city);
    if (!cityData) {
      throw new Error('Ville non trouvée');
    }

    const [lat, lng] = cityData.coordonnees_gps.split(', ').map(Number);
    // INSEE codes are stored as numbers: restore the leading zero of 4-digit codes
    const insee = String(cityData.Code_commune_INSEE).padStart(5, '0');

    codeInsee.set(insee);
    searchedLocation.set({ city, postalCode, codeInsee: insee, lat, lng });
    incrementCompletedTasks();

    // Group 1: Geographic and risk data
    const geoRequests = [
      getSismicRisks(city, insee),
      getSoilPollution(city, insee),
      getGeoGasparRisks(city, insee),
      tapWaterAnalysis(insee),
    ];

    // Group 2: Amenities data
    const amenityRequests = [
      getStoresByLatLng(lat, lng),
      getHealthAmenitiesByLatLng(lat, lng),
      getSchoolsByLatLng(lat, lng),
      getAssociationsByZipCode(postalCode),
      getWeatherFromLastYear(lat, lng),
    ];

    // Group 3: Political and demographic data
    const politicalRequests = [
      getLegislativesElectionResults(insee),
      getPresidentElectionResults(insee),
      getLegislativesElectionResults2024(insee),
      getInseeData(insee),
    ];

    const destinations = getDestinationsFromLocalStorage();
    incrementCompletedTasks();

    const [geoResults, amenityResults, politicalResults, durationResults] = await Promise.all([
      Promise.all(geoRequests),
      Promise.all(amenityRequests),
      Promise.all(politicalRequests),
      Promise.all(
        destinations.map((dest) =>
          getDuration(lat, lng, dest.coordinates.lat, dest.coordinates.lng, dest.city, dest.postalCode)
        )
      ),
    ]);

    const [sismicRisksGeo, soilPollutionGeo, geoGasparRisksGeo, tapWaterAnalysisGeo] = geoResults;
    sismicRisks.set(sismicRisksGeo);
    soilPollution.set(soilPollutionGeo);
    geoGasparRisks.set(geoGasparRisksGeo);
    waterData.set(tapWaterAnalysisGeo);
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

    const data = Object.fromEntries(Object.entries(RESULT_ATOMS).map(([name, store]) => [name, store.get()]));
    saveSearch({ postalCode, city, data });
  } catch (error) {
    console.error('Search error:', error);
    hasErrors.set(true);
  } finally {
    isLoading.set(false);
  }
};

// Shows a saved search without fetching anything.
export const restoreSearch = async (id) => {
  const entry = await getSavedSearch(id);
  if (!entry) return false;

  resetResults();
  Object.entries(RESULT_ATOMS).forEach(([name, store]) => {
    if (name in entry.data) store.set(entry.data[name]);
  });
  savedSearchDate.set(entry.savedAt);
  hasErrors.set(false);
  isLoading.set(false);
  completedTasks.set(totalTasks.get());
  isLoaded.set(true);
  scrollToResults();
  return true;
};
