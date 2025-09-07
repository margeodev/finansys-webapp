import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../pages/login/model/user.model';

@Injectable({ providedIn: 'root' })
export class SharedStateService {
  totalUserOne$ = new BehaviorSubject<number | null>(null);
  totalUserTwo$ = new BehaviorSubject<number | null>(null);

  saldoUserOne$ = new BehaviorSubject<number | null>(null);
  saldoUserTwo$ = new BehaviorSubject<number | null>(null);

  userOne$ = new BehaviorSubject<User | null>(null);
  userTwo$ = new BehaviorSubject<User | null>(null);
}

