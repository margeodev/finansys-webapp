import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../login/model/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl: string = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}?isActive=true`).pipe(
      map(data => data
        .filter(u => u.username !== 'Admin')
        .map(u => new User(Number(u.id), u.username))
        .sort((a, b) => a.username?.toLowerCase() === 'marcio' ? -1 : b.username?.toLowerCase() === 'marcio' ? 1 : 0)
      )
    );
  }

}
