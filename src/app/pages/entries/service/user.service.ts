import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../login/model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Usuários fixos baseados no sistema antigo (ids 1 e 2)
  private readonly users: User[] = [
    new User(1, 'Ana Flavia'),
    new User(2, 'Marcio')
  ];

  getAll(): Observable<User[]> {
    return of(this.users);
  }

}
