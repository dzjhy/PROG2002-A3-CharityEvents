
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { DatePipe } from '@angular/common';

import {
  EventService,
  CharityEvent,
  EventRegistration
} from '../../services/event';

import {
  WeatherService,
  WeatherInfo
} from '../../services/weather';

/**
 * Displays event information, current weather,
 * and participant registrations.
 */
@Component({
  selector: 'app-event-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private weatherService = inject(WeatherService);

  // Event information
  event = signal<CharityEvent | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  // Registration information
  registrations = signal<EventRegistration[]>([]);
  registrationsLoading = signal(false);
  registrationsError = signal('');

  // Weather information
  weather = signal<WeatherInfo | null>(null);
  weatherLoading = signal(false);
  weatherError = signal('');

  /**
   * Loads event details using the ID from the URL.
   */
  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.loadEvent(id);
  }

  /**
   * Retrieves event details from the Express API.
   * @param id - Event identifier.
   */
  loadEvent(id: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.eventService.getEventById(id).subscribe({

      next: (data: CharityEvent) => {

        this.event.set(data);
        this.loading.set(false);

        // Load registrations.
        this.loadRegistrations(id);

        // Load current weather for the event city.
        if (data.city && data.city.trim()) {
          this.loadWeather(data.city);
        } else {
          this.weather.set(null);
          this.weatherError.set(
            'City information is unavailable.'
          );
        }

      },

      error: (error: unknown) => {

        console.error('Failed to load event:', error);

        this.errorMessage.set(
          'Unable to load event details.'
        );

        this.loading.set(false);
      }

    });
  }

  /**
   * Retrieves the newest registrations first.
   * @param id - Event identifier.
   */
  loadRegistrations(id: number): void {

    this.registrationsLoading.set(true);
    this.registrationsError.set('');
    this.registrations.set([]);

    this.eventService.getEventRegistrations(id).subscribe({

      next: (data: EventRegistration[]) => {

        this.registrations.set(data);
        this.registrationsLoading.set(false);
      },

      error: (error: unknown) => {

        console.error(
          'Failed to load registrations:',
          error
        );

        this.registrationsError.set(
          'Unable to load registrations.'
        );

        this.registrationsLoading.set(false);
      }

    });
  }

  /**
   * Retrieves current weather using Open-Meteo.
   * @param city - Event city.
   */
  loadWeather(city: string): void {

    this.weatherLoading.set(true);
    this.weatherError.set('');
    this.weather.set(null);

    this.weatherService.getWeatherByCity(city).subscribe({

      next: (data: WeatherInfo) => {

        this.weather.set(data);
        this.weatherLoading.set(false);
      },

      error: (error: unknown) => {

        console.error(
          'Failed to load weather:',
          error
        );

        this.weatherError.set(
          'Weather information is currently unavailable.'
        );

        this.weatherLoading.set(false);
      }

    });
  }

}
