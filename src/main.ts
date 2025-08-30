import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
import { registerLocaleData } from '@angular/common';

// registra o locale
registerLocaleData(localePt, 'pt-BR', localePtExtra);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
