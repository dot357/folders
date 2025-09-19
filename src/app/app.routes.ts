import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/homepage/homepage.page').then(m => m.HomepagePage),
  },
  { path: '**', redirectTo: '' }
];
