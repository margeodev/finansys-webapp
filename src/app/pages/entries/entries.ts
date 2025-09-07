import { DividerModule } from "primeng/divider";
import { EntryUserComponent } from "../../components/entry-user/entry-user.component";
import { SharedStateService } from "../../shared/service/shared-state-service";
import { AuthService } from "../login/service/auth.service";
import { EntryService } from "./service/entry.service";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { forkJoin } from "rxjs";
import { CustomBreadcrumb } from "../../shared/breadcrumb/custom-breadcrumb";
import { PageHeader } from "../../shared/page-header/page-header";

@Component({
  selector: 'app-entries',
  imports: [CustomBreadcrumb, PageHeader, CommonModule, DividerModule, EntryUserComponent],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries implements OnInit {

  user: string = '';

  constructor(
    private authService: AuthService,
    private entryService: EntryService,
    private sharedState: SharedStateService
  ) { }

  ngOnInit(): void {
    const userName = this.authService.getLoggedUser();
    this.user = userName ? userName.username : '';
    this.getTotalToUsers();
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


  private getTotalToUsers(): void {
    forkJoin([
      this.entryService.getUserTotal('Marcio'),
      this.entryService.getUserTotal('Ana Flavia')
    ]).subscribe({
      next: ([totalOne, totalTwo]) => {
        this.sharedState.totalUserOne$.next(totalOne);
        this.sharedState.totalUserTwo$.next(totalTwo);
        this.calculateSaldo(totalOne, totalTwo);
      },
      error: (err) => console.error('Erro ao buscar totais:', err)
    });
  }
}
