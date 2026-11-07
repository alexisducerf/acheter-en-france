import { useState } from 'react';
import { Spinner } from './ui';

const toneOf = (score) => {
  if (score === null) return { text: 'text-muted', bar: 'bg-line-strong' };
  if (score >= 65) return { text: 'text-sage', bar: 'bg-sage' };
  if (score >= 40) return { text: 'text-amber', bar: 'bg-amber' };
  return { text: 'text-clay', bar: 'bg-clay' };
};

/**
 * Overall city rating out of 100, with one bar per category.
 * @param rating result of computeRating()
 */
const ScoreCard = ({ rating, loading }) => {
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="card mt-8 flex items-center gap-3 p-6 text-sm text-muted">
        <Spinner /> Calcul de la note…
      </div>
    );
  }
  if (!rating || rating.score === null) return null;

  const scored = rating.categories.filter((c) => c.score !== null);
  const tone = toneOf(rating.score);

  return (
    <div className="card mt-8 p-6 sm:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="shrink-0 md:w-44">
          <p className="eyebrow">Note globale</p>
          <p className={`mt-2 font-display text-6xl font-medium tabular-nums ${tone.text}`}>
            {rating.score}
            <span className="text-2xl text-muted">/100</span>
          </p>
          <p className="mt-2 text-xs text-muted">
            Basée sur {scored.length}/{rating.categories.length} catégories
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <ul className="space-y-3">
            {rating.categories.map((c) => {
              const t = toneOf(c.score);
              return (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className={c.score === null ? 'text-muted' : 'text-ink-soft'}>
                      {c.label} <span className="text-xs text-muted">· {c.weight} %</span>
                    </span>
                    <span className={`font-semibold tabular-nums ${t.text}`}>
                      {c.score === null ? 'Non noté' : Math.round(c.score)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                    <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${c.score ?? 0}%` }} />
                  </div>
                  {open && c.details.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs text-muted">
                      {c.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <button type="button" className="mt-4 text-sm font-medium text-accent hover:underline" onClick={() => setOpen(!open)}>
            {open ? 'Masquer le détail' : 'Voir le détail du calcul'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
