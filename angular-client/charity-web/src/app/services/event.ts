
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Represents a charity event returned by the Express API.
 */
export interface CharityEvent {
  event_id: number;
  event_name: string;
  description: string;
  event_date: string;
  city: string;
  location: string;
  price: number;
  is_active: boolean;
  category_id: number;
  organisation_id: number;
  category_name: string;
  organisation_name: string;
}

/**
 * Represents an event category.
 */
export interface EventCategory {
  category_id: number;
  category_name: string;
}

/**
 * Represents registration details submitted by a participant.
 */
export interface RegistrationData {
  event_id: number;
  full_name: string;
  email: string;
  phone: string;
  ticket_quantity: number;
}

/**
 * Represents the response returned after registration.
 */
export interface RegistrationResponse {
  message: string;
  registration_id: number;
  event_id: number;
}

/**
 * Provides HTTP communication with the Charity Events Express API.
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000';

  /**
   * Retrieves all active upcoming charity events.
   * @returns Observable containing charity events.
   */
  getEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(
      `${this.apiUrl}/events`
    );
  }

  /**
   * Retrieves all available event categories.
   * @returns Observable containing event categories.
   */
  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(
      `${this.apiUrl}/categories`
    );
  }

  /**
   * Searches charity events using optional filters.
   * @param filters - Search criteria.
   * @returns Observable containing matching charity events.
   */
  searchEvents(filters: {
    city?: string;
    date?: string;
    location?: string;
    category_id?: number;
  }): Observable<CharityEvent[]> {

    let params = new HttpParams();

    if (filters.city?.trim()) {
      params = params.set('city', filters.city.trim());
    }

    if (filters.date) {
      params = params.set('date', filters.date);
    }

    if (filters.location?.trim()) {
      params = params.set('location', filters.location.trim());
    }

    if (filters.category_id) {
      params = params.set(
        'category_id',
        filters.category_id.toString()
      );
    }

    return this.http.get<CharityEvent[]>(
      `${this.apiUrl}/events/search`,
      { params }
    );
  }

  /**
   * Retrieves one charity event by its unique ID.
   * @param id - Event identifier.
   * @returns Observable containing event details.
   */
  getEventById(id: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(
      `${this.apiUrl}/events/${id}`
    );
  }

  /**
   * Submits a participant registration for a charity event.
   * @param data - Registration form information.
   * @returns Observable containing the registration confirmation.
   */
  registerForEvent(
    data: RegistrationData
  ): Observable<RegistrationResponse> {

    return this.http.post<RegistrationResponse>(
      `${this.apiUrl}/registrations`,
      data
    );
  }
}
