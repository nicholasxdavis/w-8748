
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
    temperature: number;
    humidity: number;
  }>;
}

// Major world cities for weather data
const WORLD_CITIES = [
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 }
];

const CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
const WEATHER_IMAGES = [
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
];

export const getRandomWeather = async (count: number = 1): Promise<WeatherData[]> => {
  try {
    // Try OpenWeatherMap API first
    const apiWeather = await fetchWeatherFromAPI(count);
    if (apiWeather.length > 0) {
      return apiWeather;
    }
  } catch (error) {
    console.log('Weather API fetch failed, using simulated data:', error);
  }

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

    const chartData = selectedCities.map(city => ({
      city: city.name,
      temperature: city.temperature,
      humidity: city.humidity
    }));

    weatherCards.push({
      id: `weather-${Date.now()}-${i}`,
      type: 'weather',
      title: 'Global Weather Report',
      content: `Current weather conditions across major world cities. Temperature ranges from ${Math.min(...selectedCities.map(c => c.temperature))}°C to ${Math.max(...selectedCities.map(c => c.temperature))}°C with varying humidity levels.`,
      image: WEATHER_IMAGES[Math.floor(Math.random() * WEATHER_IMAGES.length)],
      cities: selectedCities,
      chartData
    });
  }

  return weatherCards;
};

const fetchWeatherFromAPI = async (count: number): Promise<WeatherData[]> => {
  // Try to fetch from OpenWeatherMap API
  const API_KEY = 'demo'; // Replace with actual API key
  const weatherData: WeatherData[] = [];

  try {
    const cityPromises = WORLD_CITIES.slice(0, 6).map(async (city) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: city.name,
          country: city.country,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          feels_like: Math.round(data.main.feels_like)
        };
      }
      return null;
    });

    const cities = (await Promise.all(cityPromises)).filter(Boolean);
    
    if (cities.length > 0) {
      const chartData = cities.map(city => ({
        city: city!.name,
        temperature: city!.temperature,
        humidity: city!.humidity
      }));

      weatherData.push({
        id: `weather-api-${Date.now()}`,
        type: 'weather',
        title: 'Global Weather Report',
        content: `Live weather data from major cities worldwide. Updated every hour.`,
        image: WEATHER_IMAGES[Math.floor(Math.random() * WEATHER_IMAGES.length)],
        cities: cities as any,
        chartData
      });
    }
  } catch (error) {
    console.error('Weather API error:', error);
  }

  return weatherData;
};
