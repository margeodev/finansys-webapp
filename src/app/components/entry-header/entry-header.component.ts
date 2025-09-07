import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
import { SharedStateService } from '../../shared/service/shared-state-service';
import { User } from '../../pages/login/model/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Button, Card, Dialog, EntryFormComponent],
  templateUrl: './entry-header.component.html',
  styleUrl: './entry-header.component.css'
})
export class EntryHeaderComponent implements OnChanges {

  @Input() user: User | null = null;
  @Output() dialogClosed = new EventEmitter<void>();

  visible: boolean = false;
  isEditing: boolean = false;
  subTotal: number | null = null;
  saldo: number | null = null;
  userName: string = '';

  private totalSub?: Subscription;
  private saldoSub?: Subscription;

  constructor(public sharedState: SharedStateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      const user = changes['user'].currentValue as User;

      if (!user || typeof user.id !== 'number') {
        console.warn('User inválido ou incompleto:', user);
        return;
      }

      this.userName = user.username ?? '';

      // Limpa inscrições anteriores
      this.totalSub?.unsubscribe();
      this.saldoSub?.unsubscribe();

      if (user.id === 1) {
        this.totalSub = this.sharedState.totalUserOne$.subscribe(t => this.subTotal = t);
        this.saldoSub = this.sharedState.saldoUserOne$.subscribe(s => this.saldo = s);
      } else if (user.id === 2) {
        this.totalSub = this.sharedState.totalUserTwo$.subscribe(t => this.subTotal = t);
        this.saldoSub = this.sharedState.saldoUserTwo$.subscribe(s => this.saldo = s);
      }
    }
  }


  showCreateDialog() {
    this.isEditing = false;
    this.visible = true;
  }

  onCloseDialog() {
    this.dialogClosed.emit();
    this.visible = false;
  }
}
