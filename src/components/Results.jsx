import { useEffect, useState } from 'react';
import { STORES_RADIUS_KM } from '../services/stores';
import { useStore } from '@nanostores/react';
import {
  isLoaded, isLoading, hasErrors, durationPerDestination, geoGasparRisks, sismicRisks, soilPollution,
  legislativesElectionResults, presidentElectionResults, legislativesElectionResults2024, inseeData,
  healthAmenities, stores, associations, educationAmenities, weatherData, serviceErrors, waterData,
  searchedLocation, savedSearchDate
} from '../stores/search';
import { runSearch } from '../utils/runSearch';
import ProgressBar from './ProgressBar';
import AmenityCard from './AmenityCard';
import StoresSection from './StoresSection';
import SchoolsSection from './SchoolsSection';
import AssociationsSection from './AssociationsSection';
import WeatherSection from './WeatherSection';
import ElectionResults from './ElectionResults';
import ScoreCard from './ScoreCard';
import { computeRating } from '../utils/rating';
import { Section, Badge, Count, Loadable, Empty, ErrorNote, Spinner, SubHeading, formatNumber } from './ui';

const SECTIONS = [
  { id: 'trajets', label: 'Trajets' },
  { id: 'risques', label: 'Risques' },
  { id: 'eau', label: 'Eau potable' },
  { id: 'sante', label: 'Santé' },
  { id: 'commerces', label: 'Commerces' },
  { id: 'ecoles', label: 'Écoles' },
  { id: 'associations', label: 'Associations' },
  { id: 'elections', label: 'Élections' },
  { id: 'insee', label: 'INSEE' },
  { id: 'climat', label: 'Climat' },
];

const isNonCompliant = (status = '') => /non[\s-]?conforme/i.test(status);

// Seismic zones go from 1 (very low) to 5 (strong)
const seismicTone = (zone) => {
  const level = parseInt(String(zone ?? '').match(/\d/)?.[0], 10);
  if (!level) return 'neutral';
  if (level <= 2) return 'good';
  if (level === 3) return 'warn';
  return 'bad';
};

