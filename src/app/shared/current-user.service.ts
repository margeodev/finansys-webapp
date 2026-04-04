import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, of, switchMap, map, catchError, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

export interface CurrentUserInfo {
  email: string | null;
  username: string | null;
  role: string | null;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  constructor(private supabase: SupabaseService, private http: HttpClient) {}

  getCurrentUserInfo(): Observable<CurrentUserInfo> {
    return from(this.supabase.client.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const session = data.session;
        if (!session?.user?.email) {
          return of<CurrentUserInfo>({ email: null, username: null, role: null });
        }

        const email = session.user.email;
        return this.http
          .get<any>(`${environment.apiUrl}/users?email=${encodeURIComponent(email)}`)
          .pipe(
            map((user) => ({
              email,
              username: user?.username ?? email,
              role: user?.username?.toLowerCase() === 'admin' ? 'admin' : 'user',
            } as CurrentUserInfo)),
            catchError(() => of<CurrentUserInfo>({ email, username: email, role: null }))
          );
      })
    );
  }
}
