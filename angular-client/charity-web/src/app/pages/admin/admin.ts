
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  EventService,
  CharityEvent,
  EventCategory,
  Organisation,
  AdminEventData,
  EventRegistration
} from '../../services/event';

/**
 * Admin dashboard for managing charity events.
 */
@Component({
  selector: 'app-admin',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  private eventService = inject(EventService);

  events = signal<CharityEvent[]>([]);
  categories = signal<EventCategory[]>([]);
  organisations = signal<Organisation[]>([]);
  registrations = signal<EventRegistration[]>([]);

  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);
  registrationsLoading = signal(false);

  editingId = signal<number | null>(null);
  showForm = signal(false);

  errorMessage = signal('');
  successMessage = signal('');
  registrationError = signal('');

  form: AdminEventData = this.emptyForm();

  /**
   * Loads administrator data when the page opens.
   */
  ngOnInit(): void {
    this.loadEvents();
    this.loadCategories();
    this.loadOrganisations();
  }

  /**
   * Returns an empty form for creating an event.
   */
  emptyForm(): AdminEventData {
    return {
      event_name: '',
      description: '',
      event_date: '',
      city: '',
      location: '',
      price: 0,
      is_active: true,
      category_id: 0,
      organisation_id: 0
    };
  }

  /**
   * Retrieves all events, including inactive events.
   */
  loadEvents(): void {
    this.loading.set(true);

    this.eventService.getAdminEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Load events failed:', error);
        this.errorMessage.set('Unable to load events.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Loads event categories for the form.
   */
  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (error) => {
        console.error('Load categories failed:', error);
        this.errorMessage.set('Unable to load categories.');
      }
    });
  }

  /**
   * Loads event organisations for the form.
   */
  loadOrganisations(): void {
    this.eventService.getOrganisations().subscribe({
      next: (data) => this.organisations.set(data),
      error: (error) => {
        console.error('Load organisations failed:', error);
        this.errorMessage.set('Unable to load organisations.');
      }
    });
  }

  /**
   * Opens an empty Create Event form.
   */
  startCreate(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.registrations.set([]);
    this.registrationError.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  /**
   * Opens the Edit Event form with existing values.
   */
  startEdit(event: CharityEvent): void {
    this.editingId.set(event.event_id);

    this.form = {
      event_name: event.event_name,
      description: event.description || '',
      event_date: String(event.event_date).slice(0, 10),
      city: event.city,
      location: event.location,
      price: Number(event.price),
      is_active: Boolean(event.is_active),
      category_id: Number(event.category_id),
      organisation_id: Number(event.organisation_id)
    };

    this.errorMessage.set('');
    this.successMessage.set('');
    this.showForm.set(true);

    this.loadRegistrations(event.event_id);
  }

  /**
   * Loads registration records for the selected event.
   */
  loadRegistrations(eventId: number): void {
    this.registrations.set([]);
    this.registrationError.set('');
    this.registrationsLoading.set(true);

    this.eventService.getEventRegistrations(eventId).subscribe({
      next: (data) => {
        if (this.editingId() === eventId) {
          this.registrations.set(data);
          this.registrationsLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Load registrations failed:', error);

        if (this.editingId() === eventId) {
          this.registrationError.set(
            'Unable to load event registrations.'
          );
          this.registrationsLoading.set(false);
        }
      }
    });
  }

  /**
   * Creates or updates a charity event.
   */
  saveEvent(): void {
    if (this.saving()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const data: AdminEventData = {
      ...this.form,
      price: Number(this.form.price),
      category_id: Number(this.form.category_id),
      organisation_id: Number(this.form.organisation_id)
    };

    const id = this.editingId();

    this.saving.set(true);

    const request = id === null
      ? this.eventService.createEvent(data)
      : this.eventService.updateEvent(id, data);

    request.subscribe({
      next: (response) => {
        this.saving.set(false);
        this.successMessage.set(response.message);
        this.showForm.set(false);
        this.editingId.set(null);
        this.registrations.set([]);
        this.loadEvents();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(
          error.error?.error || 'Unable to save event.'
        );
      }
    });
  }

  /**
   * Deletes an event after user confirmation.
   * The backend blocks deletion if registrations exist.
   */
  deleteEvent(event: CharityEvent): void {
    if (this.deleting()) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.event_name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deleting.set(true);

    this.eventService.deleteEvent(event.event_id).subscribe({
      next: (response) => {
        this.deleting.set(false);
        this.successMessage.set(response.message);
        this.loadEvents();
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);

        if (error.status === 409) {
          this.errorMessage.set(
            'This event cannot be deleted because registrations exist.'
          );
        } else {
          this.errorMessage.set(
            error.error?.error || 'Unable to delete event.'
          );
        }
      }
    });
  }

  /**
   * Closes the create or edit form.
   */
  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.registrations.set([]);
    this.registrationError.set('');
    this.errorMessage.set('');
  }
}
