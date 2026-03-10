import { Routes } from '@angular/router';
import { Entries } from './pages/entries/entries';
import { LoginComponent } from './pages/login/login.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: 'entries', pathMatch: 'full' },
  { path: 'entries', component: Entries },
  { path: 'reports', component: ReportsComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'entries' }
];

