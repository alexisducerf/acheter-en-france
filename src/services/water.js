
const tapWaterAnalysis = (zipCode) => {

  const url = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=${zipCode}&size=100`;

  // Fetch data from API
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.data) {
        console.warn('No water analysis found for this zip code');
        return { total: 0, results: [] };
      }

      // Transform the data
      const processedResults = data.data.map(result => ({
        date: new Date(result.date_prelevement).toLocaleDateString('fr-FR'),
        parameter: result.libelle_parametre,
        value: result.resultat_numerique,
        unit: result.libelle_unite,
        limit: result.limite_qualite_parametre,
        city: result.nom_commune,
        status: result.conclusion_conformite_prelevement
      }));


      return {
        total: data.count || 0,
        results: processedResults
      };
    })
    .catch(error => {
      console.error('Erreur with water:', error);
      return { total: 0, results: [] };
    });
}

export { tapWaterAnalysis };
