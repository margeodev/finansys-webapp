import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
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
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-entry-form',
  imports: [ButtonModule, ReactiveFormsModule, InputTextModule, CommonModule, Checkbox, InputNumberModule, SelectModule, DatePickerModule, SelectButtonModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent implements OnInit {
  @Input() userId: number | null | undefined = null;
  categories: { id: number; description: string }[] = [];

  recurrenceTypeOptions = [
    { label: 'Conta fixa', value: 'fixed' },
    { label: 'Parcelado', value: 'installment' },
  ];

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private entryEvents: EntryEventsService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categories?isActive=true`).subscribe({
      next: (data) => this.categories = data.map(c => ({ id: Number(c.id), description: c.description })),
      error: () => console.error('Erro ao carregar categorias')
    });
  }

  form = new FormGroup({
    description: new FormControl('', [Validators.required]),
    amount: new FormControl(null, [Validators.required]),
    categoryId: new FormControl<number | null>(null, [Validators.required]),
    date: new FormControl<Date>(new Date(), [Validators.required]),
    isPersonal: new FormControl(false),
    isRecurring: new FormControl(false),
    recurrenceType: new FormControl<'fixed' | 'installment'>('fixed'),
    totalInstallments: new FormControl<number | null>(null),
  });

  get isRecurring(): boolean {
    return !!this.form.controls['isRecurring'].value;
  }

  get isInstallment(): boolean {
    return this.form.controls['recurrenceType'].value === 'installment';
  }

  saveEntry(): void {
    if (this.isRecurring && this.isInstallment) {
      const total = this.form.controls['totalInstallments'].value;
      if (!total || total < 2) {
        this.form.controls['totalInstallments'].setErrors({ required: true });
        this.form.markAllAsTouched();
        return;
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const date = formValue.date instanceof Date
      ? formValue.date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const recurrence = this.isRecurring
      ? {
          type: formValue.recurrenceType as 'fixed' | 'installment',
          ...(formValue.recurrenceType === 'installment' && { totalInstallments: formValue.totalInstallments! }),
        }
      : null;

    const entry = new EntryRequest(
      formValue.description!,
      formValue.amount!,
      formValue.categoryId!,
      false,
      formValue.isPersonal!,
      this.userId ?? undefined,
      date,
      recurrence
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
        this.form.reset({ date: new Date(), isPersonal: false, isRecurring: false, recurrenceType: 'fixed' });
        this.entryEvents.notifyEntryCreated();
        this.entryEvents.setDialogState(false);
      },
      error: () => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao incluir registro.');
      }
    });
  }

  onCancel() {
    this.form.reset({ date: new Date(), isPersonal: false, isRecurring: false, recurrenceType: 'fixed' });
    this.entryEvents.setDialogState(false);
  }
}
