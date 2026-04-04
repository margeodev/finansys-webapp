import { Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
import { UserHeader } from '../../pages/entries/model/user-header.model';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';
import { BrlPipe } from '../../shared/pipes/brl.pipe';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Card, Dialog, EntryFormComponent, BrlPipe],
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
  totalShared: number | null = null;
  totalPersonal: number | null = null;

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
    this.totalShared = this.userHeader!.totalShared ?? 0;
    this.totalPersonal = this.userHeader!.totalPersonal ?? 0;
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
