import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User } from '../../login/model/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl: string = `${environment.apiUrl}/api/v1/users/list`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError),
      map(this.jsonDataToUsers)
    );
  }

  private jsonDataToUsers(jsonData: any[]): User[] {
    const users: User[] = [];
    jsonData.forEach(element => users.push(element as User));
    return users;
  }

  private handleError(error: any): Observable<any> {
    console.error("Erro na requisição => ", error);
    return throwError(error);
  }

}
