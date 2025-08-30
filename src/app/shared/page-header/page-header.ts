import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  imports: [ButtonModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css'
})
export class PageHeader {
  @Input('page-title') pageTitle: string | undefined;
  @Input('button-text') buttonText: string | undefined;
  @Input('button-link') buttonLink: string | undefined;
  @Input('button-icon') buttonIcon: string | undefined;
  @Input('style-class') styleClass: string | undefined;
}
