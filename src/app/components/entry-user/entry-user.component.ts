import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { NotificationType } from '../../shared/notification-type';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { EntryService } from '../../pages/entries/service/entry.service';
import { Entry } from '../../pages/entries/model/entry.model';
import { EntryRequest } from '../../pages/entries/model/entryRequest.model';
import { AuthService } from '../../pages/login/service/auth.service';
import { EntryHeaderComponent } from "../entry-header/entry-header.component";
import { EntryTableComponent } from "../entry-table/entry-table.component";
import { User } from '../../pages/login/model/user.model';

@Component({
  selector: 'app-entry-user',
  imports: [CardModule,
    ButtonModule, DialogModule, InputNumberModule,
    CommonModule, DividerModule,
    ChipModule, TableModule, EntryHeaderComponent, EntryTableComponent],
  templateUrl: './entry-user.component.html',
  styleUrl: './entry-user.component.css'
})
export class EntryUserComponent implements OnChanges {

  // @Input() userName: string = '';
  @Input() user: User | null = null;
  @Input() totalAmountUser: number = 0;
  isEditing: boolean = false;
  entries: Entry[] = [];
  entryToEdit: EntryRequest = new EntryRequest();
  visible: boolean = false;
  deveExibirBotaoAdicionar: boolean = false;

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {      
      this.loadEntries();
      this.verifyUserPermission();
    }
  }

  showCreateDialog() {
    this.isEditing = false;
    this.visible = true;
  }

  handleDialogClose() {
    this.loadEntries();
  }

  showEditDialog(entry: Entry) {
    this.entryToEdit = entry
    this.isEditing = true;
    this.visible = true;
  }

  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }

  verifyUserPermission() {
    const user = this.authService.getLoggedUser();
    if (this.user === user?.username) {
      this.deveExibirBotaoAdicionar = true;
    } else {
      this.deveExibirBotaoAdicionar = false;
    }
  }

  // ========================== INICIO TABELA ==========================

  private loadEntries(): void {    
    this.service.getByUserAndMonth(this.user!.username!).subscribe({
      next: (data) => {        
        this.entries = data;
      },
      error: (err) => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao carregar lançamentos');
      }
    });
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