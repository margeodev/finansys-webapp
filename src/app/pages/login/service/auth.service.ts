import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Observable, throwError, BehaviorSubject } from 'rxjs';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  constructor(private http: HttpClient) { }
  login(username: string, password: string, remember: boolean): Observable<AuthResponse> {
    const basicAuth = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({
      'Authorization': `Basic ${basicAuth}`
    });
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, {}, { headers })
      .pipe(
        tap(response => {
          if (remember) {
            localStorage.setItem(this.TOKEN_KEY, response.accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          } else {
            sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
            sessionStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          }
          this.refreshTokenSubject.next(response.refreshToken);
        })
      );
  }
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.refreshTokenSubject.next(null);
  }
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          const isLocalStorage = localStorage.getItem(this.TOKEN_KEY);
          if (isLocalStorage) {
            localStorage.setItem(this.TOKEN_KEY, response.accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          } else {
            sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
            sessionStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          }
          this.refreshTokenSubject.next(response.refreshToken);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp) {
        // Token expirado, mas tenta renovar
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch {
      return true;
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