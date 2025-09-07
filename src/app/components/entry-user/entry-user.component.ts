import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { Entry } from '../../pages/entries/model/entry.model';
import { EntryRequest } from '../../pages/entries/model/entryRequest.model';
import { AuthService } from '../../pages/login/service/auth.service';
import { EntryHeaderComponent } from "../entry-header/entry-header.component";
import { EntryTableComponent } from "../entry-table/entry-table.component";
import { User } from '../../pages/login/model/user.model';

@Component({
  selector: 'app-entry-user',
  imports: [CardModule,
    ButtonModule, DialogModule, InputNumberModule,
    CommonModule, DividerModule,
    ChipModule, TableModule, EntryHeaderComponent, EntryTableComponent],
  templateUrl: './entry-user.component.html',
  styleUrl: './entry-user.component.css'
})
export class EntryUserComponent {

  @Input() user: User | null = null;
  @Input() totalAmountUser: number = 0;
  isEditing: boolean = false;
  entries: Entry[] = [];
  entryToEdit: EntryRequest = new EntryRequest();
  visible: boolean = false;
  deveExibirBotaoAdicionar: boolean = false;

  shouldReloadTable: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  showCreateDialog() {
    this.isEditing = false;
    this.visible = true;
  }

  handleDialogClose() {
    this.shouldReloadTable = true;
  }

  verifyUserPermission() {
    const user = this.authService.getLoggedUser();
    if (this.user === user?.username) {
      this.deveExibirBotaoAdicionar = true;
    } else {
      this.deveExibirBotaoAdicionar = false;
    }
  }
}