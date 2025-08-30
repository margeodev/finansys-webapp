// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { CardModule } from 'primeng/card';
// import { EntryDialogComponent } from '../entry-dialog/entry-dialog.component';
// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
// import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-entry-header',
//   imports: [CardModule, CommonModule, ButtonModule, DialogModule, ReactiveFormsModule],
//   templateUrl: './entry-header.component.html',
//   styleUrl: './entry-header.component.css'
// })
// export class EntryHeaderComponent {

  // @Input() total: number = 0;
  // @Input() user: string = '';
  // @Input() deveExibirBotaoAdicionar: boolean = false;
  // @Output() onSavedEntry: EventEmitter<void> = new EventEmitter<void>();
  // @Input() entryToEdit: any | null = null;
  
  // handleSave(): void {
  //   this.onSavedEntry.emit();
  // }

//   visible: boolean = false;
//   deveExibirBotaoAdicionar: boolean = false;

//   form = new FormGroup({
//     description: new FormControl(''),
//     amount: new FormControl('')
//   });

//   showDialog() {
//     this.visible = true;
//   }

//   saveEntry() {
//     this.visible = false;
//   }

// }
