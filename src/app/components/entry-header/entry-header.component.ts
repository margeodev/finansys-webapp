import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
import { Divider } from "primeng/divider";
import { EntryService } from '../../pages/entries/service/entry.service';
import { UserHeader } from '../../pages/entries/model/user-header.model';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Button, Card, Dialog, EntryFormComponent, Divider],
  templateUrl: './entry-header.component.html',
  styleUrl: './entry-header.component.css'
})
export class EntryHeaderComponent implements OnInit {
  @Input() userHeader: UserHeader | null = null;
  @Output() dialogClosed = new EventEmitter<void>();
  visible: boolean = false;
  isEditing: boolean = false;
  subTotal: number | null = null;
  advance: number | null = null;
  saldo: number | null = null;
  userName: string = '';
  constructor(public entryService: EntryService) { }

  ngOnInit(): void {
    this.userName = this.userHeader!.userName ?? '';
    this.subTotal = this.userHeader!.subtotal ?? 0;
    this.advance = this.userHeader!.advance ?? 0;
    this.saldo = this.userHeader!.balance ?? 0;    
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
