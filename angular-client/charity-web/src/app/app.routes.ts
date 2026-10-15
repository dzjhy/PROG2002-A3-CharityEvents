import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Search } from './pages/search/search';
import { EventDetail } from './pages/event-detail/event-detail';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'search',
    component: Search
  },
  {
    path: 'event/:id',
    component: EventDetail
  }
];