import { Empty } from './ui';

const avg = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;
const fmt = (n, digits = 1) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: digits });

const WeatherSection = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return <Empty>Données climatiques indisponibles.</Empty>;
  }

  const temps = weatherData.map((m) => Number(m.averageTemp));
  const rain = weatherData.map((m) => Number(m.totalRainfall));
  const minAll = Math.min(...weatherData.map((m) => Number(m.minTemp)));
  const maxAll = Math.max(...weatherData.map((m) => Number(m.maxTemp)));
  const span = maxAll - minAll || 1;
  const maxRain = Math.max(...rain) || 1;
  const months = weatherData.length;
  const yearlyRain = (rain.reduce((s, v) => s + v, 0) / months) * 12;

  const summary = [
    ['Température moyenne', `${fmt(avg(temps))} °C`],
    ['Minimum relevé', `${fmt(minAll)} °C`],
    ['Maximum relevé', `${fmt(maxAll)} °C`],
    ['Pluie par an (moy.)', `${fmt(yearlyRain, 0)} mm`],
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        {summary.map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
            <dd className="mt-1 font-display text-xl font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mois</th>
              <th className="text-right">Moyenne</th>
              <th className="w-1/3">Min — Max</th>
              <th className="w-1/4">Précipitations</th>
            </tr>
          </thead>
          <tbody>
            {weatherData.map((month) => {
              const left = ((month.minTemp - minAll) / span) * 100;
              const width = ((month.maxTemp - month.minTemp) / span) * 100;
              return (
                <tr key={month.month}>
                  <td className="whitespace-nowrap font-medium capitalize text-ink">{month.month}</td>
                  <td className="whitespace-nowrap text-right tabular-nums">{fmt(month.averageTemp)} °C</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted">{fmt(month.minTemp)}°</span>
                      <div className="relative h-1.5 min-w-24 flex-1 rounded-full bg-paper">
                        <div
                          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-accent to-clay"
                          style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-xs tabular-nums text-muted">{fmt(month.maxTemp)}°</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 min-w-16 flex-1 rounded-full bg-paper">
                        <div className="h-full rounded-full bg-accent/60" style={{ width: `${(month.totalRainfall / maxRain) * 100}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs tabular-nums">{fmt(month.totalRainfall, 0)} mm</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeatherSection;
