import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DividerModule } from 'primeng/divider';
import { EntryService } from './service/entry.service';
import { CommonModule } from '@angular/common';
import { CustomBreadcrumb } from '../../shared/breadcrumb/custom-breadcrumb';
import { PageHeader } from '../../shared/page-header/page-header';
import { UserService } from './service/user.service';
import { User } from '../login/model/user.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserHeader } from './model/user-header.model';
import { Entry } from './model/entry.model';
import { EntryHeaderComponent } from '../../components/entry-header/entry-header.component';
import { EntryTableComponent } from '../../components/entry-table/entry-table.component';
import { EntryEventsService } from './service/entry-event.service';
import { SelectedMonthService } from '../../shared/service/selected-month.service';
import { Button } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';
import { CurrentUserService } from '../../shared/current-user.service';

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
  styleUrl: './entries.css',
})
export class Entries implements OnInit, OnDestroy {
  users: User[] = [];
  userOneHeader: UserHeader | null = null;
  userTwoHeader: UserHeader | null = null;
  userOneEntries: Entry[] = [];
  userTwoEntries: Entry[] = [];
  totalExpenses: number = 0;

  isAdmin = false;
  currentUserName: string | null = null;
  currentUserIndex: number | null = null;

  mesAnoSelecionado: Date | null = null;
  minDate: Date | undefined;
  maxDate: Date | undefined;
  isLoading: boolean = false;

  dateParam: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private entryService: EntryService,
    private entryEvents: EntryEventsService,
    private selectedMonthService: SelectedMonthService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.handleDate();

    this.currentUserService.getCurrentUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe((info) => {
        this.isAdmin = info.role === 'admin';
        this.currentUserName = info.username;
        this.loadUsersData();
        this.listenEntryEvents();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    if (!this.mesAnoSelecionado) {
      console.warn('Nenhuma data selecionada');
      return;
    }

    const data = new Date(this.mesAnoSelecionado);
    const dataFormatada = new Date(data.getFullYear(), data.getMonth(), 1);
    this.dateParam = dataFormatada.toISOString().split('T')[0];

    this.selectedMonthService.setSelectedMonth(dataFormatada);
    this.isLoading = true;
    this.loadUsersData(this.dateParam);
  }

  private handleDate() {
    const hoje = new Date();
    this.minDate = new Date(2025, 8, 1);
    this.maxDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.mesAnoSelecionado = this.maxDate;
    this.selectedMonthService.setSelectedMonth(this.maxDate);
  }

  private listenEntryEvents() {
    this.entryEvents.entryCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsersData(this.dateParam ?? undefined));

    this.entryEvents.entryUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsersData(this.dateParam ?? undefined));
  }

  private loadUsersData(dateParam?: string): void {
    this.userService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;

          if (!this.isAdmin && this.currentUserName) {
            const idx = users.findIndex(
              (u) => u.username?.toLowerCase() === this.currentUserName!.toLowerCase()
            );
            this.currentUserIndex = idx >= 0 ? idx : null;
          } else {
            this.currentUserIndex = null;
          }

          if (this.isAdmin) {
            forkJoin([
              this.entryService.getByUserAndMonth(users[0].id!, dateParam),
              this.entryService.getByUserAndMonth(users[1].id!, dateParam),
            ]).pipe(takeUntil(this.destroy$)).subscribe({
              next: ([entries1, entries2]) => {
                this.userOneEntries = entries1;
                this.userTwoEntries = entries2;
                this.buildAdminHeaders(users, entries1, entries2);
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Erro ao buscar lançamentos:', err);
                this.isLoading = false;
              }
            });
            return;
          }

          const idx = this.currentUserIndex ?? 0;
          const current = users[idx];
          if (!current?.id) {
            console.warn('Usuário atual não encontrado na lista fixa.');
            return;
          }

          this.entryService.getByUserAndMonth(current.id, dateParam)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (entries) => {
                const balance = this.entryService.computeBalance(entries);
                const subTotal = balance.subTotalBalance ?? 0;
                const advance = (balance.totalAdvanceBalance ?? 0) / 2;
                const header = new UserHeader(current.id, current.username!, subTotal, advance, subTotal);

                if (idx === 0) {
                  this.userOneEntries = entries;
                  this.userTwoEntries = [];
                  this.userOneHeader = header;
                  this.userTwoHeader = null;
                } else {
                  this.userTwoEntries = entries;
                  this.userOneEntries = [];
                  this.userTwoHeader = header;
                  this.userOneHeader = null;
                }

                this.totalExpenses = header.subtotal ?? 0;
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Erro ao buscar lançamentos:', err);
                this.isLoading = false;
              }
            });
        },
        error: (err) => {
          console.error('Erro ao buscar usuários:', err);
          this.isLoading = false;
        }
      });
  }

  private buildAdminHeaders(users: User[], entries1: Entry[], entries2: Entry[]): void {
    const balance1 = this.entryService.computeBalance(entries1);
    const balance2 = this.entryService.computeBalance(entries2);

    let subTotalOne = balance1.subTotalBalance ?? 0;
    let subTotalTwo = balance2.subTotalBalance ?? 0;
    let advance1 = (balance1.totalAdvanceBalance ?? 0) / 2;
    let advance2 = (balance2.totalAdvanceBalance ?? 0) / 2;

    this.totalExpenses = (subTotalOne + subTotalTwo) + advance1 + advance2;

    subTotalOne = subTotalOne - advance1;
    subTotalTwo = subTotalTwo - advance2;

    const total1 = subTotalOne + advance1 + advance2;
    const total2 = subTotalTwo + advance2 + advance1;
    const saldo1 = this.calculateSaldo(subTotalOne, subTotalTwo);

    this.userOneHeader = new UserHeader(users[0].id!, users[0].username!, total1, advance1, saldo1);
    this.userTwoHeader = new UserHeader(users[1].id!, users[1].username!, total2, advance2, -saldo1);
  }

  private calculateSaldo(subTotalOne: number, subTotalTwo: number): number {
    if (subTotalOne === subTotalTwo) return 0;
    return (subTotalOne - subTotalTwo) / 2;
  }
}
