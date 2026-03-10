import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Entry } from '../../pages/entries/model/entry.model';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationType } from '../../shared/notification-type';
import { MessageService } from 'primeng/api';
import { EntryService } from '../../pages/entries/service/entry.service';
import { EntryRequest } from '../../pages/entries/model/entryRequest.model';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';
import { Checkbox } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-entry-form',
  imports: [ButtonModule, ReactiveFormsModule, InputTextModule, CommonModule, Checkbox, InputNumberModule, SelectModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent {
  entries: Entry[] = [];
  visible: boolean = false;
  isPersonal: boolean = false;
  @Input() entryToEdit: any | null = null;
  @Input() isEditing: boolean = false;
  @Input() userId: number | null | undefined = null;
  categories = [
    { id: '1', description: 'Moradia' },
    { id: '2', description: 'Mercado' },
    { id: '3', description: 'Contas (água, luz, internet)' },
    { id: '4', description: 'Transporte' },
    { id: '5', description: 'Lazer' },
    { id: '6', description: 'Saúde' },
    { id: '7', description: 'Restaurantes / Comida fora' },
    { id: '8', description: 'Manutenção / Reforma' },
    { id: '9', description: 'Padaria' },
    { id: '10', description: 'Farmácia' },
    { id: '11', description: 'Outros' },
    { id: '12', description: 'Pet' },
    { id: '13', description: 'Carro' },
  ];

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private entryEvents: EntryEventsService
  ) { }

  form = new FormGroup({
    description: new FormControl('', [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    categoryId: new FormControl<string | null>(null, [Validators.required]),
    isPersonal: new FormControl(false),
  });

  saveEntry(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // força exibir mensagens de erro
      return;
    }
    const formValue = this.form.value;
    const entry = new EntryRequest(
      formValue.description!,
      formValue.amount!,
      formValue.categoryId!,
      false,
      formValue.isPersonal!,
      this.userId ?? undefined
    );
    this.createEntry(entry);
  }

  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }

  private createEntry(entryRequest: EntryRequest): void {    
    this.service.create(entryRequest).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Registro incluido com sucesso!');
        this.form.reset();
        this.entryEvents.notifyEntryCreated();
        this.entryEvents.setDialogState(false);
      },
      error: () => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao incluir registro.');
      }
    });
  }

  onCancel() {
    this.form.reset();
    this.entryEvents.setDialogState(false);
  }

  convertToEntryRequest(entry: Entry): EntryRequest {
    return new EntryRequest(
      entry.description || '',
      entry.amount || '',
      entry.category?.id || ''
    );
  }

}
