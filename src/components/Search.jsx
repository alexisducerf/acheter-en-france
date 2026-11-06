import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import SelectWithCustomArrow from './SelectWithCustomArrow';
import { runSearch, restoreSearch } from '../utils/runSearch';
import { searchHistory, loadHistory, deleteSavedSearch } from '../utils/history';

const Search = () => {
  const [formData, setFormData] = useState({
    postalCode: '',
    city: ''
  });

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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'postalCode' && value.length > 5) return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isWaitingForCities = cities.length === 0 && formData.postalCode.length === 5;

  return (
    <>
    <form
      onSubmit={handleSubmit}
      method="post"
      className="card grid gap-3 p-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-end sm:p-4"
    >
      <div>
        <label htmlFor="postalCode" className="field-label">Code postal</label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          pattern="[0-9]*"
          inputMode="numeric"
          autoComplete="postal-code"
          value={formData.postalCode}
          onChange={handleChange}
          className="field font-medium tabular-nums tracking-wider"
          placeholder="75001"
          required
        />
      </div>

      <div>
        <label htmlFor="city" className="field-label">
          Commune {isWaitingForCities && <span className="normal-case tracking-normal text-muted">· chargement…</span>}
        </label>
        <SelectWithCustomArrow
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          disabled={cities.length === 0}
          placeholder="Saisissez d'abord un code postal"
        >
          {cities.map((city, index) => (
            <option key={index} value={city.Nom_commune}>
              {city.Nom_commune}
            </option>
          ))}
        </SelectWithCustomArrow>
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        Analyser
      </button>
    </form>
    <RecentSearches />
    </>
  );
};

const formatSavedAt = (timestamp) =>
  new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Last searches saved in the browser: a click shows them again without fetching anything.
const RecentSearches = () => {
  const $history = useStore(searchHistory);

  useEffect(() => {
    loadHistory();
  }, []);

  if ($history.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="eyebrow mb-2">Recherches récentes</p>
      <ul className="flex flex-wrap gap-2">
        {$history.map((entry) => (
          <li key={entry.id} className="flex items-center rounded-full border border-line bg-surface text-sm text-ink-soft transition hover:border-line-strong">
            <button
              type="button"
              onClick={() => restoreSearch(entry.id)}
              className="py-1.5 pl-3 pr-1 text-left hover:text-ink"
              title={`Résultats du ${formatSavedAt(entry.savedAt)}`}
            >
              <span className="font-medium text-ink">{entry.city.toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase())}</span>{' '}
              <span className="tabular-nums text-muted">{entry.postalCode}</span>
            </button>
            <button
              type="button"
              onClick={() => deleteSavedSearch(entry.id)}
              className="rounded-full px-2 py-1.5 text-muted hover:text-clay"
              aria-label={`Supprimer ${entry.city} de l'historique`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
