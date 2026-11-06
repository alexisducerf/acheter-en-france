import { Badge, Empty, formatNumber } from './ui';

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-muted">{label}</dt>
    <dd className="mt-0.5 break-words text-ink-soft">{children || '—'}</dd>
  </div>
);

const AssociationsSection = ({ associations = [], total = 0 }) => {
  if (!Array.isArray(associations)) {
    console.error('AssociationsSection: associations prop must be an array');
    return null;
  }

  if (associations.length === 0) {
    return <Empty>Aucune association enregistrée au Répertoire national des associations.</Empty>;
  }

  const active = associations.filter((a) => a.position === 'Active').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <span>
          Les {associations.length} plus récentes sur <strong className="text-ink">{formatNumber(total)}</strong>
        </span>
        <Badge tone="good">{active} actives</Badge>
        <Badge tone="neutral">{associations.length - active} inactives</Badge>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {associations.map((association) => (
          <li key={association.id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-4 transition hover:bg-paper/60">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-ink">{association.title}</h4>
                  {association.object && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted group-open:line-clamp-none">{association.object}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge tone={association.position === 'Active' ? 'good' : 'neutral'}>{association.position}</Badge>
                  {association.ispublic === 'oui' && <Badge tone="accent">Utilité publique</Badge>}
                </div>
                <svg className="mt-1 h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </summary>

              <div className="border-t border-line bg-paper/40 px-5 py-4">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Création">{association.creationDate}</Field>
                  <Field label="Dernière mise à jour">{association.lastUpdate}</Field>
                  <Field label="Identifiant RNA">{association.id}</Field>
                  <Field label="Catégorie">{association.amenityType}</Field>
                  <Field label="Adresse">{association.address}</Field>
                  <Field label="Intercommunalité">{association.epci_name}</Field>
                  <Field label="Département">{association.department}</Field>
                  <Field label="Région">{association.region}</Field>
                  {association.website && <Field label="Site web">{association.website}</Field>}
                </dl>
                {association.geo_point_2d && (
                  <a
                    href={`https://www.google.com/maps?q=${association.geo_point_2d.lat},${association.geo_point_2d.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                  >
                    Voir sur la carte →
                  </a>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssociationsSection;
