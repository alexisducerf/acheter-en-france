// Add duration conversion helper
const convertDurationToMinutes = (duration) => {
  if (!duration) return 0;

  const match = duration.match(/(?:(\d+)h\s*)?(?:(\d+)min)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);

  return hours * 60 + minutes;
};

const formatDuration = (minutes) => {
  if (!minutes) return null;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}min`;
  }

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`;
};


export { convertDurationToMinutes, formatDuration };