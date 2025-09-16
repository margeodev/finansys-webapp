import { Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { Button } from "primeng/button";
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
import { Divider } from "primeng/divider";
import { UserHeader } from '../../pages/entries/model/user-header.model';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Button, Card, Dialog, EntryFormComponent, Divider],
  templateUrl: './entry-header.component.html',
  styleUrl: './entry-header.component.css'
})
export class EntryHeaderComponent implements OnInit, OnChanges {
  @Input() userHeader: UserHeader | null = null;
  visible: boolean = false;
  subTotal: number | null = null;
  advance: number | null = null;
  saldo: number | null = null;
  userName: string = '';

  constructor(private entryEvents: EntryEventsService) {}

  ngOnInit(): void {
    this.showValues();
    this.handleCloseDialogEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userHeader']) {
      this.showValues();
    }
  }

  showValues(): void {
    this.userName = this.userHeader!.userName ?? '';
    this.subTotal = this.userHeader!.subtotal ?? 0;
    this.advance = this.userHeader!.advance ?? 0;
    this.saldo = this.userHeader!.balance ?? 0;    
  }

  showCreateDialog() {
    this.visible = true;
  }

  onCloseDialog() {    
    this.visible = false;
  }

  private handleCloseDialogEvent() {
    this.entryEvents.dialogState$.subscribe(isOpen => {
      this.visible = isOpen;
    });
  }

}
