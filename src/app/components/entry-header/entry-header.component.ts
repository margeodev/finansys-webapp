import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";
import { EntryFormComponent } from '../entry-form/entry-form.component';
import { CommonModule } from '@angular/common';
import { UserHeader } from '../../pages/entries/model/user-header.model';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { Entry } from '../../pages/entries/model/entry.model';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-entry-header',
  imports: [CommonModule, Card, Dialog, EntryFormComponent, BrlPipe, TooltipModule],
  templateUrl: './entry-header.component.html',
  styleUrl: './entry-header.component.css'
})
export class EntryHeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userHeader: UserHeader | null = null;
  @Input() entries: Entry[] = [];
  visible: boolean = false;
  private destroy$ = new Subject<void>();
  subTotal: number | null = null;
  advance: number | null = null;
  saldo: number | null = null;
  userName: string = '';
  totalShared: number | null = null;
  totalPersonal: number | null = null;

  get totalTooltip(): string {
    const recorrentes = this.entries
      .filter(e => !e.isPersonal && e.recurrenceRuleId)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const avulsas = (this.subTotal ?? 0) - recorrentes;
    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return `Recorrentes: ${fmt(recorrentes)}\nAvulsas: ${fmt(avulsas)}`;
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleCloseDialogEvent() {
    this.entryEvents.dialogState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.visible = isOpen;
      });
  }

}
