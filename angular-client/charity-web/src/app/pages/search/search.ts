
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  EventService,
  CharityEvent,
  EventCategory
} from '../../services/event';

/**
 * Search page component for charity events.
 * Allows users to filter events by city, date,
 * location and event category.
 */
@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit {

  private eventService = inject(EventService);

  // Search filter values
  filters = {
    city: '',
    date: '',
    location: '',
    category_id: 0
  };

  // Event and category data
  events = signal<CharityEvent[]>([]);
  categories = signal<EventCategory[]>([]);

  // Page states
  loading = signal(false);
  categoriesLoading = signal(false);
  searched = signal(false);
  errorMessage = signal('');

  /**
   * Initializes the search page.
   * Loads available event categories from the API.
   * @returns void
   */
  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Retrieves all available event categories.
   * @returns void
   */
  loadCategories(): void {
    this.categoriesLoading.set(true);

    this.eventService.getCategories().subscribe({
      next: (data: EventCategory[]) => {
        this.categories.set(data);
        this.categoriesLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load categories:', error);

        this.errorMessage.set(
          'Unable to load event categories.'
        );

        this.categoriesLoading.set(false);
      }
    });
  }

  /**
   * Searches charity events using the selected filters.
   * Updates the search results after receiving API data.
   * @returns void
   */
  search(): void {
    this.loading.set(true);
    this.searched.set(true);
    this.errorMessage.set('');

    this.eventService.searchEvents(this.filters).subscribe({
      next: (data: CharityEvent[]) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Search failed:', error);

        this.events.set([]);
        this.errorMessage.set('Unable to search events.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Resets all search filters and clears results.
   * @returns void
   */
  clearFilters(): void {
    this.filters = {
      city: '',
      date: '',
      location: '',
      category_id: 0
    };

    this.events.set([]);
    this.searched.set(false);
    this.errorMessage.set('');
    this.loading.set(false);
  }
}
