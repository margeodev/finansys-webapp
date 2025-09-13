import { Component, OnInit} from "@angular/core";
import { catchError, forkJoin, Observable, of } from "rxjs";
import { DividerModule } from "primeng/divider";
import { EntryService } from "./service/entry.service";
import { CommonModule } from "@angular/common";
import { CustomBreadcrumb } from "../../shared/breadcrumb/custom-breadcrumb";
import { PageHeader } from "../../shared/page-header/page-header";
import { UserService } from "./service/user.service";
import { User } from "../login/model/user.model";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserHeader } from "./model/user-header.model";
import { BalanceResponse } from "./model/balance.model";
import { EntryHeaderComponent } from "../../components/entry-header/entry-header.component";
import { EntryTableComponent } from "../../components/entry-table/entry-table.component";

@Component({
  selector: 'app-entries',
  imports: [CustomBreadcrumb, ProgressSpinnerModule, PageHeader, CommonModule, DividerModule, EntryHeaderComponent, EntryTableComponent],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries implements OnInit {
[x: string]: any;
  users: User[] = [];
  userNameOne: string = '';
  userNameTwo: string = ''
  userOneHeader: UserHeader | null = null;
  userTwoHeader: UserHeader | null = null;
  shouldReloadTable: boolean = false;

  constructor(
    private userService: UserService,
    private entryService: EntryService
  ) { }

  ngOnInit(): void {
    this.loadUsersData();
  }

  private loadUsersData(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;

        forkJoin([
          this.getUserBalance(users[0].username!),
          this.getUserBalance(users[1].username!)
        ]).subscribe({
          next: ([balance1, balance2]) => {
            const advance1 = (balance2.totalAdvanceBalance ?? 0) / 2;
            const advance2 = (balance1.totalAdvanceBalance ?? 0) / 2;
            const subTotalBalanceOne = balance1.subTotalBalance ?? 0;
            const subTotalBalanceTwo = balance2.subTotalBalance ?? 0;

            let saldo1: number = 0;
            let saldo2: number = 0;
            if (advance1 === 0 && advance2 === 0) {
              console.log('Cenario 1 - Nenhum adiantamento');
              saldo1 = this.calculateSaldoDefault(subTotalBalanceOne, subTotalBalanceTwo);
              saldo2 = saldo1 * -1;
            }
            
            else if (advance1 > 0 && advance2 === 0) {
              console.log('Cenario 2 - Usuario 1 pagou adiantado');
              if(subTotalBalanceOne === subTotalBalanceTwo) {
                console.log('Cenario 2.1 - Subtotais iguais');                
                saldo1 = advance1;
                saldo2 = saldo1 * -1;
              }
              if(subTotalBalanceOne < subTotalBalanceTwo) {
                console.log('Cenario 2.2 - Subtotal 1 menor que subtotal 2');
                saldo2 = this.calculateSaldoDefault(subTotalBalanceTwo, subTotalBalanceOne) - advance1;
                saldo1 = saldo2 * -1;
              }
              if(subTotalBalanceOne > subTotalBalanceTwo) {
                console.log('Cenario 2.3 - Subtotal 1 maior que subtotal 2');
                saldo1 = this.calculateSaldoDefault(subTotalBalanceOne, subTotalBalanceTwo) + advance1;
                saldo2 = saldo1 * -1;
              }              
              
            }

            else if (advance1 === 0 && advance2 > 0) {
              console.log('Cenario 3 - Usuario 2 pagou adiantado');
              if(subTotalBalanceOne === subTotalBalanceTwo) {
                console.log('Cenario 3.1 - Subtotais iguais');                
                saldo2 = advance2;
                saldo1 = saldo2 * -1;
              }            
              if(subTotalBalanceOne < subTotalBalanceTwo) {
                console.log('Cenario 3.2 - Subtotal 1 menor que subtotal 2');
                saldo2 = this.calculateSaldoDefault(subTotalBalanceTwo, subTotalBalanceOne) + advance2;
                saldo1 = saldo2 * -1;
              }

               if(subTotalBalanceOne > subTotalBalanceTwo) {
                console.log('Cenario 3.3 - Subtotal 1 maior que subtotal 2');
                saldo1 = this.calculateSaldoDefault(subTotalBalanceOne, subTotalBalanceTwo) - advance2;
                saldo2 = saldo1 * -1;
              } 
            }
            
            this.userOneHeader = new UserHeader(
              users[0].username!,
              balance1.subTotalBalance,
              advance1,
              saldo1
            );
            
            this.userTwoHeader = new UserHeader(
              users[1].username!,
              balance2.subTotalBalance ?? 0,
              advance2,
              saldo2
            );
          },
          error: (err) => console.error('Erro ao buscar balances:', err)
        });
      },
      error: (err) => console.error('Erro ao buscar usuários:', err)
    });
  }  

  private calculateSaldoDefault(subTotalOne: number, subTotalTwo: number): number {
    return (subTotalOne - subTotalTwo) / 2;
  }

  getUserBalance(userName: string): Observable<BalanceResponse> {
    return this.entryService.getUserTotal(userName).pipe(
      catchError((err) => {
        console.error('Erro ao buscar total do usuário:', err);
        return of(new BalanceResponse(0, 0)); // fallback seguro
      })
    );
  }

  handleDialogClose() {
    this.shouldReloadTable = true;
  }

}
