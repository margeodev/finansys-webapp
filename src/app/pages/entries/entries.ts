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
import { EntryEventsService } from "./service/entry-event.service";
import { SelectedMonthService } from "../../shared/service/selected-month.service";
import { Button } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { TabsModule } from "primeng/tabs";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-entries',
  imports: [
    CommonModule,
    CustomBreadcrumb,
    ProgressSpinnerModule,
    FormsModule,
    PageHeader,
    DividerModule,
    EntryHeaderComponent,
    EntryTableComponent,
    TabsModule,
    DatePickerModule,
    Button
  ],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries implements OnInit {
  users: User[] = [];
  userNameOne: string = '';
  userNameTwo: string = '';
  userOneHeader: UserHeader | null = null;
  userTwoHeader: UserHeader | null = null;
  shouldReloadTable: boolean = false;
  totalExpenses: number = 0;

  mesAnoSelecionado: Date | null = null;
  minDate: Date | undefined;
  maxDate: Date | undefined;
  isLoading: boolean = false;

  dateParam: string | null = null; // 🔥 data formatada (yyyy-MM-01)

  constructor(
    private userService: UserService,
    private entryService: EntryService,
    private entryEvents: EntryEventsService,
    private selectedMonthService: SelectedMonthService
  ) {}

  ngOnInit(): void {
    this.loadUsersData();
    this.listenEntryCreatedEvent();
    this.handleDate();
  }

  load() {
    if (!this.mesAnoSelecionado) {
      console.warn('Nenhuma data selecionada');
      return;
    }

    this.isLoading = true;

    // força o dia = 1
    const data = new Date(this.mesAnoSelecionado);
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dataFormatada = new Date(ano, mes, 1);

    // yyyy-MM-dd
    this.dateParam = dataFormatada.toISOString().split('T')[0];
    console.log('Consultando período:', this.dateParam);

    // atualiza seleção compartilhada de mês (yyyy-MM-01)
    this.selectedMonthService.setSelectedMonth(dataFormatada);

    this.loadUsersData(this.dateParam);

    setTimeout(() => {
      this.isLoading = false;
      this.shouldReloadTable = !this.shouldReloadTable; // força reload tabelas
    }, 1000);
  }

  private handleDate() {
    const hoje = new Date();
    this.minDate = new Date(2025, 8, 1);
    this.maxDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // seleciona por padrão o mês atual e propaga para o serviço
    this.mesAnoSelecionado = this.maxDate;
    this.selectedMonthService.setSelectedMonth(this.maxDate);
  }

  private listenEntryCreatedEvent() {
    this.entryEvents.entryCreated$.subscribe(() => {
      this.loadUsersData(this.dateParam ?? undefined);
      this.shouldReloadTable = !this.shouldReloadTable;
    });

    this.entryEvents.entryUpdated$.subscribe(() => {
      this.loadUsersData(this.dateParam ?? undefined);
    });
  }

  private loadUsersData(dateParam?: string): void {
    console.log('loading users data, date =', dateParam);

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;

        forkJoin([
          this.getUserBalance(users[0].username!, dateParam),
          this.getUserBalance(users[1].username!, dateParam)
        ]).subscribe({
          next: ([balance1, balance2]) => {
            let subTotalBalanceOne = balance1.subTotalBalance ?? 0;
            let subTotalBalanceTwo = balance2.subTotalBalance ?? 0;
            let advance1 = balance1.totalAdvanceBalance ?? 0;
            let advance2 = balance2.totalAdvanceBalance ?? 0;
            this.totalExpenses =
              subTotalBalanceOne +
              subTotalBalanceTwo +
              (advance1 + advance2) / 2;

            advance1 = advance1 / 2;
            advance2 = advance2 / 2;
            subTotalBalanceOne = subTotalBalanceOne - advance1;
            subTotalBalanceTwo = subTotalBalanceTwo - advance2;

            let total1 = subTotalBalanceOne + advance1 + advance2;
            let total2 = subTotalBalanceTwo + advance2 + advance1;

            let saldo1: number = this.calculateSaldoDefault(
              subTotalBalanceOne,
              subTotalBalanceTwo
            );
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

  private calculateSaldoDefault(
    subTotalOne: number,
    subTotalTwo: number
  ): number {
    if (subTotalOne === subTotalTwo) {
      return 0;
    }
    return (subTotalOne - subTotalTwo) / 2;
  }

  private getUserBalance(
    userName: string,
    dateParam?: string
  ): Observable<BalanceResponse> {
    return this.entryService.getUserTotal(userName, dateParam).pipe(
      catchError((err) => {
        console.error('Erro ao buscar total do usuário:', err);
        return of(new BalanceResponse(0, 0));
      })
    );
  }

  handleCreatedEntry() {
    this.loadUsersData(this.dateParam ?? undefined);
    this.shouldReloadTable = !this.shouldReloadTable;
  }
}
