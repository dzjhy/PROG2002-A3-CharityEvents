
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, throwError } from 'rxjs';

/**
 * Weather information displayed on the event detail page.
 */
export interface WeatherInfo {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  observationTime: string;
}

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
  }[];
}

interface ForecastResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private http = inject(HttpClient);

  private geocodingUrl =
    'https://geocoding-api.open-meteo.com/v1/search';

  private forecastUrl =
    'https://api.open-meteo.com/v1/forecast';

  /**
   * Finds a city and retrieves its current weather.
   * @param city - City where the charity event is held.
   */
  getWeatherByCity(city: string): Observable<WeatherInfo> {

    const locationParams = new HttpParams()
      .set('name', city.trim())
      .set('count', '1')
      .set('language', 'en')
      .set('format', 'json');

    return this.http.get<GeocodingResponse>(
      this.geocodingUrl,
      { params: locationParams }
    ).pipe(

      switchMap((locationData) => {

        const location = locationData.results?.[0];

        if (!location) {
          return throwError(
            () => new Error('City not found.')
          );
        }

        const weatherParams = new HttpParams()
          .set('latitude', location.latitude.toString())
          .set('longitude', location.longitude.toString())
          .set(
            'current',
            'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
          )
          .set('timezone', 'auto');

        return this.http.get<ForecastResponse>(
          this.forecastUrl,
          { params: weatherParams }
        ).pipe(

          map((weatherData): WeatherInfo => ({

            city: location.name,

            temperature:
              weatherData.current.temperature_2m,

            humidity:
              weatherData.current.relative_humidity_2m,

            windSpeed:
              weatherData.current.wind_speed_10m,

            weatherCode:
              weatherData.current.weather_code,

            description: this.getWeatherDescription(
              weatherData.current.weather_code
            ),

            observationTime:
              weatherData.current.time

          }))

        );

      })

    );
  }

  /**
   * Converts a WMO weather code into readable text.
   */
  private getWeatherDescription(code: number): string {

    if (code === 0) return 'Clear sky';

    if ([1, 2, 3].includes(code)) {
      return 'Partly cloudy';
    }

    if ([45, 48].includes(code)) {
      return 'Foggy';
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return 'Drizzle';
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return 'Rainy';
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return 'Snowy';
    }

    if ([95, 96, 99].includes(code)) {
      return 'Thunderstorm';
    }

    return 'Unknown conditions';
  }
}
