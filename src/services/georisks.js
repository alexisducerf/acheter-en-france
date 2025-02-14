import axios from 'axios';

const getSismicRisks = async (city, code_insee) => {
  try {
    const response = await axios.get(`https://georisques.gouv.fr/api/v1/zonage_sismique`, {
      params: {
        code_insee,
        rayon: 10000
      },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.georisques.gouv.fr/',
        'Origin': 'https://www.georisques.gouv.fr',
        'Connection': 'keep-alive'
      }
    });

    if (response.data.results && response.data.results > 0) {
      return response.data.data[0].zone_sismicite;
    }
    return null;
  } catch (error) {
    console.error(`Error getting sismic risks for ${city} - ${code_insee}:`, error.message);
    return null;
  }
};

const getSoilPollution = async (city, code_insee) => {
  try {
    const response = await axios.get(`https://georisques.gouv.fr/api/v1/ssp`, {
      params: {
        code_insee,
        rayon: 10000
      },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.georisques.gouv.fr/',
        'Origin': 'https://www.georisques.gouv.fr',
        'Connection': 'keep-alive'
      }
    });

    if (response.data.casias.results && response.data.casias.results > 0) {
      return {
        number: response.data.casias.results,
        elements: response.data.casias.data.map(risk => `${risk.statut} - ${risk.nom_etablissement} - ${risk.nom_commune} (${risk.code_insee})`).join('\n')
      };
    }
    return null;
  } catch (error) {
    console.error(`Error getting soil pollution for ${city} - ${code_insee}:`, error.message);
    return null;
  }
};

const getGeoGasparRisks = async (city, code_insee) => {
  try {
    const response = await axios.get(`https://georisques.gouv.fr/api/v1/gaspar/risques`, {
      params: {
        code_insee,
        rayon: 10000
      },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.georisques.gouv.fr/',
        'Origin': 'https://www.georisques.gouv.fr',
        'Connection': 'keep-alive'
      }
    });

    if (response.data.results && response.data.results > 0) {
      const risks = response.data.data[0].risques_detail;
      return risks.map(risk => risk.libelle_risque_long).join(', ')
    }
    return null;
  } catch (error) {
    console.error(`Error getting Gaspar risks for ${city} - ${code_insee}:`, error.message);
    return null;
  }
};


export { getSismicRisks, getSoilPollution, getGeoGasparRisks };
