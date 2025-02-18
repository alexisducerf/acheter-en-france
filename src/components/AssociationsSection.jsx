import AmenityCard from './AmenityCard';

const AssociationsSection = ({ associations = [] }) => {
  if (!Array.isArray(associations)) {
    console.error('AssociationsSection: associations prop must be an array');
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatus = (association) => {
    if (association.dissolution_date) return 'Dissoute';
    return association.position || 'Non renseigné';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-700">
            Les dernières {associations.length} association{associations.length > 1 ? 's' : ''}
          </h2>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
              {associations.filter(a => a.position === 'Active').length} actives
            </span>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
              {associations.filter(a => a.position !== 'Active').length} inactives
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {associations.map((association) => (
            <div key={association.id} className="p-4 hover:bg-gray-50">
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{association.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{association.object}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      association.position === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {association.position}
                    </span>
                    {association.ispublic === 'oui' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Utilité publique
                      </span>
                    )}
                  </div>
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <div className="space-y-1">
                    <dt className="text-gray-500">Création</dt>
                    <dd className="font-medium">{association.creationDate}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Dernière mis à jour</dt>
                    <dd className="font-medium">{association.lastUpdate}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Identifiant RNA</dt>
                    <dd className="font-medium">{association.id}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Catégorie</dt>
                    <dd className="font-medium">{association.amenityType}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Adresse</dt>
                    <dd className="font-medium">{association.address || 'Non renseignée'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Département</dt>
                    <dd className="font-medium">{association.department}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Région</dt>
                    <dd className="font-medium">{association.region}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-gray-500">Intercommunalité</dt>
                    <dd className="font-medium">{association.epci_name}</dd>
                  </div>
                  {(association.website && (
                  <div className="space-y-1">
                    <dt className="text-gray-500">Website</dt>
                    <dd className="font-medium">{association.website}</dd>
                  </div>))}
                </dl>

                {association.geo_point_2d && (
                  <div className="pt-2">
                    <a
                      href={`https://www.google.com/maps?q=${association.geo_point_2d.lat},${association.geo_point_2d.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <span>📍</span> Voir sur la carte
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssociationsSection;