// City rating: turns the search result atoms into a score out of 100.
// Each category returns a sub-score from 0 to 100 (or null when its data is missing);
// the overall score is the weighted average of the available categories, reweighted.
// Every threshold lives in CONFIG so the rating can be tuned in one place.

import { convertDurationToMinutes } from './helpers';

export const CONFIG = {
  // Weights of each category in the overall score (sum = 100).
  weights: {
    risks: 25,
    amenities: 20,
    travel: 15,
    politics: 15,
    insee: 10,
    water: 10,
    climate: 5,
  },

  risks: {
    seismicPenalty: { 1: 0, 2: 5, 3: 15, 4: 30, 5: 50 },
    soilPenaltyPerSite: 10,
    // CASIAS lists every former industrial site within 10 km, so cities have dozens:
    // without a cap any town would score 0.
    soilPenaltyMax: 30,
    gasparPenaltyPerRisk: 8,
  },

  water: {
    recentPenalty: 20, // any non-compliant sample in the last 12 months
  },

  // Target count of each amenity within the search radius: reaching it gives 100.
  amenities: {
    health: {
      'Médecins généralistes': 5,
      Pharmacies: 2,
      Dentistes: 2,
      'Hôpitaux et cliniques': 1,
    },
    stores: {
      bakery: 2,
      supermarket: 1,
      convenience: 1,
      butcher: 1,
    },
    schools: {
      primaire: 2, // maternelle and primaire count together
      'collège': 1,
      'lycée': 1,
    },
  },

  travel: { bestMinutes: 15, worstMinutes: 90 },

  politics: {
    // Weight of each election in the political sub-score.
    elections: { legislatives2024: 60, presidential2022: 25, legislatives2022: 15 },
    // Rating of each political nuance (Ministry of the Interior codes). Unlisted nuances
    // (REG, DIV…) are ignored and the shares of the rated ones are rescaled.
    nuances: {
      EXG: 100, COM: 100, FI: 100, SOC: 100, RDG: 100, VEC: 100, DVG: 100, NUP: 100, UG: 100,
      ECO: 90,
      ENS: 55, REN: 55, MDM: 55, HOR: 55, DVC: 55, UDI: 55,
      LR: 35, DVD: 35,
      DSV: 15,
      RN: 0, UXD: 0, REC: 0, EXD: 0, DXD: 0,
    },
    // Presidential 2022 candidates have no nuance in the data: map them by name.
    presidentialCandidates: {
      ARTHAUD: 'EXG', POUTOU: 'EXG', ROUSSEL: 'COM', MELENCHON: 'FI', HIDALGO: 'SOC',
      JADOT: 'ECO', MACRON: 'ENS', 'PÉCRESSE': 'LR', 'DUPONT-AIGNAN': 'DSV',
      'LE PEN': 'RN', ZEMMOUR: 'REC',
      // LASSALLE is left out (DIV)
    },
  },

  insee: {
    populationTrend: { best: 1, worst: -1 }, // annual change in %
    unemployment: { best: 5, worst: 15 }, // %
    medianIncome: { best: 28000, worst: 18000 }, // € per consumption unit
    poverty: { best: 8, worst: 25 }, // %
    vacancy: { best: 5, worst: 14 }, // % of vacant homes
  },

  climate: {
    summerMean: { min: 18, max: 22, penaltyPerDegree: 10 }, // Jun–Aug mean ≈ 26°C average max
    winterMean: { min: 5, penaltyPerDegree: 15 }, // Dec–Feb mean
    yearlyRain: { best: 700, worst: 1300 }, // mm
    heatwaveThreshold: 35, heatwavePenaltyPerMonth: 15,
    frostThreshold: -5, frostPenaltyPerMonth: 10,
  },
};

export const CATEGORY_LABELS = {
  risks: 'Risques',
  amenities: 'Équipements',
  travel: 'Trajets',
  politics: 'Politique',
  insee: 'Socio-économie',
  water: 'Eau potable',
  climate: 'Climat',
};

// ---------- helpers ----------

const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n));

// Linear score: `best` → 100, `worst` → 0 (works whether lower or higher is better).
const linear = (value, best, worst) => clamp(((value - worst) / (best - worst)) * 100);

const average = (values) => {
  const valid = values.filter((v) => v !== null && Number.isFinite(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
};

const weightedAverage = (entries) => {
  const valid = entries.filter(([score, weight]) => score !== null && Number.isFinite(score) && weight > 0);
  const totalWeight = valid.reduce((sum, [, w]) => sum + w, 0);
  return totalWeight ? valid.reduce((sum, [s, w]) => sum + s * w, 0) / totalWeight : null;
};

// French number from INSEE / spreadsheets: "1 234,5" → 1234.5
const parseFrenchNumber = (value) => {
  if (typeof value === 'number') return value;
  const n = parseFloat(String(value ?? '').replace(/[\s  ]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const round = (n) => Math.round(n);
const pct = (n) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

// ---------- categories ----------
// Each returns { score, details: string[] } or null when there is no data.

const scoreRisks = ({ sismicRisks, soilPollution, geoGasparRisks }) => {
  const { seismicPenalty, soilPenaltyPerSite, soilPenaltyMax, gasparPenaltyPerRisk } = CONFIG.risks;
  const zone = parseInt(String(sismicRisks ?? '').match(/\d/)?.[0], 10);
  if (!zone && soilPollution == null && geoGasparRisks == null) return null;

  const details = [];
  let score = 100;

  if (zone) {
    const penalty = seismicPenalty[zone] ?? 0;
    score -= penalty;
    details.push(`Sismicité zone ${zone} : −${penalty}`);
  }

  const sites = soilPollution?.number ?? 0;
  const soilPenalty = Math.min(sites * soilPenaltyPerSite, soilPenaltyMax);
  score -= soilPenalty;
  details.push(`${sites} site${sites > 1 ? 's' : ''} pollué${sites > 1 ? 's' : ''} : −${soilPenalty}`);

  const risks = Array.isArray(geoGasparRisks) ? geoGasparRisks.length : 0;
  score -= risks * gasparPenaltyPerRisk;
  details.push(`${risks} risque${risks > 1 ? 's' : ''} GASPAR : −${risks * gasparPenaltyPerRisk}`);

  return { score: clamp(score), details };
};

const parseFrenchDate = (str) => {
  const [d, m, y] = String(str ?? '').split('/').map(Number);
  return y ? new Date(y, m - 1, d) : null;
};

const isNonCompliant = (status = '') => /non[\s-]?conforme/i.test(status);

const scoreWater = ({ waterData }) => {
  const results = (waterData?.results || []).filter((r) => r.status);
  if (!results.length) return null;

  // Each row is one parameter of a sample; group them by sample date.
  const samples = new Map(); // date → non-compliant?
  results.forEach((r) => samples.set(r.date, samples.get(r.date) || isNonCompliant(r.status)));

  const total = samples.size;
  const bad = [...samples.values()].filter(Boolean).length;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentBad = [...samples.entries()].some(([date, nc]) => nc && parseFrenchDate(date) >= oneYearAgo);

  const rate = ((total - bad) / total) * 100;
  const details = [`${total - bad}/${total} prélèvements conformes (${pct(rate)})`];
  if (recentBad) details.push(`Non-conformité dans les 12 derniers mois : −${CONFIG.water.recentPenalty}`);

  return { score: clamp(rate - (recentBad ? CONFIG.water.recentPenalty : 0)), details };
};

const countScore = (items, key, targets, normalize = (v) => v) => {
  const details = [];
  const scores = Object.entries(targets).map(([type, target]) => {
    const count = items.filter((item) => normalize(item[key]) === type).length;
    details.push(`${type} : ${count}/${target}`);
    return clamp((count / target) * 100);
  });
  return { score: average(scores), details };
};

const STORE_LABELS = { bakery: 'Boulangeries', supermarket: 'Supermarchés', convenience: 'Supérettes', butcher: 'Boucheries' };

const scoreAmenities = ({ healthAmenities, stores, educationAmenities }) => {
  const { health, stores: storeTargets, schools } = CONFIG.amenities;
  const parts = [];
  const details = [];

  if (Array.isArray(healthAmenities)) {
    const r = countScore(healthAmenities, 'category', health);
    parts.push(r.score);
    details.push(`Santé ${round(r.score)}/100 (${r.details.join(', ')})`);
  }
  if (Array.isArray(stores)) {
    const r = countScore(stores, 'category', storeTargets);
    parts.push(r.score);
    const readable = r.details.map((d) => d.replace(/^(\w+)/, (k) => STORE_LABELS[k] || k));
    details.push(`Commerces ${round(r.score)}/100 (${readable.join(', ')})`);
  }
  if (Array.isArray(educationAmenities)) {
    const r = countScore(educationAmenities, 'schoolType', schools, (t) => (t === 'maternelle' ? 'primaire' : t));
    parts.push(r.score);
    details.push(`Écoles ${round(r.score)}/100 (${r.details.join(', ')})`);
  }

  const score = average(parts);
  return score === null ? null : { score, details };
};

const scoreTravel = ({ durationPerDestination }) => {
  const destinations = (durationPerDestination || []).filter(Boolean);
  if (!destinations.length) return null;

  const { bestMinutes, worstMinutes } = CONFIG.travel;
  const details = [];
  const scores = destinations.map((dest) => {
    const minutes = convertDurationToMinutes(dest.duration);
    const s = linear(minutes, bestMinutes, worstMinutes);
    details.push(`${dest.city} : ${dest.duration} → ${round(s)}`);
    return s;
  });
  return { score: average(scores), details };
};

// Share-weighted rating of the candidates of one election, or null.
const electionScore = (candidates, nuanceOf) => {
  const { nuances } = CONFIG.politics;
  let votes = 0;
  let weighted = 0;
  candidates.forEach((c) => {
    const rating = nuances[nuanceOf(c)];
    const v = Number(c.voix) || 0;
    if (rating === undefined || !v) return;
    votes += v;
    weighted += v * rating;
  });
  return votes ? weighted / votes : null;
};

// Vote share of the far right (rating 0), for the details line.
const farRightShare = (candidates, nuanceOf) => {
  const { nuances } = CONFIG.politics;
  const total = candidates.reduce((s, c) => s + (Number(c.voix) || 0), 0);
  const far = candidates.filter((c) => nuances[nuanceOf(c)] === 0).reduce((s, c) => s + (Number(c.voix) || 0), 0);
  return total ? (far / total) * 100 : null;
};

const scorePolitics = ({ legislativesElectionResults2024, presidentElectionResults, legislativesElectionResults }) => {
  const { elections, presidentialCandidates } = CONFIG.politics;
  const byNuance = (c) => String(c.nuance ?? '').trim().toUpperCase();
  const byName = (c) => presidentialCandidates[String(c.nom ?? '').trim().toUpperCase()];

  const list = [
    ['Législatives 2024', legislativesElectionResults2024, byNuance, elections.legislatives2024],
    ['Présidentielle 2022', presidentElectionResults, byName, elections.presidential2022],
    ['Législatives 2022', legislativesElectionResults, byNuance, elections.legislatives2022],
  ];

  const details = [];
  const entries = list.map(([label, data, nuanceOf, weight]) => {
    const candidates = data?.candidats || [];
    const s = candidates.length ? electionScore(candidates, nuanceOf) : null;
    if (s !== null) {
      const far = farRightShare(candidates, nuanceOf);
      details.push(`${label} : ${round(s)}/100${far !== null ? ` (extrême droite ${pct(far)})` : ''}`);
    }
    return [s, weight];
  });

  const score = weightedAverage(entries);
  return score === null ? null : { score, details };
};

// Last numeric value of the first INSEE row whose label matches, in any table.
const findInseeValue = (insee, labelPattern) => {
  for (const rows of Object.values(insee)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!labelPattern.test(row[0] ?? '')) continue;
      const values = row.slice(1).map(parseFrenchNumber).filter((n) => n !== null);
      if (values.length) return values[values.length - 1];
    }
  }
  return null;
};

// Share of vacant homes. The "Logements vacants" row appears both as counts (LOG T1)
// and as counts + % columns (LOG T2), so divide by the "Ensemble" row of the same table:
// when Ensemble's last value is 100, the last values are already percentages.
const findVacancyRate = (insee) => {
  const last = (row) => row.slice(1).map(parseFrenchNumber).filter((n) => n !== null).pop() ?? null;
  for (const rows of Object.values(insee)) {
    if (!Array.isArray(rows)) continue;
    const vacant = rows.find((r) => /^logements vacants/i.test(r[0] ?? ''));
    const all = rows.find((r) => /^ensemble$/i.test(r[0] ?? ''));
    if (!vacant || !all) continue;
    const v = last(vacant);
    const e = last(all);
    if (v === null || !e) continue;
    return e === 100 ? v : (v / e) * 100;
  }
  return null;
};

const scoreInsee = ({ inseeData }) => {
  if (!inseeData || typeof inseeData !== 'object' || inseeData.error) return null;
  const t = CONFIG.insee;
  const details = [];

  const trend = findInseeValue(inseeData, /variation annuelle moyenne de la population/i);
  const unemployment = findInseeValue(inseeData, /^taux de chômage/i);
  const income = findInseeValue(inseeData, /médiane du revenu disponible/i);
  const poverty = findInseeValue(inseeData, /^taux de pauvreté/i);
  const vacancy = findVacancyRate(inseeData);

  const trendScore = trend !== null ? linear(trend, t.populationTrend.best, t.populationTrend.worst) : null;
  if (trend !== null) details.push(`Évolution de la population : ${trend > 0 ? '+' : ''}${pct(trend)}/an`);

  const unemploymentScore = unemployment !== null ? linear(unemployment, t.unemployment.best, t.unemployment.worst) : null;
  if (unemployment !== null) details.push(`Chômage : ${pct(unemployment)}`);

  const incomeScore = average([
    income !== null ? linear(income, t.medianIncome.best, t.medianIncome.worst) : null,
    poverty !== null ? linear(poverty, t.poverty.best, t.poverty.worst) : null,
  ]);
  if (income !== null) details.push(`Revenu médian : ${income.toLocaleString('fr-FR')} €`);
  if (poverty !== null) details.push(`Taux de pauvreté : ${pct(poverty)}`);

  const vacancyScore = vacancy !== null ? linear(vacancy, t.vacancy.best, t.vacancy.worst) : null;
  if (vacancy !== null) details.push(`Logements vacants : ${pct(vacancy)}`);

  const score = average([trendScore, unemploymentScore, incomeScore, vacancyScore]);
  return score === null ? null : { score, details };
};

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const monthIndex = (label) => MONTHS.indexOf(String(label ?? '').split(' ')[0].toLowerCase());

const scoreClimate = ({ weatherData }) => {
  const months = (weatherData || []).filter((m) => monthIndex(m.month) >= 0);
  if (months.length < 12) return null;
  const c = CONFIG.climate;
  const details = [];

  const summer = average(months.filter((m) => [5, 6, 7].includes(monthIndex(m.month))).map((m) => m.averageTemp));
  const winter = average(months.filter((m) => [11, 0, 1].includes(monthIndex(m.month))).map((m) => m.averageTemp));
  const yearlyRain = (months.reduce((s, m) => s + (m.totalRainfall || 0), 0) / months.length) * 12;
  const heatwaves = months.filter((m) => m.maxTemp > c.heatwaveThreshold).length;
  const frosts = months.filter((m) => m.minTemp < c.frostThreshold).length;

  let summerScore = null;
  if (summer !== null) {
    const gap = summer < c.summerMean.min ? c.summerMean.min - summer : Math.max(0, summer - c.summerMean.max);
    summerScore = clamp(100 - gap * c.summerMean.penaltyPerDegree);
    details.push(`Été : ${summer.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} °C en moyenne`);
  }
  let winterScore = null;
  if (winter !== null) {
    winterScore = clamp(100 - Math.max(0, c.winterMean.min - winter) * c.winterMean.penaltyPerDegree);
    details.push(`Hiver : ${winter.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} °C en moyenne`);
  }
  const rainScore = linear(yearlyRain, c.yearlyRain.best, c.yearlyRain.worst);
  details.push(`Pluie : ${round(yearlyRain)} mm/an`);
  const extremesScore = clamp(100 - heatwaves * c.heatwavePenaltyPerMonth - frosts * c.frostPenaltyPerMonth);
  details.push(`Mois > ${c.heatwaveThreshold} °C : ${heatwaves}, mois < ${c.frostThreshold} °C : ${frosts}`);

  return { score: average([summerScore, winterScore, rainScore, extremesScore]), details };
};

const SCORERS = {
  risks: scoreRisks,
  amenities: scoreAmenities,
  travel: scoreTravel,
  politics: scorePolitics,
  insee: scoreInsee,
  water: scoreWater,
  climate: scoreClimate,
};

/**
 * @param data values of the result atoms, keyed by atom name
 * @returns {{ score: number|null, categories: Array<{ key, label, weight, score, details }> }}
 */
export const computeRating = (data) => {
  const categories = Object.entries(SCORERS).map(([key, scorer]) => {
    let result = null;
    try {
      result = scorer(data);
    } catch (error) {
      console.error(`Rating: could not score ${key}`, error);
    }
    return {
      key,
      label: CATEGORY_LABELS[key],
      weight: CONFIG.weights[key],
      score: result?.score ?? null,
      details: result?.details ?? [],
    };
  });

  const score = weightedAverage(categories.map((c) => [c.score, c.weight]));
  return { score: score === null ? null : Math.round(score), categories };
};
