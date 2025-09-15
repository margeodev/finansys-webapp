import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';
import { authInterceptor } from './pages/login/interceptor/auth.interceptor'; // atenção: minúsculo

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    MessageService,
    ConfirmationService,
    provideHttpClient(
      withInterceptors([authInterceptor]) // 🔹 função, não classe
    ),
    provideAnimationsAsync(),  
            providePrimeNG({
              inputVariant: 'filled' ,
              theme: {
                  preset: Aura
              }
        })   
  ]
};
