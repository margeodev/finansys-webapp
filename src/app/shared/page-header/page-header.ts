import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  imports: [CommonModule, ButtonModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css'
})
export class PageHeader {
  @Input('page-title') pageTitle: string | undefined;
  @Input('total-expenses') totalExpenses: number | undefined;
}
