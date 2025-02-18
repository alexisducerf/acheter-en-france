const getWeatherFromLastYear = async (lat, lng) => {
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Get current date and last year's date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 2);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&hourly=temperature_2m,rain`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Process the hourly data
    const processedData = processWeatherData(data.hourly);

    return processedData;
  }
  catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return null;
  }
};

const processWeatherData = (hourlyData) => {
  const monthlyData = {};

  hourlyData.time.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`; // Format: "2024-01"
    const temperature = hourlyData.temperature_2m[index];
    const rain = hourlyData.rain[index];

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        year,
        month,
        temperatures: [],
        rainfall: 0,
        monthDisplay: new Intl.DateTimeFormat('fr-FR', {
          month: 'long',
          year: 'numeric'
        }).format(date)
      };
    }

    monthlyData[monthKey].temperatures.push(temperature);
    monthlyData[monthKey].rainfall += rain;
  });

  // Calculate statistics for each month and sort by date
  return Object.values(monthlyData)
    .sort((a, b) => {
      // Trier d'abord par année
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      // Puis par mois
      return a.month - b.month;
    })
    .map(data => ({
      month: data.monthDisplay,
      averageTemp: parseFloat((data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length).toFixed(1)),
      minTemp: parseFloat(Math.min(...data.temperatures).toFixed(1)),
      maxTemp: parseFloat(Math.max(...data.temperatures).toFixed(1)),
      totalRainfall: parseFloat(data.rainfall.toFixed(1))
    }));
};

export { getWeatherFromLastYear };