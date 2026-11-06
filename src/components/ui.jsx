// Shared presentational primitives for the results page.

export const Section = ({ id, index, title, description, aside, children }) => (
  <section id={id} className="card scroll-mt-24 p-6 sm:p-8">
    <header className="mb-6 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{String(index).padStart(2, '0')}</p>
        <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-ink sm:text-[28px]">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
    {children}
  </section>
);

const tones = {
  neutral: 'bg-paper text-ink-soft border-line',
  accent: 'bg-accent-soft text-accent-dark border-accent/20',
  good: 'bg-sage-soft text-sage border-sage/20',
  warn: 'bg-amber-soft text-amber border-amber/20',
  bad: 'bg-clay-soft text-clay border-clay/20',
};

export const Badge = ({ tone = 'neutral', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
    {children}
  </span>
);

export const Count = ({ children }) => (
  <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-ink-soft">{children}</span>
);

export const Spinner = ({ className = '' }) => (
  <span
    className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent ${className}`}
    aria-label="Chargement"
  />
);

export const Skeleton = ({ lines = 3 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Chargement">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 animate-pulse rounded-full bg-paper"
        style={{ width: `${90 - i * 15}%` }}
      />
    ))}
  </div>
);

export const Empty = ({ children = 'Aucune donnée disponible pour cette commune.' }) => (
  <div className="rounded-xl border border-dashed border-line-strong px-5 py-8 text-center text-sm text-muted">
    {children}
  </div>
);

export const ErrorNote = ({ children }) => (
  <div className="rounded-xl border border-clay/20 bg-clay-soft px-5 py-4 text-sm text-clay">{children}</div>
);

export const SubHeading = ({ children, count }) => (
  <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold text-ink">
    {children}
    {count !== undefined && <span className="font-normal text-muted">{count}</span>}
  </h3>
);

/**
 * Renders a skeleton while the search is running, then either the content,
 * an error, or an empty state.
 */
export const Loadable = ({ loading, error, empty, emptyText, children }) => {
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (loading) return <Skeleton />;
  if (empty) return <Empty>{emptyText}</Empty>;
  return children;
};

export const formatNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('fr-FR') : value ?? '—';
};
