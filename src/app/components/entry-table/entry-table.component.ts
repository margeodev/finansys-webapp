import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntryService } from '../../pages/entries/service/entry.service';
import { Entry } from '../../pages/entries/model/entry.model';
import { TableModule } from "primeng/table";
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { BrlPipe } from '../../shared/pipes/brl.pipe';

@Component({
  selector: 'app-entry-table',
  imports: [
    TableModule,
    ChipModule,
    CommonModule,
    ButtonModule,
    ToggleSwitchModule,
    FormsModule,
    SkeletonModule,
    ConfirmDialogModule,
    ConfirmDialog,
    TruncatePipe,
    BrlPipe,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './entry-table.component.html',
  styleUrl: './entry-table.component.css'
})
export class EntryTableComponent implements OnChanges {
  @Input() userName: string | null = null;
  @Input() userId: string | null = null;
  @Input() dateParam: string | null = null;
  @Input() isPersonal: boolean = false;
  @Input() allEntries: Entry[] = [];

  entries: Entry[] = [];
  isEditing: boolean = false;
  visible: boolean = false;

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private entryEventService: EntryEventsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allEntries'] || changes['isPersonal']) {
      this.entries = this.isPersonal
        ? this.allEntries.filter(e => e.isPersonal)
        : this.allEntries.filter(e => !e.isPersonal);
    }
  }

  onToggleChange(_event: any, entry: Entry): void {
    const currentValue = entry.advancePayment;

    this.confirmationService.confirm({
      message: 'Deseja realmente alterar o pagamento antecipado?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.changeIsAdvancePayment(entry);
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmado',
          detail: 'Pagamento antecipado alterado'
        });
      },
      reject: () => {
        entry.advancePayment = !currentValue;
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelado',
          detail: 'Alteração não realizada'
        });
      }
    });
  }

  private changeIsAdvancePayment(entry: Entry): void {
    this.service.update(entry.id!, entry).subscribe({
      next: () => {
        this.entryEventService.notifyEntryUpdated();
      },
      error: () => {
        console.error('[EntryTable] Erro ao atualizar entrada');
      }
    });
  }

  showEditDialog(_entry: Entry) {
    this.isEditing = true;
    this.visible = true;
  }

  getCategoryIcon(description: string): string {
    const iconsMap: { [key: string]: string } = {
      'moradia':        'house',
      'supermercado':   'cart-shopping',
      'conta serviços': 'bolt',
      'transporte':     'gas-pump',
      'lazer':          'gamepad',
      'saúde':          'heart-pulse',
      'bares e rest.':  'utensils',
      'manut. casa':    'screwdriver-wrench',
      'padaria':        'mug-hot',
      'farmácia':       'pills',
      'outros':         'list',
      'pets':           'paw',
      'manut. carro':   'car',
    };
    return iconsMap[(description ?? '').toLowerCase()] || 'tag';
  }

  getCategoryColor(description: string): string {
    const colorMap: { [key: string]: string } = {
      'moradia':        '#1565C0',
      'supermercado':   '#2E7D32',
      'conta serviços': '#E65100',
      'transporte':     '#6A1B9A',
      'lazer':          '#BF360C',
      'saúde':          '#00838F',
      'bares e rest.':  '#283593',
      'manut. casa':    '#AD1457',
      'padaria':        '#558B2F',
      'farmácia':       '#F9A825',
      'outros':         '#546E7A',
      'pets':           '#00695C',
      'manut. carro':   '#827717',
    };
    return colorMap[(description ?? '').toLowerCase()] || '#546E7A';
  }
}
