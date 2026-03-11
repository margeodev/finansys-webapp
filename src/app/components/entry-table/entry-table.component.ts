import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntryService } from '../../pages/entries/service/entry.service';
import { NotificationType } from '../../shared/notification-type';
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
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './entry-table.component.html',
  styleUrl: './entry-table.component.css'
})
export class EntryTableComponent implements OnChanges {
  @Input() userName: string | null = null;
  @Input() userId: number | null = null;
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
        : this.allEntries;
    }
  }

  onToggleChange(event: any, entry: Entry): void {
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

  showEditDialog(entry: Entry) {
    this.isEditing = true;
    this.visible = true;
  }

  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }

  getCategoryIcon(categoryId: string): any {
    const iconsMap: { [key: string]: string } = {
      '1': 'house',
      '2': 'cart-shopping',
      '3': 'lightbulb-dollar',
      '4': 'gas-pump',
      '5': 'joystick',
      '6': 'stethoscope',
      '7': 'fork-knife',
      '8': 'screwdriver-wrench',
      '9': 'croissant',
      '10': 'prescription-bottle-medical',
      '11': 'list',
      '12': 'cat',
      '13': 'car-wrench'
    };
    return iconsMap[categoryId] || 'list';
  }

  getCategoryColor(categoryId: number): string {
    const colorMap: { [key: number]: string } = {
      1: '#1565C0',
      2: '#2E7D32',
      3: '#E65100',
      4: '#6A1B9A',
      5: '#BF360C',
      6: '#00838F',
      7: '#283593',
      8: '#AD1457',
      9: '#558B2F',
      10: '#F9A825',
      11: '#546E7A',
      12: '#00695C',
      13: '#827717'
    };

    return colorMap[categoryId] || '#1565C0';
  }
}
