import { Component, OnInit } from "@angular/core";
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
            let subTotalBalanceOne = balance1.subTotalBalance ?? 0;
            let subTotalBalanceTwo = balance2.subTotalBalance ?? 0;
            let advance1 = balance1.totalAdvanceBalance ?? 0;
            let advance2 = balance2.totalAdvanceBalance ?? 0;
            advance1 = advance1 / 2;
            advance2 = advance2 / 2;
            subTotalBalanceOne = subTotalBalanceOne - advance1;
            subTotalBalanceTwo = subTotalBalanceTwo - advance2;
            console.log('adiantamento 1:', advance1);
            console.log('adiantamento 2:', advance2);
            
            let total1 = subTotalBalanceOne + advance1 + advance2;
            let total2 = subTotalBalanceTwo + advance2 + advance1;

            let saldo1: number = this.calculateSaldoDefault(subTotalBalanceOne, subTotalBalanceTwo);
            let saldo2: number = -saldo1;

            this.userOneHeader = new UserHeader(
              users[0].username!,
              total1,
              advance1,
              saldo1
            );

            this.userTwoHeader = new UserHeader(
              users[1].username!,
              total2,
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
    if (subTotalOne === subTotalTwo) {
      return 0;
    }
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
