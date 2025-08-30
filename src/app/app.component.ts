import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Navbar } from './shared/navbar/navbar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Navbar, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'finansys-webapp';

  constructor(private router: Router) {}

  shouldShowNavbar(): boolean {    
    return this.router.url !== '/login';
  }
}
