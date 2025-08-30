import { Routes } from '@angular/router';
import { Entries } from './pages/entries/entries';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
     { path: 'login', component: LoginComponent },
     { path: '', component: Entries, canActivate: [authGuard] }
];
