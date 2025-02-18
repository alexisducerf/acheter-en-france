const franceData = require('../../src/data/france.json');

exports.handler = async (event) => {
  const { postalCode } = JSON.parse(event.body);

  // Find all cities matching the postal code
  const matches = franceData.filter(entry =>
    String(entry.Code_postal) === postalCode
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cities: matches.map(city => ({
        Nom_commune: city.Nom_commune,
        Code_commune_INSEE: city.Code_commune_INSEE
      }))
    })
  };
};