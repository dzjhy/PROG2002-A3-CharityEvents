
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Represents a charity event returned by the Express API.
 */
export interface CharityEvent {
  event_id: number;
  event_name: string;
  description: string | null;
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
 * Represents an organisation.
 */
export interface Organisation {
  organisation_id: number;
  name: string;
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
 * Represents a registration stored in MySQL.
 */
export interface EventRegistration {
  registration_id: number;
  event_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  ticket_quantity: number;
  registration_date: string;
}

/**
 * Represents data submitted when creating or editing an event.
 */
export interface AdminEventData {
  event_name: string;
  description: string;
  event_date: string;
  city: string;
  location: string;
  price: number;
  is_active: boolean;
  category_id: number;
  organisation_id: number;
}

/**
 * Represents the response after an administrator
 * creates, updates or deletes an event.
 */
export interface AdminEventResponse {
  message: string;
  event_id: number;
}

/**
 * Handles HTTP communication with the Express API.
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
   * Retrieves all organisations.
   * @returns Observable containing organisations.
   */
  getOrganisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(
      `${this.apiUrl}/organisations`
    );
  }

  /**
   * Searches charity events using optional filters.
   * @param filters - Search criteria.
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
   * Retrieves a charity event by its ID.
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
   * @returns Observable containing registration confirmation.
   */
  registerForEvent(
    data: RegistrationData
  ): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.apiUrl}/registrations`,
      data
    );
  }

  /**
   * Retrieves registrations for a specific event.
   * The backend returns the newest registrations first.
   * @param id - Event identifier.
   * @returns Observable containing registration records.
   */
  getEventRegistrations(
    id: number
  ): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(
      `${this.apiUrl}/events/${id}/registrations`
    );
  }

  /**
   * Retrieves all events for the administrator dashboard.
   * Includes past and inactive events.
   * @returns Observable containing all charity events.
   */
  getAdminEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(
      `${this.apiUrl}/admin/events`
    );
  }

  /**
   * Creates a new charity event.
   * @param data - New event details.
   * @returns Observable containing the new event ID.
   */
  createEvent(
    data: AdminEventData
  ): Observable<AdminEventResponse> {
    return this.http.post<AdminEventResponse>(
      `${this.apiUrl}/admin/events`,
      data
    );
  }

  /**
   * Updates an existing charity event.
   * @param id - Event identifier.
   * @param data - Updated event details.
   * @returns Observable containing update confirmation.
   */
  updateEvent(
    id: number,
    data: AdminEventData
  ): Observable<AdminEventResponse> {
    return this.http.put<AdminEventResponse>(
      `${this.apiUrl}/admin/events/${id}`,
      data
    );
  }

  /**
   * Deletes a charity event.
   * The Express API rejects deletion if registrations exist.
   * @param id - Event identifier.
   * @returns Observable containing deletion confirmation.
   */
  deleteEvent(
    id: number
  ): Observable<AdminEventResponse> {
    return this.http.delete<AdminEventResponse>(
      `${this.apiUrl}/admin/events/${id}`
    );
  }
}
