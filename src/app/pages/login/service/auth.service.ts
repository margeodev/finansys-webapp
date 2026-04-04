import { Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private get auth() {
    return this.supabase.client.auth;
  }

  constructor(private supabase: SupabaseService) {}

  login(email: string, password: string, remember: boolean): Observable<void> {
    return from(
      this.auth.signInWithPassword({ email, password })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  logout(): Observable<void> {
    return from(this.auth.signOut()).pipe(map(() => void 0));
  }

  isAuthenticated$(): Observable<boolean> {
    return from(this.auth.getSession()).pipe(
      map(({ data }) => !!data.session)
    );
  }

  getSession() {
    return from(this.auth.getSession()).pipe(map(({ data }) => data.session));
  }
}
