import { Component, OnInit, OnDestroy } from "@angular/core";
import { forkJoin, Subscription } from "rxjs";
import { DividerModule } from "primeng/divider";
import { EntryUserComponent } from "../../components/entry-user/entry-user.component";
import { SharedStateService } from "../../shared/service/shared-state-service";
import { AuthService } from "../login/service/auth.service";
import { EntryService } from "./service/entry.service";
import { CommonModule } from "@angular/common";
import { CustomBreadcrumb } from "../../shared/breadcrumb/custom-breadcrumb";
import { PageHeader } from "../../shared/page-header/page-header";
import { UserService } from "./service/user.service";
import { User } from "../login/model/user.model";

@Component({
  selector: 'app-entries',
  imports: [CustomBreadcrumb, PageHeader, CommonModule, DividerModule, EntryUserComponent],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries implements OnInit, OnDestroy {
  userOne: User | null = null;
  userTwo: User | null = null;

  private userSub?: Subscription;
  private totalSub?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private entryService: EntryService,
    private sharedState: SharedStateService
  ) {}

  ngOnInit(): void {
    const userName = this.authService.getLoggedUser();
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.totalSub?.unsubscribe();
  }

  private calculateSaldo(one: number, two: number): void {
    const diferenca = Math.abs(one - two) / 2;

    if (one > two) {
      this.sharedState.saldoUserOne$.next(diferenca);
      this.sharedState.saldoUserTwo$.next(-diferenca);
    } else if (two > one) {
      this.sharedState.saldoUserOne$.next(-diferenca);
      this.sharedState.saldoUserTwo$.next(diferenca);
    } else {
      this.sharedState.saldoUserOne$.next(0);
      this.sharedState.saldoUserTwo$.next(0);
    }
  }

  private getTotalToUsers(userOneName: string, userTwoName: string): void {
    this.totalSub = forkJoin([
      this.entryService.getUserTotal(userOneName),
      this.entryService.getUserTotal(userTwoName)
    ]).subscribe({
      next: ([totalOne, totalTwo]) => {
        this.sharedState.totalUserOne$.next(totalOne);
        this.sharedState.totalUserTwo$.next(totalTwo);
        this.calculateSaldo(totalOne, totalTwo);
      },
      error: (err) => console.error('Erro ao buscar totais:', err)
    });
  }

  private getUsers(): void {
    this.userSub = this.userService.getAll().subscribe({
      next: (users) => {
        const userOne = users[0];
        const userTwo = users[1];

        if (userOne && userTwo) {
          this.sharedState.userOne$.next(userOne);
          this.sharedState.userTwo$.next(userTwo);
          this.userOne = userOne;
          this.userTwo = userTwo;

          this.getTotalToUsers(userOne.username!, userTwo.username!);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
  }
}
