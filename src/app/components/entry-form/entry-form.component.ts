import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationType } from '../../shared/notification-type';
import { MessageService } from 'primeng/api';
import { EntryService } from '../../pages/entries/service/entry.service';
import { EntryRequest, EntryUpdateRequest } from '../../pages/entries/model/entryRequest.model';
import { Entry } from '../../pages/entries/model/entry.model';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';
import { Checkbox } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { environment } from '../../../environments/environment';
import { DEFAULT_DESCRIPTIONS, getCategoryColor, getCategoryIcon, sortCategories } from '../../shared/category-defaults';

@Component({
  selector: 'app-entry-form',
  imports: [ButtonModule, ReactiveFormsModule, InputTextModule, CommonModule, Checkbox, InputNumberModule, DatePickerModule, SelectButtonModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent implements OnInit, OnChanges {
  @Input() userId: number | null | undefined = null;
  // Quando informado, o formulário edita esta despesa em vez de criar uma nova
  @Input() entry: Entry | null = null;
  @Output() closed = new EventEmitter<void>();
  categories: { id: number; description: string }[] = [];
  isSaving: boolean = false;
  // Última descrição preenchida automaticamente; o que a pessoa digitou não é sobrescrito
  private autoDescription: string | null = null;

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
      next: (data) => this.categories = sortCategories(data.map(c => ({ id: Number(c.id), description: c.description }))),
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
    applyToNext: new FormControl(false),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entry'] && this.entry) {
      this.fillFromEntry(this.entry);
    }
  }

  categoryIcon = getCategoryIcon;
  categoryColor = getCategoryColor;

  // Cores claras (ex.: amarelo da Farmácia) pedem texto escuro quando o botão está selecionado
  isLightColor(hex: string): boolean {
    const n = parseInt(hex.replace('#', ''), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
  }

  get selectedCategoryId(): number | null {
    return this.form.controls['categoryId'].value;
  }

  selectCategory(categoryId: number): void {
    const control = this.form.controls['categoryId'];
    control.setValue(categoryId);
    control.markAsTouched();
    this.onCategoryChange(categoryId);
  }

  onCategoryChange(categoryId: number | null): void {
    const control = this.form.controls['description'];
    const current = (control.value ?? '').trim();
    if (current !== '' && current !== this.autoDescription) return;

    const suggestion = categoryId != null ? DEFAULT_DESCRIPTIONS[categoryId] : undefined;
    if (suggestion) {
      control.setValue(suggestion);
      this.autoDescription = suggestion;
    } else if (this.autoDescription) {
      // Troca para uma categoria sem sugestão: limpa o texto automático
      control.setValue('');
      this.autoDescription = null;
    }
  }

  get isEditMode(): boolean {
    return !!this.entry;
  }

  get isRecurringEntry(): boolean {
    return !!this.entry?.recurrenceRuleId;
  }

  private fillFromEntry(entry: Entry): void {
    // 'YYYY-MM-DD' montado no fuso local, para não voltar um dia
    const [y, m, d] = String((entry as any).date ?? '').split('-').map(Number);
    this.autoDescription = null;
    this.form.reset({
      description: entry.description ?? '',
      amount: entry.amount != null ? Number(entry.amount) as any : null,
      categoryId: entry.category?.id ?? null,
      date: y && m && d ? new Date(y, m - 1, d) : new Date(),
      isPersonal: !!entry.isPersonal,
      isRecurring: false,
      recurrenceType: 'fixed',
      applyToNext: false,
    });
  }

  private toDateString(value: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  get isRecurring(): boolean {
    return !!this.form.controls['isRecurring'].value;
  }

  get isInstallment(): boolean {
    return this.form.controls['recurrenceType'].value === 'installment';
  }

  saveEntry(): void {
    if (this.isSaving) {
      return;
    }

    if (this.isEditMode) {
      this.saveEdit();
      return;
    }

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

  private saveEdit(): void {
    if (this.form.invalid || !this.entry?.id) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const changes: EntryUpdateRequest = {
      description: formValue.description!.trim(),
      amount: Number(formValue.amount),
      categoryId: formValue.categoryId!,
      date: this.toDateString(formValue.date instanceof Date ? formValue.date : new Date()),
      isPersonal: !!formValue.isPersonal,
    };
    const updateAll = this.isRecurringEntry && !!formValue.applyToNext;

    this.isSaving = true;
    this.service.edit(this.entry.id, changes, updateAll).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Registro alterado com sucesso!');
        this.entryEvents.notifyEntryUpdated();
        this.isSaving = false;
        this.closed.emit();
      },
      error: () => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao alterar registro.');
        this.isSaving = false;
      }
    });
  }

  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }

  private createEntry(entryRequest: EntryRequest): void {
    this.isSaving = true;
    this.service.create(entryRequest).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Registro incluido com sucesso!');
        this.autoDescription = null;
        this.form.reset({ date: new Date(), isPersonal: false, isRecurring: false, recurrenceType: 'fixed' });
        this.entryEvents.notifyEntryCreated();
        this.entryEvents.setDialogState(false);
        this.isSaving = false;
      },
      error: () => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao incluir registro.');
        this.isSaving = false;
      }
    });
  }

  onCancel() {
    if (this.isEditMode) {
      this.closed.emit();
      return;
    }
    this.autoDescription = null;
    this.form.reset({ date: new Date(), isPersonal: false, isRecurring: false, recurrenceType: 'fixed' });
    this.entryEvents.setDialogState(false);
  }
}
