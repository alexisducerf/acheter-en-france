const AmenityCard = ({ amenity }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <h4 className="font-medium text-gray-800">{amenity.name}</h4>
    <p className="text-sm text-gray-600 mt-1">{amenity.amenityType}</p>
    {amenity.address.street && (
      <p className="text-sm text-gray-600 mt-2">
        {amenity.address.housenumber} {amenity.address.street}, {amenity.address.postcode}
      </p>
    )}
    {amenity.phone && (
      <p className="text-sm text-gray-600 mt-1">
        📞 {amenity.phone}
      </p>
    )}
    {amenity.website && (
      <a 
        href={amenity.website} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline mt-1 block"
      >
        🌐 Site web
      </a>
    )}
    {amenity.openingHours && (
      <p className="text-sm text-gray-600 mt-1">
        ⏰ {amenity.openingHours}
      </p>
    )}
  </div>
);

export default AmenityCard;
