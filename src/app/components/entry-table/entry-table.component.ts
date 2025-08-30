// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { MessageService, ConfirmationService } from 'primeng/api';
// import { Entry } from '../../pages/entries/model/entry.model';
// import { Message } from 'primeng/message';
// import { EntryService } from '../../pages/entries/service/entry.service';
// import { SkeletonModule } from 'primeng/skeleton';
// import { ButtonModule } from 'primeng/button';
// import { TableModule } from 'primeng/table';
// import { CommonModule } from '@angular/common';
// import { ChipModule } from 'primeng/chip';

// @Component({
//   selector: 'app-entry-table',
//   standalone: true,
//   imports: [
//     CommonModule,
//     SkeletonModule,
//     ButtonModule,
//     ChipModule,
//     TableModule
//   ],
//   templateUrl: './entry-table.component.html',
//   styleUrl: './entry-table.component.css'
// })
// export class EntryTableComponent {

//   @Input() entries: Entry[] = [{}];
//   @Output() onEdit = new EventEmitter<any>();
//   isLoading: boolean = true;
//   msgs: Message[] = [];

//   constructor(
//     private service: EntryService,
//     private messageService: MessageService,
//     private confirmationService: ConfirmationService,
//   ) {}
 
//   getCategoryIcon(categoryId: string): string {    
//     const iconsMap: { [key: string]: string } = {
//       '1': 'in_home_mode',          // Moradia
//       '2': 'shopping_cart_checkout',// Supermercado
//       '3': 'payments',              // Conta Consumo
//       '4': 'local_gas_station',     // Transporte
//       '5': 'celebration',           // Lazer
//       '6': 'home_health',           // Saúde
//       '7': 'restaurant',            // Bares e Restaurantes
//       '8': 'tools_power_drill',     // Manutenção Casa
//       '9': 'bakery_dining',         // Padaria
//       '10': 'local_pharmacy',       // Farmácia
//       '11': 'new_label',            // Outros
//       '12': 'pets',                 // Pets
//       '13': 'car_repair'            // Manutenção Carro
//     };

//     return iconsMap[categoryId] || 'help_outline';
// }

// }
