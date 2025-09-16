import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
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

@Component({
  selector: 'app-entry-table',
  imports: [TableModule, ChipModule, CommonModule, ButtonModule, ToggleSwitchModule, FormsModule, SkeletonModule],
  templateUrl: './entry-table.component.html',
  styleUrl: './entry-table.component.css'
})
export class EntryTableComponent implements OnChanges {

  @Input() userName: string | null = null;
  @Input() reload: boolean = false;
  
  entries: Entry[] = [];
  isLoading: boolean = false;
  isEditing: boolean = false;
  visible: boolean = false

  constructor(
    private service: EntryService,
    private messageService: MessageService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const reloadChanged = !!changes['reload'];
    // Sempre que reload mudar para true, recarrega
    if (reloadChanged) {
      this.loadEntries();
    }
  }

  private loadEntries(): void {
    this.isLoading = true;
    this.service.getByUserAndMonth(this.userName!).subscribe({
      next: (data) => {        
        this.entries = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(NotificationType.ERROR, '', 'Erro ao carregar lançamentos');
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
      '1': 'house',                         // Moradia
      '2': 'cart-shopping',                 // Supermercado
      '3': 'lightbulb-dollar',              // Conta Consumo
      '4': 'gas-pump',                      // Transporte
      '5': 'joystick',                      // Lazer
      '6': 'stethoscope',                   // Saúde
      '7': 'fork-knife',                    // Bares e Restaurantes
      '8': 'screwdriver-wrench',            // Manutenção Casa
      '9': 'croissant',                     // Padaria
      '10': 'prescription-bottle-medical',  // Farmácia
      '11': 'list',                         // Outros
      '12': 'cat',                          // Pets
      '13': 'car-wrench'                    // Manutenção Carro
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

    const variableName = colorMap[categoryId] || '--color-blue'; // fallback
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  }

}
