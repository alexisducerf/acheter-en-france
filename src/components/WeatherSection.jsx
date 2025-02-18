const WeatherSection = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Climat sur les 12 derniers mois</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Température moyenne</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min / Max</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Précipitations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weatherData.map((month, index) => (
              <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {month.averageTemp}°C
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {month.minTemp}°C / {month.maxTemp}°C
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {month.totalRainfall} mm
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeatherSection;