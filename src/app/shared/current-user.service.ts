import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  limit,
} from '@angular/fire/firestore';
import { from, map, of, switchMap } from 'rxjs';

export interface CurrentUserInfo {
  email: string | null;
  username: string | null;
  role: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  getCurrentUserInfo() {
    return authState(this.auth).pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser?.email) {
          return of<CurrentUserInfo>({
            email: null,
            username: null,
            role: null,
          });
        }

        const usersCol = collection(this.firestore, 'users');
        const q = query(
          usersCol,
          where('email', '==', firebaseUser.email),
          limit(1)
        );

        return from(getDocs(q)).pipe(
          map((snapshot) => {
            if (snapshot.empty) {
              return {
                email: firebaseUser.email!,
                username: firebaseUser.email!,
                role: null,
              } as CurrentUserInfo;
            }

            const doc = snapshot.docs[0];
            const data = doc.data() as any;

            return {
              email: firebaseUser.email!,
              username: data?.username ?? firebaseUser.email!,
              role: data?.role ?? null,
            } as CurrentUserInfo;
          })
        );
      })
    );
  }
}

