import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
// import { SharedStateService } from '../../shared/service/shared-state-service';
import { User } from '../../pages/login/model/user.model';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { Divider } from "primeng/divider";
import { BalanceResponse } from '../../pages/entries/model/balance.model';
import { EntryService } from '../../pages/entries/service/entry.service';
import { UserHeader } from '../../pages/entries/model/user-header.model';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Button, Card, Dialog, EntryFormComponent, Divider],
  templateUrl: './entry-header.component.html',
  styleUrl: './entry-header.component.css'
})
export class EntryHeaderComponent implements OnInit {

  @Input() user: User | null = null;
  @Input() userHeader: UserHeader | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  private userChange$ = new BehaviorSubject<User | null>(null);
  visible: boolean = false;
  isEditing: boolean = false;
  subTotal: number | null = null;
  advance: number | null = null;
  saldo: number | null = null;
  userName: string = '';

  // private subscriptions = new Subscription();

  // @Input() set user(value: User | null) {
  //   this.userChange$.next(value);
  // }

  // private totalSub?: Subscription;
  // private saldoSub?: Subscription;

  constructor(public entryService: EntryService) { }

  ngOnInit(): void {
    this.userName = this.userHeader!.userName ?? '';
    this.subTotal = this.userHeader!.subtotal ?? 0;
    this.advance = this.userHeader!.advance ?? 0;
    this.saldo = this.userHeader!.balance ?? 0;
    // this.getBalanceForUser(this.userName);
    // Inscreve no estado compartilhado
    // this.subscriptions.add(
    //   combineLatest([
    //     this.sharedState.userOne$,
    //     this.sharedState.userTwo$,
    //     this.sharedState.totalUserOne$,
    //     this.sharedState.totalUserTwo$,
    //     this.sharedState.advancePaymentUserOne$,
    //     this.sharedState.advancePaymentUserTwo$
    //   ]).subscribe(([userOne, userTwo, totalOne, totalTwo, advanceOne, advanceTwo]) => {
    //     // Determina qual user usar
    //     const user = this.user?.id === 1 ? userOne : userTwo;

    //     if (!user) return;

    //     this.userName = user.username ?? '';

    //     if (user.id === 1) {
    //       this.subTotal = totalOne ?? 0;
    //       this.advance = advanceOne ?? 0;
    //       this.calculateSaldo(500, 100);
    //     } else if (user.id === 2) {
    //       this.subTotal = totalTwo ?? 0;
    //       this.advance = advanceTwo ?? 0;
    //       this.calculateSaldo(100, 500);
    //     }
    //   })
    // );
  }

  private getBalanceForUser(userName: string): void {
    let balance: BalanceResponse;
    this.entryService.getUserTotal(userName).subscribe({
      next: (response) => {
        this.subTotal = response.subTotalBalance!;        
      },
      error: (err) => {
        console.error('Erro ao buscar total do usuário:', err);
      }
    });
  }

  private calculateAdvanceForUser(advance: number): number {
    return advance / 2;
  }
  // ngOnDestroy(): void {
  //   // Evita vazamento de memória
  //   this.subscriptions.unsubscribe();
  // }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['user'] && changes['user'].currentValue) {
  //     const user = changes['user'].currentValue as User;

  //     if (!user || typeof user.id !== 'number') {
  //       console.warn('User inválido ou incompleto:', user);
  //       return;
  //     }

  //     this.userName = user.username ?? '';

  //     if (user.id === 1) {
  //       this.sharedState.totalUserOne$.subscribe(t => this.subTotal = t);
  //       // this.saldoSub = this.sharedState.saldoUserOne$.subscribe(s => this.saldo = s);
  //       this.sharedState.advancePaymentUserOne$.subscribe(a => {
  //         this.advance = a;
  //         this.calculateSaldo(500, 100);
  //       });
  //       // this.saldo = this.calculateSaldo(100, 500);
  //     } else if (user.id === 2) {
  //       this.sharedState.totalUserTwo$.subscribe(t => this.subTotal = t);
  //       // this.saldoSub = this.sharedState.saldoUserTwo$.subscribe(s => this.saldo = s);
  //       // this.sharedState.advancePaymentUserTwo$.subscribe(a => this.advance = a);
  //       this.sharedState.advancePaymentUserTwo$.subscribe(a => {
  //         this.advance = a;
  //         this.calculateSaldo(100, 500);
  //       })
  //       // this.saldo = this.calculateSaldo(500, 100);
  //     }
  //   }
  // }

