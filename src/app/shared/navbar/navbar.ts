import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  items: MenuItem[] | undefined;

  ngOnInit() {
      this.items = [
          {
              label: 'Relatórios',
              icon: 'pi-globe',
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

}