const KeyFigure = ({ label, value, hint, tone = 'neutral', href, loading }) => {
  const toneClass = {
    neutral: 'text-ink',
    good: 'text-sage',
    warn: 'text-amber',
    bad: 'text-clay',
  }[tone];

  return (
    <a href={href} className="group block bg-surface px-5 py-4 transition hover:bg-paper/60">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-medium tabular-nums ${toneClass}`}>
        {loading ? <Spinner className="h-5 w-5" /> : value}
      </p>
      {hint && !loading && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
    </a>
  );
};

const TableOfContents = ({ active }) => (
  <nav aria-label="Sections" className="sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto lg:block">
    <p className="eyebrow mb-3 px-3">Sommaire</p>
    <ol className="space-y-0.5">
      {SECTIONS.map((section, i) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              active === section.id ? 'bg-surface font-medium text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <span className={`text-xs tabular-nums ${active === section.id ? 'text-accent' : 'text-muted'}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {section.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

const useActiveSection = (enabled) => {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [enabled]);

  return active;
};

const Results = () => {
  const $isLoading = useStore(isLoading);
  const $isLoaded = useStore(isLoaded);
  const $hasErrors = useStore(hasErrors);
  const $location = useStore(searchedLocation);
  const $durations = useStore(durationPerDestination);
  const $gaspar = useStore(geoGasparRisks);
  const $seismic = useStore(sismicRisks);
  const $soil = useStore(soilPollution);
  const $legislatives2022 = useStore(legislativesElectionResults);
  const $presidential2022 = useStore(presidentElectionResults);
  const $legislatives2024 = useStore(legislativesElectionResults2024);
  const $insee = useStore(inseeData);
  const $health = useStore(healthAmenities);
  const $stores = useStore(stores);
  const $associations = useStore(associations);
  const $schools = useStore(educationAmenities);
  const $weather = useStore(weatherData);
  const $water = useStore(waterData);
  const $errors = useStore(serviceErrors);
  const $savedAt = useStore(savedSearchDate);

  const hasSearchStarted = $isLoading || $isLoaded || $hasErrors;
  const active = useActiveSection(hasSearchStarted && !$hasErrors);

  if (!hasSearchStarted) return null;

  const loading = $isLoading;
  const durations = ($durations || []).filter(Boolean);
  const soilSites = $soil?.elements ? $soil.elements.split('\n').filter(Boolean) : [];
  const gasparRisks = Array.isArray($gaspar) ? $gaspar : [];
  const waterResults = $water?.results || [];
  const waterIssues = waterResults.filter((r) => isNonCompliant(r.status)).length;
  const waterStatuses = Object.entries(
    waterResults.reduce((acc, r) => {
      if (r.status) acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const rating = loading
    ? null
    : computeRating({
        sismicRisks: $seismic,
        soilPollution: $soil,
        geoGasparRisks: $gaspar,
        waterData: $water,
        healthAmenities: $health,
        stores: $stores,
        educationAmenities: $schools,
        durationPerDestination: $durations,
        legislativesElectionResults2024: $legislatives2024,
        presidentElectionResults: $presidential2022,
        legislativesElectionResults: $legislatives2022,
        inseeData: $insee,
        weatherData: $weather,
      });

  const keyFigures = [
    { label: 'Sismicité', value: $seismic || '—', hint: 'Zone de 1 à 5', tone: seismicTone($seismic), href: '#risques' },
    { label: 'Risques recensés', value: gasparRisks.length, hint: 'Base GASPAR', tone: gasparRisks.length > 3 ? 'warn' : 'neutral', href: '#risques' },
    { label: 'Sites pollués', value: $soil?.number ?? 0, hint: 'Rayon de 10 km', tone: ($soil?.number ?? 0) > 0 ? 'warn' : 'good', href: '#risques' },
    {
      label: 'Eau potable',
      value: waterResults.length ? (waterIssues ? `${waterIssues} alerte${waterIssues > 1 ? 's' : ''}` : 'Conforme') : '—',
      hint: `${waterResults.length} analyses`,
      tone: waterResults.length ? (waterIssues ? 'bad' : 'good') : 'neutral',
      href: '#eau'
    },
    { label: 'Santé', value: $health?.length ?? 0, hint: 'Équipements', href: '#sante' },
    { label: 'Commerces', value: $stores?.length ?? 0, hint: `Rayon de ${STORES_RADIUS_KM} km`, href: '#commerces' },
    { label: 'Écoles', value: $schools?.length ?? 0, hint: 'Rayon de 5 km', href: '#ecoles' },
    { label: 'Associations', value: formatNumber($associations?.total ?? 0), hint: 'Déclarées', href: '#associations' },
  ];

  return (
    <>
      {loading && <ProgressBar />}

      <div id="search-results" className="scroll-mt-20 border-t border-line pt-12">
        {/* Location header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2">
              {loading ? <><Spinner className="h-3 w-3" /> Analyse en cours</> : 'Rapport de commune'}
            </p>
            <h2 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              {$location?.city ? $location.city.toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase()) : 'Recherche'}
            </h2>
            {$location && (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted tabular-nums">
                <span>Code postal <strong className="font-medium text-ink-soft">{$location.postalCode}</strong></span>
                <span>INSEE <strong className="font-medium text-ink-soft">{$location.codeInsee}</strong></span>
                <span>{$location.lat.toFixed(4)}, {$location.lng.toFixed(4)}</span>
              </p>
            )}
            {$savedAt && $location && (
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
                Résultats enregistrés le{' '}
                {new Date($savedAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                <button
                  type="button"
                  className="font-medium text-accent hover:underline"
                  onClick={() => runSearch({ postalCode: $location.postalCode, city: $location.city })}
                >
                  Actualiser
                </button>
              </p>
            )}
          </div>
          {$location && (
            <div className="flex gap-2">
              <a
                className="btn-secondary h-10"
                href={`https://www.openstreetmap.org/?mlat=${$location.lat}&mlon=${$location.lng}#map=13/${$location.lat}/${$location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir sur la carte ↗
              </a>
              <a className="btn-secondary h-10" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Nouvelle recherche
              </a>
            </div>
          )}
        </header>

        {$hasErrors && (
          <div className="mt-8">
            <ErrorNote>
              La recherche n'a pas abouti. Vérifiez le code postal et la commune, puis réessayez.
            </ErrorNote>
          </div>
        )}

        {!$hasErrors && (
          <>
            <ScoreCard rating={rating} loading={loading} />

            {/* Key figures */}
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {keyFigures.map((figure) => (
                <KeyFigure key={figure.label} {...figure} loading={loading} />
              ))}
            </div>

            {/* Mobile section chips */}
            <nav className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" aria-label="Sections">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft">
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
              <TableOfContents active={active} />

              <div className="min-w-0 space-y-6">
                <Section id="trajets" index={1} title="Trajets" description="Temps de trajet en voiture vers vos destinations favorites.">
                  <Loadable
                    loading={loading}
                    empty={durations.length === 0}
                    emptyText="Ajoutez des destinations favorites pour calculer les temps de trajet."
                  >
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {durations.map((dest, i) => (
                        <li key={i} className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{dest.city}</p>
                            <p className="text-xs text-muted tabular-nums">{dest.postalCode} · {dest.distance} km</p>
                          </div>
                          <p className="shrink-0 font-display text-xl font-medium tabular-nums">{dest.duration}</p>
                        </li>
                      ))}
                    </ul>
                  </Loadable>
                </Section>

                <Section id="risques" index={2} title="Risques" description="Risques naturels et technologiques, sismicité et pollution des sols (Géorisques).">
                  <Loadable loading={loading}>
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-ink-soft">Zone de sismicité</span>
                        <Badge tone={seismicTone($seismic)}>{$seismic || 'Non renseignée'}</Badge>
                      </div>

                      <div>
                        <SubHeading count={gasparRisks.length}>Risques recensés</SubHeading>
                        {gasparRisks.length ? (
                          <div className="flex flex-wrap gap-2">
                            {gasparRisks.map((risk) => <Badge key={risk} tone="warn">{risk}</Badge>)}
                          </div>
                        ) : <Empty>Aucun risque recensé.</Empty>}
                      </div>

                      <div>
                        <SubHeading count={$soil?.number ?? 0}>Sites et sols potentiellement pollués</SubHeading>
                        {soilSites.length ? (
                          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line text-sm">
                            {soilSites.map((site, i) => {
                              const [status, ...rest] = site.split(' - ');
                              return (
                                <li key={i} className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                  <span className="text-ink-soft">{rest.join(' — ')}</span>
                                  <span className="shrink-0 text-xs text-muted">{status}</span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : <Empty>Aucun site pollué recensé dans un rayon de 10 km.</Empty>}
                      </div>
                    </div>
                  </Loadable>
                </Section>

                <Section
                  id="eau"
                  index={3}
                  title="Eau potable"
                  description="Les 100 dernières analyses du contrôle sanitaire (Hub'Eau)."
                  aside={$water?.total ? <Count>{formatNumber($water.total)} analyses au total</Count> : null}
                >
                  <Loadable loading={loading} empty={waterResults.length === 0}>
                    <div className="space-y-5">
                      <ul className="space-y-2">
                        {waterStatuses.map(([status, count]) => (
                          <li
                            key={status}
                            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                              isNonCompliant(status) ? 'border-clay/20 bg-clay-soft text-clay' : 'border-sage/20 bg-sage-soft text-sage'
                            }`}
                          >
                            <span className="font-semibold tabular-nums">{count}×</span>
                            <span>{status}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="max-h-[28rem] overflow-auto rounded-xl border border-line">
                        <table className="data-table">
                          <thead className="sticky top-0 bg-surface">
                            <tr><th>Paramètre</th><th className="text-right">Valeur</th><th>Limite</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                            {waterResults.map((r, i) => (
                              <tr key={i}>
                                <td className="font-medium text-ink">{r.parameter}</td>
                                <td className="whitespace-nowrap text-right tabular-nums">{r.value ?? '—'} <span className="text-muted">{r.unit}</span></td>
                                <td className="text-xs text-muted">{r.limit || '—'}</td>
                                <td className="whitespace-nowrap tabular-nums text-muted">{r.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Loadable>
                </Section>

                <Section
                  id="sante"
                  index={4}
                  title="Santé"
                  description="Hôpitaux, médecins, pharmacies et autres professionnels de santé (répertoire SIRENE)."
                  aside={$health?.length ? <Count>{$health.length}</Count> : null}
                >
                  <Loadable loading={loading} error={$errors.health} empty={!$health?.length}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {($health || []).map((amenity, i) => <AmenityCard key={i} amenity={amenity} />)}
                    </div>
                  </Loadable>
                </Section>

                <Section
                  id="commerces"
                  index={5}
                  title="Commerces"
                  description={`Commerces, restaurants et services dans un rayon de ${STORES_RADIUS_KM} km (répertoire SIRENE).`}
                  aside={$stores?.length ? <Count>{$stores.length}</Count> : null}
                >
                  <Loadable loading={loading} empty={!$stores}>
                    {$stores && <StoresSection stores={$stores} />}
                  </Loadable>
                </Section>

                <Section
                  id="ecoles"
                  index={6}
                  title="Établissements scolaires"
                  description="De la maternelle au lycée, dans un rayon de 5 km (Annuaire de l'éducation)."
                  aside={$schools?.length ? <Count>{$schools.length}</Count> : null}
                >
                  <Loadable loading={loading} empty={!$schools}>
                    {$schools && <SchoolsSection schools={$schools} />}
                  </Loadable>
                </Section>

                <Section id="associations" index={7} title="Associations" description="Répertoire national des associations.">
                  <Loadable loading={loading} empty={!$associations}>
                    {$associations && <AssociationsSection associations={$associations.associations} total={$associations.total} />}
                  </Loadable>
                </Section>

                <Section id="elections" index={8} title="Élections" description="Résultats dans la commune.">
                  <Loadable loading={loading} empty={!$presidential2022 && !$legislatives2022 && !$legislatives2024}>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {$presidential2022 && (
                        <ElectionResults title="Présidentielle 2022" data={$presidential2022} percentKey="pourcentage" />
                      )}
                      {$legislatives2024 && (
                        <ElectionResults title="Législatives 2024" data={$legislatives2024} percentKey="pourcentage_voix_exprimes" showNuance />
                      )}
                      {$legislatives2022 && (
                        <ElectionResults title="Législatives 2022" data={$legislatives2022} percentKey="pourcentage_voix_exprimes" showNuance />
                      )}
                    </div>
                  </Loadable>
                </Section>

                <Section id="insee" index={9} title="Données INSEE" description="Dossier complet de la commune, publié par l'INSEE.">
                  <Loadable loading={loading} empty={!$insee || Object.keys($insee).length === 0}>
                    <div className="space-y-2">
                      {Object.entries($insee || {}).map(([tableName, rows], index) => (
                        <details key={tableName} open={index === 0} className="group overflow-hidden rounded-xl border border-line">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-sm font-medium transition hover:bg-paper/60">
                            {tableName}
                            <svg className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </summary>
                          <div className="overflow-x-auto border-t border-line">
                            <table className="data-table">
                              <tbody>
                                {rows.map((row, rowIndex) => (
                                  <tr key={rowIndex} className={rowIndex === 0 ? 'bg-paper/60' : ''}>
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className={`whitespace-nowrap ${
                                          cellIndex === 0 ? 'font-medium text-ink' : 'text-right tabular-nums'
                                        } ${rowIndex === 0 ? 'text-xs font-semibold text-muted' : ''}`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      ))}
                    </div>
                  </Loadable>
                </Section>

                <Section id="climat" index={10} title="Climat" description="Températures et précipitations mensuelles sur les 24 derniers mois (Open-Meteo).">
                  <Loadable loading={loading}>
                    <WeatherSection weatherData={$weather} />
                  </Loadable>
                </Section>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Results;