  showCreateDialog() {
    this.isEditing = false;
    this.visible = true;
  }

  onCloseDialog() {
    this.dialogClosed.emit();
    this.visible = false;
  }

  private calculateSaldo(num1: number, num2: number): number {
    let x = this.calculateSaldoDefault(num1, num2);

    // Cenário 1: ambos sem adiantamento
    if (!this.advance || this.advance === 0) {
      console.log('Cenário 1: ambos sem adiantamento');

      return x;
    }


    return x;
  }

  private calculateSaldoold(balanceOne: BalanceResponse, balanceTwo: BalanceResponse): void {
    const subTotalOne = balanceOne.subTotalBalance ?? 0;
    const subTotalTwo = balanceTwo.subTotalBalance ?? 0;
    const advanceOne = balanceOne.totalAdvanceBalance ?? 0;
    const advanceTwo = balanceTwo.totalAdvanceBalance ?? 0;

    let saldoUserOne = (subTotalOne - subTotalTwo) / 2;
    let saldo = 0;

    // Cenário 1: ambos sem adiantamento
    if (advanceOne === 0 && advanceTwo === 0) {
      console.log('Cenário 1: ambos sem adiantamento');
      // saldo = this.calculateSaldoDefault(balanceOne, balanceTwo);
      if (subTotalOne > subTotalTwo) {
        // this.sharedState.saldoUserOne$.next(saldo);
        // this.sharedState.saldoUserTwo$.next(-saldo);
      } else if (subTotalTwo > subTotalOne) {
        // this.sharedState.saldoUserOne$.next(-saldo);
        // this.sharedState.saldoUserTwo$.next(saldo);
      } else {
        saldo = 0;
        // this.sharedState.saldoUserOne$.next(saldo);
        // this.sharedState.saldoUserTwo$.next(saldo);
      }
      return;
    }

    // Caso 2: Apenas userTwo recebeu adiantamento
    if (advanceOne === 0 && advanceTwo > 0) {
      // console.log('➡️ Cenário 2: Apenas usertwo recebeu adiantamento');
      // saldo = this.calculateSaldoDefault(balanceOne, balanceTwo) - (advanceTwo / 2); // saldo pode estar negativo 
      // console.log('➡️ Saldo após ajuste de adiantamento:', saldo);

      const tempSubtotalTwo = subTotalTwo - advanceTwo; // Subtotal ajustado para comparação

      if (subTotalOne > tempSubtotalTwo) {
        if (saldo < 0) { // Se saldo for negativo, significa que userOne não deve nada
          // this.sharedState.saldoUserOne$.next(-saldo);
          // this.sharedState.saldoUserTwo$.next(saldo);
        } else if (saldo) { // Se saldo for positivo, userOne deve para userTwo
          // this.sharedState.saldoUserOne$.next(saldo);
          // this.sharedState.saldoUserTwo$.next(-saldo);
        }
      } else if (subTotalTwo > subTotalOne) {
        // this.sharedState.saldoUserOne$.next(-saldo);
        // this.sharedState.saldoUserTwo$.next(saldo);
      } else {
        saldo = 0;
        // this.sharedState.saldoUserOne$.next(saldo);
        // this.sharedState.saldoUserTwo$.next(saldo);
      }
      return;
    }

    // Caso 3: Apenas userTwo tem adiantamento
    if (advanceTwo > 0 && advanceOne === 0) {
      // console.log('➡️ Cenário 4: Apenas userTwo tem adiantamento');
      saldoUserOne -= advanceTwo / 2;
    }

    // Caso 4: Ambos têm adiantamento
    if (advanceOne > 0 && advanceTwo > 0) {
      // console.log('➡️ Cenário 5 ou 6: Ambos têm adiantamento');
      saldoUserOne += advanceOne / 2;
      saldoUserOne -= advanceTwo / 2;
    }

    const saldoUserTwo = -saldoUserOne;

    // console.log('✅ Resultado final:', {
    //   saldoUserOne,
    //   saldoUserTwo
    // });

    // this.sharedState.saldoUserOne$.next(saldoUserOne);
    // this.sharedState.saldoUserTwo$.next(saldoUserTwo);
  }

  private calculateSaldoDefault(subTotalOne: number, subTotalTwo: number): number {
    const max: number = Math.max(subTotalOne, subTotalTwo);
    const min: number = Math.min(subTotalOne, subTotalTwo);
    return (max - min) / 2;
  }
}
