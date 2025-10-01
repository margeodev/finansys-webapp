import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../pages/login/service/auth.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, Button],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  items: MenuItem[] | undefined;

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
      this.items = [
          {
              label: 'Relatórios',
              icon: 'fa fa-file-chart-pie',
              routerLink: '/reports',
              routerLinkActiveOptions: { exact: true }
          },
          {
              label: 'Lançamentos',
              icon: 'pi pi-fw pi-pencil',
              routerLink:"/entries"
          },
          {
              label: 'Categorias',
              icon: 'pi pi-fw pi-user',
              routerLink:"/categories"
          }
      ];
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}