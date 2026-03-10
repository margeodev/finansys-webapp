import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './pages/login/service/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated$().pipe(
    map((isAuth) => {
      if (isAuth) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
