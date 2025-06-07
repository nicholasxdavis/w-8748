
export interface WeatherData {
  id: string;
  type: 'weather';
  title: string;
  content: string;
  image: string;
  cities: Array<{
    name: string;
    country: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    feels_like: number;
  }>;
  chartData: Array<{
    city: string;
    temp: number;
    humidity: number;
  }>;
}

// Major world cities for weather data
const WORLD_CITIES = [
  { name: 'New York', country: 'USA' },
  { name: 'London', country: 'UK' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Paris', country: 'France' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Mumbai', country: 'India' }
];

const CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
const WEATHER_IMAGES = [
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
];

export const getRandomWeather = async (count: number = 1): Promise<WeatherData[]> => {
  console.log('Generating weather data...');
  
  // Generate realistic weather data for multiple cities
  const weatherCards: WeatherData[] = [];
  
  for (let i = 0; i < count; i++) {
    const selectedCities = WORLD_CITIES.slice(0, 6).map(city => ({
      name: city.name,
      country: city.country,
      temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
      condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      feels_like: Math.floor(Math.random() * 30) + 5
    }));

    // Simplified chart data with clearer naming
    const chartData = selectedCities.map(city => ({
      city: city.name,
      temp: city.temperature,
      humidity: city.humidity
    }));

    const minTemp = Math.min(...selectedCities.map(c => c.temperature));
    const maxTemp = Math.max(...selectedCities.map(c => c.temperature));

    weatherCards.push({
      id: `weather-${Date.now()}-${i}`,
      type: 'weather',
      title: 'Global Weather Report',
      content: `Current weather conditions across major world cities. Today's temperatures range from ${minTemp}°C to ${maxTemp}°C. Most cities are experiencing ${selectedCities.filter(c => c.condition === 'Sunny').length > 0 ? 'clear' : 'mixed'} weather conditions.`,
      image: WEATHER_IMAGES[Math.floor(Math.random() * WEATHER_IMAGES.length)],
      cities: selectedCities,
      chartData
    });
  }

  console.log(`Generated ${weatherCards.length} weather cards`);
  return weatherCards;
};
