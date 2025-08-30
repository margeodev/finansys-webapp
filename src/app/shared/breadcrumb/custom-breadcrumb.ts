import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb, BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule, RouterModule],
  templateUrl: './custom-breadcrumb.html',
  styleUrl: './custom-breadcrumb.css'
})
export class CustomBreadcrumb {

  @Input() items: Array<MenuItem> = [];

}
