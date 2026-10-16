
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  EventService,
  CharityEvent,
  RegistrationData
} from '../../services/event';

/**
 * Handles participant registration for a charity event.
 */
@Component({
  selector: 'app-registration',
  imports: [FormsModule, RouterLink],
  templateUrl: './registration.html',
  styleUrl: './registration.css'
})
export class Registration implements OnInit {

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  event = signal<CharityEvent | null>(null);
  loading = signal(true);
  submitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  form: RegistrationData = {
    event_id: 0,
    full_name: '',
    email: '',
    phone: '',
    ticket_quantity: 1
  };

  /**
   * Reads the event ID and loads its details.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.form.event_id = id;

    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load event details.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Validates the registration and submits it to the API.
   */
  submitRegistration(): void {
    if (this.submitting() || this.loading() || !this.event()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      !this.form.full_name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim()) ||
      !Number.isInteger(Number(this.form.ticket_quantity)) ||
      Number(this.form.ticket_quantity) < 1
    ) {
      this.errorMessage.set('Please enter valid registration information.');
      return;
    }

    this.submitting.set(true);

    this.eventService.registerForEvent(this.form).subscribe({
      next: (response) => {
        this.successMessage.set(
          `Registration successful! Your registration ID is ${response.registration_id}.`
        );
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error || 'Registration failed. Please try again.'
        );
        this.submitting.set(false);
      }
    });
  }
}
