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

  login(email: string, password: string) {
    const headers = new HttpHeaders({
      'email': email,
      'password': password
    });

    return this.http.post<{ token: string }>(`${this.API_URL}/login`, {}, { headers })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
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
      const payload = JSON.parse(atob(token.split('.')[1])); // decodifica o JWT
      const exp = payload.exp * 1000; // exp vem em segundos
      if (Date.now() >= exp) {
        this.logout(); // remove token expirado
        return false;
      }
      return true;
    } catch (e) {
      this.logout();
      return false;
    }
  }

  getLoggedUser(): { username: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));      
      return {
        username: payload.sub
      };
    } catch (e) {
      return null;
    }
  }

}
