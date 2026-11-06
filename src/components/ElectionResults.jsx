import { formatNumber } from './ui';

const formatPercent = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %` : '—';
};

/**
 * One election: turnout figures + candidates ranked by votes, with bars scaled
 * relative to the leading candidate.
 */
const ElectionResults = ({ title, data, percentKey, showNuance = false }) => {
  const { participation = {}, candidats = [] } = data;
  const ranked = [...candidats].sort((a, b) => (b.voix || 0) - (a.voix || 0));
  const maxVotes = ranked[0]?.voix || 1;
  const turnout = participation.inscrits
    ? (Number(participation.votants) / Number(participation.inscrits)) * 100
    : null;

  const figures = [
    ['Inscrits', participation.inscrits],
    ['Votants', participation.votants],
    ['Exprimés', participation.exprimes],
    ['Abstentions', participation.abstentions],
  ];

  return (
    <div className="rounded-xl border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        {turnout !== null && Number.isFinite(turnout) && (
          <p className="text-sm text-muted">
            Participation <span className="font-semibold text-ink tabular-nums">{formatPercent(turnout)}</span>
          </p>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {figures.map(([label, value]) => (
          <div key={label} className="bg-surface px-3 py-2.5">
            <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-5 space-y-3">
        {ranked.map((c, i) => (
          <li key={i}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={`truncate ${i === 0 ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
                {c.prenom} {c.nom}
                {showNuance && c.nuance && <span className="ml-1.5 text-xs text-muted">{c.nuance}</span>}
              </span>
              <span className="shrink-0 tabular-nums text-ink-soft">
                <span className="font-semibold text-ink">{formatPercent(c[percentKey])}</span>
                <span className="ml-2 text-xs text-muted">{formatNumber(c.voix)} voix</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
              <div
                className={`h-full rounded-full ${i === 0 ? 'bg-accent' : 'bg-ink/25'}`}
                style={{ width: `${Math.max(2, ((c.voix || 0) / maxVotes) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ElectionResults;
