import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Debugging: Log API key to verify it's loaded (remove after testing)
console.log('Loaded WEATHER_API_KEY:', process.env.WEATHER_API_KEY);

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public tempF: number,
    public humidity: number,
    public windSpeed: number,
    public iconDescription: string,
    public icon:string,
    public date:string
  ) {}
}

// TODO: Complete the WeatherService class
class WeatherService {
  private baseURL = 'https://api.openweathermap.org/';
  private apiKey = process.env.WEATHER_API_KEY as string;

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    if (!this.apiKey) {
      console.error('API key is undefined. Please check your .env file.');
      throw new Error('API key is missing');
    }

    const response = await axios.get(
      `${this.baseURL}/geo/1.0/direct?q=${query}&appid=${this.apiKey}`
    );
    return response.data;
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await axios.get(this.buildWeatherQuery(coordinates));
    return response.data;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const currentData = response.list[0]; // Current weather data
    return new Weather(
      response.city.name,
      currentData.main.temp,
      currentData.main.humidity,
      currentData.wind.speed,
      currentData.weather[0].description,
      currentData.weather[0].icon,
      currentData.dt_txt.split(" ")[0]
    );
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(weatherData: any[]): Weather[] {
    return weatherData.slice(1, 6).map((data: any) => {
      return new Weather(
        data.dt_txt,
        data.main.temp,
        data.main.humidity,
        data.wind.speed,
        data.weather[0].description,
        data.weather[0].icon,
        data.dt_txt.split(" ")[0]
      );
    });
  }

  // TODO: Complete getWeatherForCity method
  public async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData.list);

    return { current: currentWeather, forecast };
  }
}

export default new WeatherService();


