import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-entry-form',
  imports: [ButtonModule, ReactiveFormsModule, InputTextModule, CommonModule, Checkbox, InputNumberModule, SelectModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent implements OnInit {
  entries: Entry[] = [];
  visible: boolean = false;
  isPersonal: boolean = false;
  @Input() entryToEdit: any | null = null;
  @Input() isEditing: boolean = false;
  @Input() userId: string | null | undefined = null;
  categories: { id: string; description: string }[] = [];

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private entryEvents: EntryEventsService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categories?isActive=true`).subscribe({
      next: (data) => this.categories = data.map(c => ({ id: c.id, description: c.description })),
      error: () => console.error('Erro ao carregar categorias')
    });
  }

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
