import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { EventService, CharityEvent } from '../../services/event';

/**
 * Home page component.
 * Retrieves upcoming charity events from the REST API.
 */
@Component({
  selector: 'app-home',
  imports: [DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private eventService = inject(EventService);

  events: CharityEvent[] = [];
  loading = true;
  errorMessage = '';

  /**
   * Loads charity events when the component starts.
   * @returns void
   */
  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Requests upcoming events from the backend API.
   * @returns void
   */
  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (data: CharityEvent[]) => {
        this.events = data;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Failed to load events:', error);
        this.errorMessage = 'Unable to load events.';
        this.loading = false;
      }
    });
  }
}
