export async function getCityWeather(city: string, state?: string, country?: string) {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!API_KEY) {
      return { temp: 32, condition: 'Hot', description: 'Sunny day' };
    }

    // Build specific query: {city name},{state code},{country code}
    const query = [city, state, country].filter(Boolean).join(',');

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    
    if (data.cod !== 200) {
      // Fallback to just city if specific query fails
      const fallbackRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const fallbackData = await fallbackRes.json();
      if (fallbackData.cod !== 200) return { temp: 25, condition: 'Clear', description: 'Nice weather' };
      
      return {
        temp: Math.round(fallbackData.main.temp),
        condition: fallbackData.weather[0].main,
        description: fallbackData.weather[0].description
      };
    }
    
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { temp: 25, condition: 'Clear', description: 'Nice weather' };
  }
}
