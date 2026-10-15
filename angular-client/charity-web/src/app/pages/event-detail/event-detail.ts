
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventService, CharityEvent } from '../../services/event';

/**
 * Displays detailed information about a charity event.
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

  event = signal<CharityEvent | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  /**
   * Loads event details from the route parameter.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load event:', error);
        this.errorMessage.set('Unable to load event details.');
        this.loading.set(false);
      }
    });
  }
}
