import { Component } from '@angular/core';
import { CustomBreadcrumb } from "../../shared/breadcrumb/custom-breadcrumb";
import { CommonModule } from '@angular/common';
import { PageHeader } from "../../shared/page-header/page-header";

@Component({
  selector: 'app-reports',
  imports: [CustomBreadcrumb, CommonModule, PageHeader],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {

}
