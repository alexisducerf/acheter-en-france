import { setServiceError } from '../stores/search';

// Annuaire de l'éducation (Ministère de l'Éducation nationale), Opendatasoft API.
const API_URL = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records';
const RADIUS_KM = 5;
const LIMIT = 100; // API maximum per request

// Administrative offices and guidance centres aren't schools.
const EXCLUDED_TYPES = ['Service Administratif', 'Information et orientation'];

// Maps a record to the labels used by SchoolsSection.
const getSchoolType = (record) => {
  switch (record.type_etablissement) {
    case 'Ecole':
      return record.ecole_maternelle && !record.ecole_elementaire ? 'maternelle' : 'primaire';
    case 'Collège':
      return 'collège';
    case 'Lycée':
    case 'EREA':
      return 'lycée';
    case 'Médico-social':
      return 'établissement médico-social';
    default:
      return 'établissement scolaire';
  }
};

const formatAddress = (record) => ({
  street: [record.adresse_1, [record.code_postal, record.nom_commune].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', '),
});

// Schools (maternelle to lycée) around a point, nearest first.
const getSchoolsByLatLng = async (lat, lng) => {
  const point = `geom'POINT(${lng} ${lat})'`;
  const params = new URLSearchParams({
    where: `within_distance(position, ${point}, ${RADIUS_KM}km) and etat='OUVERT'`,
    order_by: `distance(position, ${point})`,
    limit: LIMIT,
  });

  try {
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des données (${response.status})`);
    }
    const { results = [] } = await response.json();

    return results
      .filter((record) => !EXCLUDED_TYPES.includes(record.type_etablissement))
      .map((record) => ({
        id: record.identifiant_de_l_etablissement,
        name: record.nom_etablissement || 'Non renseigné',
        schoolType: getSchoolType(record),
        latitude: record.latitude,
        longitude: record.longitude,
        address: formatAddress(record),
        phone: record.telephone || '',
        website: record.web || '',
        isPrivate: record.statut_public_prive === 'Privé',
      }));
  } catch (error) {
    setServiceError('schools', `Impossible de charger les établissements scolaires: ${error.message}`);
    return [];
  }
};

export { getSchoolsByLatLng };
