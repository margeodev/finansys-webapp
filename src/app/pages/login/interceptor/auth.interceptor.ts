import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { SupabaseService } from '../../../shared/supabase.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService);

  return from(supabase.client.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return next(req);

      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    })
  );
};
