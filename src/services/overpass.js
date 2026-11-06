// Runs an Overpass QL query through the `overpass` Netlify function
// (overpass-api.de requires an identifying User-Agent, which browsers can't set).
export const runOverpassQuery = async (query) => {
  const response = await fetch('/api/overpass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error(error || `Erreur lors de la récupération des données (${response.status})`);
  }
  return response.json();
};
