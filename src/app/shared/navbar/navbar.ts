import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../pages/login/service/auth.service';
import { Button } from 'primeng/button';
import { AsyncPipe } from '@angular/common';
import { CurrentUserService, CurrentUserInfo } from '../current-user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, Button, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  items: MenuItem[] | undefined;

  currentUser$!: Observable<CurrentUserInfo>;

  private auth = inject(AuthService);
  private router = inject(Router);
  private currentUserService = inject(CurrentUserService);

  ngOnInit() {
      this.currentUser$ = this.currentUserService.getCurrentUserInfo();
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
              icon: 'pi pi-fw pi-tag',
              routerLink:"/categories"
          }
      ];
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}