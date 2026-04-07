import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { SupabaseService } from '../../../shared/supabase.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService);

  return from(supabase.client.auth.getSession()).pipe(
    switchMap(async ({ data }) => {
      let session = data.session;

      // Se o token expirou, tenta renovar automaticamente
      if (session && session.expires_at && session.expires_at * 1000 < Date.now()) {
        const { data: refreshed } = await supabase.client.auth.refreshSession();
        session = refreshed.session;
      }

      return session?.access_token ?? null;
    }),
    switchMap((token) => {
      if (!token) return next(req);

      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    })
  );
};
