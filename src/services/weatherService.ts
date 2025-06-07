
export interface WeatherData {
  id: string;
  type: 'weather';
  title: string;
  content: string;
  image: string;
  city: string;
  country: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feels_like: number;
  icon: string;
}

// Curated weather data for major cities
const CURATED_WEATHER: Omit<WeatherData, 'id'>[] = [
  {
    type: 'weather',
    title: 'New York City Weather',
    content: 'Current weather in New York City, USA. Partly cloudy skies with comfortable temperatures. Light winds from the west. Good visibility throughout the metropolitan area.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    city: 'New York',
    country: 'United States',
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    feels_like: 24,
    icon: 'partly-cloudy'
  },
  {
    type: 'weather',
    title: 'London Weather',
    content: 'Current weather in London, UK. Overcast conditions with light drizzle expected. Typical autumn weather with moderate temperatures and high humidity.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
    city: 'London',
    country: 'United Kingdom',
    temperature: 15,
    condition: 'Overcast',
    humidity: 78,
    windSpeed: 8,
    feels_like: 13,
    icon: 'cloudy'
  },
  {
    type: 'weather',
    title: 'Tokyo Weather',
    content: 'Current weather in Tokyo, Japan. Clear skies with pleasant temperatures. Low humidity and gentle breeze. Perfect weather for outdoor activities.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    city: 'Tokyo',
    country: 'Japan',
    temperature: 26,
    condition: 'Clear',
    humidity: 55,
    windSpeed: 6,
    feels_like: 27,
    icon: 'sunny'
  },
  {
    type: 'weather',
    title: 'Sydney Weather',
    content: 'Current weather in Sydney, Australia. Sunny conditions with warm temperatures. Light sea breeze from the east. Excellent beach weather across the harbor city.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    city: 'Sydney',
    country: 'Australia',
    temperature: 28,
    condition: 'Sunny',
    humidity: 62,
    windSpeed: 14,
    feels_like: 30,
    icon: 'sunny'
  }
];

export const getRandomWeather = async (count: number = 1): Promise<WeatherData[]> => {
  try {
    // Try to fetch from weather API first
    const apiWeather = await fetchWeatherFromAPI(count);
    if (apiWeather.length > 0) {
      return apiWeather;
    }
  } catch (error) {
    console.log('Weather API fetch failed, using curated weather:', error);
  }

  // Fallback to curated weather
  const shuffled = [...CURATED_WEATHER].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((weather, index) => ({
    ...weather,
    id: `weather-${Date.now()}-${index}`
  }));
};

const fetchWeatherFromAPI = async (count: number): Promise<WeatherData[]> => {
  // This is a placeholder for API integration
  // You can integrate with OpenWeatherMap, WeatherAPI, AccuWeather, etc.
  // Example: https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY
  throw new Error('Weather API not configured');
};
