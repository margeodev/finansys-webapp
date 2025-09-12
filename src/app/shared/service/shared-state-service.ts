// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { map, distinctUntilChanged } from 'rxjs/operators';
// import { User } from '../../pages/login/model/user.model';

// export interface SharedState {
//   totalUserOne: number | null;
//   totalUserTwo: number | null;
//   advanceUserOne: number | null;
//   advanceUserTwo: number | null;
//   advancePaymentUserOne: number | null;
//   advancePaymentUserTwo: number | null;
//   userOne: User | null;
//   userTwo: User | null;
// }

// @Injectable({ providedIn: 'root' })
// export class SharedStateService {
//   // 🔹 Estado inicial
//   private initialState: SharedState = {
//     totalUserOne: null,
//     totalUserTwo: null,
//     advanceUserOne: null,
//     advanceUserTwo: null,
//     advancePaymentUserOne: null,
//     advancePaymentUserTwo: null,
//     userOne: null,
//     userTwo: null,
//   };

//   private stateSource = new BehaviorSubject<SharedState>(this.initialState);
//   state$ = this.stateSource.asObservable();

//   // 🔹 Selectors prontos (boa prática: expor só observables filtrados)
//   totalUserOne$ = this.state$.pipe(
//     map(state => state.totalUserOne),
//     distinctUntilChanged()
//   );

//   totalUserTwo$ = this.state$.pipe(
//     map(state => state.totalUserTwo),
//     distinctUntilChanged()
//   );

//   advanceUserOne$ = this.state$.pipe(
//     map(state => state.advanceUserOne),
//     distinctUntilChanged()
//   );

//   advanceUserTwo$ = this.state$.pipe(
//     map(state => state.advanceUserTwo),
//     distinctUntilChanged()
//   );

//   advancePaymentUserOne$ = this.state$.pipe(
//     map(state => state.advancePaymentUserOne),
//     distinctUntilChanged()
//   );

//   advancePaymentUserTwo$ = this.state$.pipe(
//     map(state => state.advancePaymentUserTwo),
//     distinctUntilChanged()
//   );

//   userOne$ = this.state$.pipe(
//     map(state => state.userOne),
//     distinctUntilChanged()
//   );

//   userTwo$ = this.state$.pipe(
//     map(state => state.userTwo),
//     distinctUntilChanged()
//   );

//   // 🔹 Atualiza parcialmente o estado
//   updateState(patch: Partial<SharedState>) {
//     this.stateSource.next({
//       ...this.stateSource.value,
//       ...patch
//     });
//   }

//   // 🔹 Getter (caso precise acessar sincronicamente o estado atual)
//   getSnapshot(): SharedState {
//     return this.stateSource.value;
//   }
// }


