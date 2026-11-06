import AmenityCard from "./AmenityCard";
import { Empty, SubHeading } from "./ui";

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

  if (schools.length === 0) {
    return <Empty>Aucun établissement scolaire dans un rayon de 5 km.</Empty>;
  }

  // Known types first, in teaching order, then anything unexpected
  const types = [
    ...typeOrder.filter((type) => groupedSchools[type]),
    ...Object.keys(groupedSchools).filter((type) => !typeOrder.includes(type)),
  ];

  return (
    <div className="space-y-8">
      {types.map((type) => (
        <div key={type}>
          <SubHeading count={groupedSchools[type].length}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </SubHeading>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groupedSchools[type].map((school, i) => (
              <AmenityCard
                key={i}
                amenity={{
                  ...school,
                  amenityType: school.schoolType,
                  isPrivate: school.isPrivate === undefined ? null : school.isPrivate ? 'Privé' : 'Public'
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchoolsSection;
