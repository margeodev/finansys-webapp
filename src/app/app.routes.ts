import { Routes } from '@angular/router';
import { Entries } from './pages/entries/entries';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './auth.guard';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
     { path: '', redirectTo: 'login', pathMatch: 'full' },
     { path: 'login', component: LoginComponent },
     { path: 'entries', component: Entries, canActivate: [authGuard] },
     { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
     { path: '**', redirectTo: 'login' }
];

