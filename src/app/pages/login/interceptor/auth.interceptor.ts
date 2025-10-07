import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  // Não interceptar requisições de login e refresh
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next(cloned).pipe(
      catchError(error => {
        // Se recebeu 401 e o token está expirado, tenta renovar
        if (error.status === 401 && authService.isTokenExpired()) {
          return authService.refreshToken().pipe(
            switchMap(newTokenResponse => {
              // Refaz a requisição com o novo token
              const newReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newTokenResponse.accessToken}`)
              });
              return next(newReq);
            }),
            catchError(refreshError => {
              // Se falhou no refresh, redireciona para login
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};