const getAssociationsByZipCode = async (zipCode) => {
  try {
    // Fetch data from API
    const apiUrl = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/ref-france-association-repertoire-national/records?where=pc_address_asso%3D${zipCode}&order_by=creation_date%20DESC&limit=100`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Process data directly in the fetch function
    if (!data || !data.results) {
      console.warn('No associations found for this zip code');
      return [];
    }


    console.log('Associations data:', data);

    // Transform the data
    const processedAssociations = data.results.map(association => ({
      id: association.id,
      title: association.title,
      amenityType: getCategoryFromObject(association.social_object1),
      address: `${association.street_name_manager} ${association.pc_address_manager} ${association.com_name_asso}`,
      creationDate: new Date(association.creation_date).toLocaleDateString('fr-FR'),
      object: association.object,
      website: association.website || '',
      isPublic: association.ispublic === 'oui',
      position: association.position === 'Active' ? 'Active' : 'Inactive',
      coordinates: association.geo_point_2d,
      department: association.dep_name,
      region: association.reg_name,
      website: association.website || '',
      epci_name: association.epci_name,
      lastUpdate: new Date(association.update_date).toLocaleDateString('fr-FR')
    }));

    // Return just the processed array
    return processedAssociations;

  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return [];
  }
};

const getCategoryFromObject = (socialObject) => {
  const categories = {
    // Culture, pratiques d'activités artistiques, culturelles
    '001005': 'Musique',
    '001010': 'Théâtre et danse',
    '001015': 'Arts plastiques',
    '001020': 'Cinéma et audiovisuel',
    '001025': 'Lecture, littérature et langues',
    '001030': 'Arts de la rue',
    '001035': 'Photographie',
    '001040': 'Chant choral',
    '001045': 'Histoire',
    '001050': 'Architecture',
    '001000': 'Culture et arts (autres)',

    // Action sociale
    '002005': 'Aide aux personnes en difficulté',
    '002010': 'Action familiale',
    '002015': 'Centres sociaux',
    '002020': 'Aide aux victimes',
    '002025': 'Lutte contre l\'exclusion',
    '002000': 'Action sociale (autres)',

    // Interventions sociales
    '003005': 'Coopération Nord-Sud',
    '003010': 'Échanges culturels',
    '003015': 'Aide humanitaire',
    '003000': 'Relations internationales',

    // Santé
    '004005': 'Services de santé',
    '004010': 'Protection de la santé',
    '004015': 'Associations de malades',
    '004020': 'Hôpitaux',
    '004025': 'Don du sang',
    '004000': 'Santé (autres)',

    // Services et établissements médico-sociaux
    '005005': 'Logement social',
    '005010': 'Foyers de jeunes travailleurs',
    '005015': 'Aide au logement',
    '005000': 'Logement (autres)',

    // Environnement, cadre de vie
    '006005': 'Protection de la nature',
    '006010': 'Protection des animaux',
    '006015': 'Protection des sites',
    '006020': 'Écologie, développement durable',
    '006000': 'Environnement (autres)',

    // Patrimoine
    '007005': 'Monuments historiques',
    '007010': 'Musées',
    '007015': 'Arts et traditions populaires',
    '007000': 'Patrimoine (autres)',

    // Clubs de loisirs, relations
    '015005': 'Clubs de loisirs multiples',
    '015010': 'Clubs du troisième âge',
    '015015': 'Majorettes',
    '015020': 'Clubs de collectionneurs',
    '015000': 'Loisirs (autres)',

    // Sports
    '013005': 'Football',
    '013010': 'Rugby',
    '013015': 'Basketball',
    '013020': 'Volleyball',
    '013025': 'Tennis',
    '013030': 'Athlétisme',
    '013035': 'Natation',
    '013040': 'Cyclisme',
    '013045': 'Arts martiaux',
    '013050': 'Gymnastique',
    '013000': 'Sports (autres)',

    // Éducation formation
    '020005': 'Parents d\'élèves',
    '020010': 'Associations périscolaires',
    '020015': 'Études et formations',
    '020020': 'Formation professionnelle',
    '020000': 'Éducation (autres)',

    // Petite enfance
    '021005': 'Crèches, garderies',
    '021010': 'Haltes-garderies',
    '021015': 'Aide à la parentalité',
    '021000': 'Petite enfance (autres)',

    // Activités économiques
    '017005': 'Associations de commerçants',
    '017010': 'Associations d\'artisans',
    '017015': 'Marchés',
    '017000': 'Commerce (autres)',

    // Représentation, défense d'intérêts économiques
    '019005': 'Défense des consommateurs',
    '019010': 'Défense des locataires',
    '019015': 'Défense des droits humains',
    '019000': 'Défense des droits (autres)',

    // Autres catégories principales
    '014000': 'Chasse et pêche',
    '016000': 'Religion',
    '018000': 'Technique et recherche',
    '022000': 'Aide aux entreprises',
    '023000': 'Clubs seniors',
    '024000': 'Tourisme',
    '030000': 'Agriculture',
    '032000': 'Clubs d\'investissement',
    '034000': 'Consommation',
    '036000': 'Insertion professionnelle',
    '038000': 'Armée',
    '040000': 'Médiation',
    '060000': 'Aide humanitaire',
    '070000': 'Clubs sociaux',
    '080000': 'Services civiques',
    '090000': 'Activités politiques'
  };

  return categories[socialObject] || 'Autre';
};

export { getAssociationsByZipCode };
