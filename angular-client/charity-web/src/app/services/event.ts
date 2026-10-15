
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Represents a charity event returned by the API.
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
 * Represents an event category returned by the API.
 */
export interface EventCategory {
  category_id: number;
  category_name: string;
}

/**
 * Provides API operations for charity events and categories.
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  /**
   * Retrieves active upcoming charity events.
   * @returns Observable containing the event list.
   */
  getEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(
      `${this.apiUrl}/events`
    );
  }

  /**
   * Retrieves available event categories.
   * @returns Observable containing the category list.
   */
  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(
      `${this.apiUrl}/categories`
    );
  }

  /**
   * Searches charity events using optional filters.
   * @param filters - Search conditions.
   * @returns Observable containing matching events.
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
 * Retrieves a specific charity event by its ID.
 * @param id - Unique event identifier.
 * @returns Observable containing event details.
 */
  getEventById(id: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(
      `${this.apiUrl}/events/${id}`
   );
  }
}
