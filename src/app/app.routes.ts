import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  {
    path: 'repair-verification-status',
    loadComponent: () => import('./repair-verification-status/repair-verification-status.component').then(c => c.RepairVerificationStatusComponent)
  },
  { path: 'cvir-status', loadComponent: () => import('./cvir-status/cvir-status.component').then(c => c.CvirStatusComponent) },
  { path: '**', component: PageNotFoundComponent }
];
