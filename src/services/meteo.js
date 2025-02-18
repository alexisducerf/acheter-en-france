const getWeatherFromLastYear = async (lat, lng) => {
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Get current date and last year's date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

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
  // Group data by month
  const monthlyData = {};

  hourlyData.time.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    const month = date.getMonth();
    const temperature = hourlyData.temperature_2m[index];
    const rain = hourlyData.rain[index];

    if (!monthlyData[month]) {
      monthlyData[month] = {
        temperatures: [],
        rainfall: 0,
        month: new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date)
      };
    }

    monthlyData[month].temperatures.push(temperature);
    monthlyData[month].rainfall += rain;
  });

  // Calculate statistics for each month
  return Object.values(monthlyData).map(month => ({
    month: month.month,
    averageTemp: parseFloat((month.temperatures.reduce((a, b) => a + b, 0) / month.temperatures.length).toFixed(1)),
    minTemp: parseFloat(Math.min(...month.temperatures).toFixed(1)),
    maxTemp: parseFloat(Math.max(...month.temperatures).toFixed(1)),
    totalRainfall: parseFloat(month.rainfall.toFixed(1))
  }));
};

export { getWeatherFromLastYear };