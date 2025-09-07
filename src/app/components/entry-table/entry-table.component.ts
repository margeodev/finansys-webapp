import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { EntryService } from '../../pages/entries/service/entry.service';
import { AuthService } from '../../pages/login/service/auth.service';
import { NotificationType } from '../../shared/notification-type';

@Component({
  selector: 'app-entry-table',
  imports: [],
  templateUrl: './entry-table.component.html',
  styleUrl: './entry-table.component.css'
})
export class EntryTableComponent {

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  // private loadEntries(): void {
  //   this.service.getByUserAndMonth(this.userName).subscribe({
  //     next: (data) => {
  //       this.entries = data;
  //     },
  //     error: (err) => {
  //       this.showMessage(NotificationType.ERROR, '', 'Erro ao carregar lançamentos');
  //     }
  //   });
  // }
}
