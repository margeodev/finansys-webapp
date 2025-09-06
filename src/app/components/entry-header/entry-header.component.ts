import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
import { SharedStateService } from '../../shared/service/shared-state-service';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Button, Card, Dialog, EntryFormComponent],
  templateUrl: './entry-header.component.html',
  styleUrl: './entry-header.component.css'
})
export class EntryHeaderComponent implements OnInit {

  @Input() userName: string = '';
  @Output() dialogClosed = new EventEmitter<void>();
  visible: boolean = false;
  isEditing: boolean = false;
  subTotal: number | null = null;
  saldo: number | null = null;

  constructor(public sharedState: SharedStateService) { }

  ngOnInit(): void {
    if (this.userName.toLowerCase() === 'marcio') {
      this.sharedState.totalUserOne$.subscribe(t => this.subTotal = t);
      this.sharedState.saldoUserOne$.subscribe(s => this.saldo = s);
    } else if (this.userName.toLowerCase() === 'ana') {
      this.sharedState.totalUserTwo$.subscribe(t => this.subTotal = t);
      this.sharedState.saldoUserTwo$.subscribe(s => this.saldo = s);
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
