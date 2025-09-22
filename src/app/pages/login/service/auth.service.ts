import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const basicAuth = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({
      'Authorization': `Basic ${basicAuth}`
    });

    // backend retorna apenas string (token), não objeto {token: string}
    return this.http.post(`${this.API_URL}/login`, {}, { headers, responseType: 'text' })
      .pipe(
        tap(token => {
          localStorage.setItem(this.TOKEN_KEY, token);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  getLoggedUser(): { username: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { username: payload.sub };
    } catch {
      return null;
    }
  }
}
