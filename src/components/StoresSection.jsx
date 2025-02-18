import AmenityCard from "./AmenityCard";

const StoresSection = ({ stores }) => {
  // Group stores by category
  const groupedStores = stores.reduce((acc, store) => {
    const category = store.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(store);
    return acc;
  }, {});

  // Translate categories to French and sort them
  const categoryTranslations = {
    'supermarket': 'Supermarchés',
    'bakery': 'Boulangeries',
    'convenience': 'Épiceries',
    'tobacco': 'Tabacs',
    'car': 'Concessionnaires',
    'car_repair': 'Garages',
    'sports': 'Sports',
    'gas': 'Stations-service',
    'hairdresser': 'Coiffeurs',
    'farm': 'Producteurs',
    'restaurant': 'Restaurants',
    'clothes': 'Vêtements',
    'shoes': 'Chaussures',
    'chemist': 'Parapharmacie',
    'hearing_aids': 'Audioprothésistes',
    'funeral_directors': 'Pompes funèbres',
    'jewelry': 'Bijouteries',
    'bicycle': 'Vélos',
    'butcher': 'Boucheries',
    'estate_agent': 'Agences immobilières',
    'deli': 'Traiteurs',
    'fast_food': 'Restauration rapide',
    'pet_grooming': 'Toilettage animalier',
    'antiques': 'Antiquités',
    'fishing': 'Pêche',
    'nutrition_animale': 'Nutrition animale',
    'laundry': 'Pressing',
    'medical_supply': 'Matériel médical',
    'mobile_phone': 'Téléphonie',
    'newsagent': 'Presse',
    'tattoo': 'Tatoueurs',
    'repair': 'Réparation',
    'tool_hire': 'Location d\'outils',
    'florist': 'Fleuristes',
    'variety_store': 'Bazars',
    'alcohol': 'Cavistes',
    'furniture': 'Meubles',
    'garden_centre': 'Jardineries',
    'optician': 'Opticiens',
    'agrarian': 'Matériel agricole'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-700">
          {stores.length} commerce{stores.length > 1 ? 's' : ''}
        </p>
      </div>
      
      {Object.entries(groupedStores).map(([category, categoryStores]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
            {categoryTranslations[category] || category} ({categoryStores.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStores.map((store, i) => (
              <AmenityCard 
                key={i} 
                amenity={{
                  ...store,
                  amenityType: categoryTranslations[store.category] || store.category
                }} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoresSection;
