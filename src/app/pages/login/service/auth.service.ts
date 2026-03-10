import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  authState
} from '@angular/fire/auth';
import { from, map, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

  login(email: string, password: string, remember: boolean): Observable<void> {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;

    return from(setPersistence(this.auth, persistence)).pipe(
      switchMap(() => from(signInWithEmailAndPassword(this.auth, email, password))),
      map(() => void 0)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  isAuthenticated$(): Observable<boolean> {
    return authState(this.auth).pipe(map((user) => !!user));
  }
}

