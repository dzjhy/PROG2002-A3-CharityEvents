
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  EventService,
  CharityEvent
} from '../../services/event';

/**
 * Displays upcoming charity events.
 */
@Component({
  selector: 'app-home',
  imports: [DatePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private eventService = inject(EventService);

  events = signal<CharityEvent[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Retrieves charity events from the REST API.
   */
  loadEvents(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.eventService.getEvents().subscribe({

      next: (data: CharityEvent[]) => {
        this.events.set(data);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load events:', error);
        this.errorMessage.set('Unable to load events.');
        this.loading.set(false);
      }

    });
  }
}
