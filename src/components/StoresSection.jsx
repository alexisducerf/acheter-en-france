import { useState } from "react";
import AmenityCard from "./AmenityCard";
import { Empty } from "./ui";
import { STORES_RADIUS_KM } from "../services/stores";

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
    'agrarian': 'Matériel agricole',
    'books': 'Librairies',
    'cafe': 'Cafés et bars'
  };

  const [selected, setSelected] = useState('all');

  if (stores.length === 0) {
    return <Empty>Aucun commerce trouvé dans un rayon de {STORES_RADIUS_KM} km.</Empty>;
  }

  const label = (category) => categoryTranslations[category] || category;
  const categories = Object.entries(groupedStores).sort((a, b) => b[1].length - a[1].length);
  const visible = selected === 'all' ? categories : categories.filter(([category]) => category === selected);

  const pill = (active) =>
    `rounded-full border px-3 py-1.5 text-sm transition ${
      active ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink-soft hover:border-line-strong'
    }`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={pill(selected === 'all')} onClick={() => setSelected('all')}>
          Tous <span className="opacity-60">{stores.length}</span>
        </button>
        {categories.map(([category, items]) => (
          <button key={category} type="button" className={pill(selected === category)} onClick={() => setSelected(category)}>
            {label(category)} <span className="opacity-60">{items.length}</span>
          </button>
        ))}
      </div>

      {visible.map(([category, categoryStores]) => (
        <div key={category}>
          <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold text-ink">
            {label(category)} <span className="font-normal text-muted">{categoryStores.length}</span>
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categoryStores.map((store, i) => (
              <AmenityCard key={i} amenity={{ ...store, amenityType: label(store.category) }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoresSection;
