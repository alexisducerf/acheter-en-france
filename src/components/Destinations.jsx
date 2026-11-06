import { useState, useEffect } from 'react';
import franceData from '../data/france.json';
import SelectWithCustomArrow from './SelectWithCustomArrow';

const findCities = (postalCode) =>
  franceData.filter((city) => String(city.Code_postal).padStart(5, '0') === postalCode);

const parseCoordinates = (cityData) => {
  const [lat, lng] = cityData.coordonnees_gps.split(', ').map(Number);
  return { lat, lng };
};

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [newDestination, setNewDestination] = useState({ city: '', postalCode: '' });
  const [cities, setCities] = useState([]);

  // Load saved destinations on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedDestinations');
      if (saved) setDestinations(JSON.parse(saved));
    } catch (error) {
      console.error('Impossible de lire les destinations enregistrées:', error);
    }
    setHasLoaded(true);
  }, []);

  // Persist destinations (only once the initial load is done, so we never overwrite with [])
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem('savedDestinations', JSON.stringify(destinations));
    }
  }, [destinations, hasLoaded]);

  // Suggest communes as soon as a full postal code is typed
  useEffect(() => {
    if (newDestination.postalCode.length === 5) {
      const matchingCities = findCities(newDestination.postalCode);
      setCities(matchingCities);
      setNewDestination((prev) => ({ ...prev, city: matchingCities[0]?.Nom_commune ?? '' }));
    } else {
      setCities([]);
      setNewDestination((prev) => ({ ...prev, city: '' }));
    }
  }, [newDestination.postalCode]);

  const handleAddDestination = (e) => {
    e.preventDefault();
    const cityData = cities.find((city) => city.Nom_commune === newDestination.city);
    if (!cityData) return;

    setDestinations([
      ...destinations,
      {
        city: newDestination.city,
        postalCode: newDestination.postalCode,
        coordinates: parseCoordinates(cityData)
      }
    ]);
    setNewDestination({ city: '', postalCode: '' });
  };

  const handleRemoveDestination = (index) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  return (
    <div className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Vos points de repère</p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">Destinations favorites</h2>
        </div>
        {destinations.length > 0 && (
          <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-ink-soft">
            {destinations.length}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">
        Travail, école, famille… Le temps de trajet en voiture vers chacune sera calculé à chaque recherche.
      </p>

      <ul className="mt-5 flex-1 space-y-2">
        {destinations.length === 0 && (
          <li className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
            Aucune destination pour l'instant.
          </li>
        )}
        {destinations.map((dest, index) => (
          <li
            key={`${dest.postalCode}-${dest.city}-${index}`}
            className="group flex items-center gap-3 rounded-xl border border-line bg-paper/50 px-4 py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft font-display text-sm font-semibold text-accent">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{dest.city}</p>
              <p className="text-xs text-muted tabular-nums">
                {dest.postalCode}
                {dest.coordinates && ` · ${dest.coordinates.lat.toFixed(3)}, ${dest.coordinates.lng.toFixed(3)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveDestination(index)}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-clay-soft hover:text-clay"
              aria-label={`Supprimer ${dest.city}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddDestination} className="mt-5 space-y-3 border-t border-line pt-5">
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Code postal"
            aria-label="Code postal de la destination"
            value={newDestination.postalCode}
            onChange={(e) =>
              setNewDestination({ ...newDestination, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })
            }
            className="field tabular-nums"
            required
          />
          <SelectWithCustomArrow
            value={newDestination.city}
            onChange={(e) => setNewDestination({ ...newDestination, city: e.target.value })}
            required
            disabled={cities.length === 0}
            placeholder="Commune"
          >
            {cities.map((city, index) => (
              <option key={index} value={city.Nom_commune}>
                {city.Nom_commune}
              </option>
            ))}
          </SelectWithCustomArrow>
        </div>
        <button type="submit" className="btn-secondary w-full" disabled={!newDestination.city}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Ajouter une destination
        </button>
      </form>
    </div>
  );
};

export default Destinations;
