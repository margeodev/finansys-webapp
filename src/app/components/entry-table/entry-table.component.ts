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
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';

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
    ConfirmDialog
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './entry-table.component.html',
  styleUrl: './entry-table.component.css'
})
export class EntryTableComponent implements OnChanges {
  @Input() userName: string | null = null;
  @Input() dateParam: string | null = null; // 🔥 recebe a data do pai
  @Input() reload: boolean = false;

  entries: Entry[] = [];
  isLoading: boolean = false;
  isEditing: boolean = false;
  visible: boolean = false;

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private entryEventService: EntryEventsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const reloadChanged = !!changes['reload'];
    if (reloadChanged) {
      this.loadEntries();
    }
  }

  private loadEntries(): void {
    if (!this.userName) return;

    this.isLoading = true;
    this.service.getByUserAndMonth(this.userName, this.dateParam ?? undefined).subscribe({
      next: (data) => {
        this.entries = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showMessage(NotificationType.ERROR, '', 'Erro ao carregar lançamentos');
      }
    });
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
      1: '--color-blue',
      2: '--color-green',
      3: '--color-orange',
      4: '--color-purple',
      5: '--color-deep-orange',
      6: '--color-cyan',
      7: '--color-indigo',
      8: '--color-pink',
      9: '--color-light-green',
      10: '--color-yellow',
      11: '--color-blue-grey',
      12: '--color-teal',
      13: '--color-lime'
    };

    const variableName = colorMap[categoryId] || '--color-blue';
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  }
}