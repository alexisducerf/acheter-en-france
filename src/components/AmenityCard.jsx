const AmenityCard = ({ amenity }) => {
  const { name, amenityType, address = {}, phone, website, openingHours, isPrivate } = amenity;

  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-4 transition hover:border-line-strong hover:shadow-[0_4px_16px_-8px_rgba(27,31,59,0.18)]">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium leading-snug text-ink">{name || 'Sans nom'}</h4>
        {isPrivate && <span className="shrink-0 text-xs text-muted">{isPrivate}</span>}
      </div>
      {amenityType && <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted">{amenityType}</p>}

      <dl className="mt-3 space-y-1.5 text-sm text-ink-soft">
        {address.street && (
          <div className="flex gap-2">
            <dt className="sr-only">Adresse</dt>
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            <dd>{[address.housenumber, address.street].filter(Boolean).join(' ')}{address.postcode && `, ${address.postcode}`}</dd>
          </div>
        )}
        {phone && (
          <div className="flex gap-2">
            <dt className="sr-only">Téléphone</dt>
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" strokeLinejoin="round" />
            </svg>
            <dd><a href={`tel:${phone}`} className="hover:text-accent">{phone}</a></dd>
          </div>
        )}
        {openingHours && (
          <div className="flex gap-2">
            <dt className="sr-only">Horaires</dt>
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" strokeLinecap="round" />
            </svg>
            <dd className="break-words">{openingHours}</dd>
          </div>
        )}
      </dl>

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:underline"
        >
          Site web
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </article>
  );
};

export default AmenityCard;
