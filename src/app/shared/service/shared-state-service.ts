import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedStateService {
  totalUserOne$ = new BehaviorSubject<number | null>(null);
  totalUserTwo$ = new BehaviorSubject<number | null>(null);

  saldoUserOne$ = new BehaviorSubject<number | null>(null);
  saldoUserTwo$ = new BehaviorSubject<number | null>(null);
}

