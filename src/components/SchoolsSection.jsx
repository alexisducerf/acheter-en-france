import AmenityCard from "./AmenityCard";

const SchoolsSection = ({ schools }) => {
  // Group schools by type
  const groupedSchools = schools.reduce((acc, school) => {
    const type = school.schoolType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(school);
    return acc;
  }, {});

  // Order of school types for display
  const typeOrder = [
    'maternelle',
    'primaire',
    'collège',
    'lycée',
    'université',
    'enseignement supérieur',
    'école de musique',
    'école de langues',
    'auto-école',
    'établissement scolaire'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-700">
          {schools.length} établissement{schools.length > 1 ? 's' : ''} scolaire{schools.length > 1 ? 's' : ''} dans un rayon de 5km
        </p>
      </div>
      
      {typeOrder.map(type => {
        const typeSchools = groupedSchools[type];
        if (!typeSchools) return null;

        return (
          <div key={type} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              {type.charAt(0).toUpperCase() + type.slice(1)} ({typeSchools.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeSchools.map((school, i) => (
                <AmenityCard 
                  key={i} 
                  amenity={{
                    ...school,
                    amenityType: school.schoolType,
                    isPrivate: school.isPrivate ? '(Privé)' : '(Public)'
                  }} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SchoolsSection;