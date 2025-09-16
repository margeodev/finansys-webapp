import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from "primeng/button";
import { Entry } from '../../pages/entries/model/entry.model';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationType } from '../../shared/notification-type';
import { MessageService } from 'primeng/api';
import { EntryService } from '../../pages/entries/service/entry.service';
import { EntryRequest } from '../../pages/entries/model/entryRequest.model';
import { EntryEventsService } from '../../pages/entries/service/entry-event.service';

@Component({
  selector: 'app-entry-form',
  imports: [ButtonModule, ReactiveFormsModule, InputTextModule, CommonModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent {
  entries: Entry[] = [];
  visible: boolean = false;
  @Input() entryToEdit: any | null = null;
  @Input() isEditing: boolean = false;
  categorias: { [key: string]: string[] } = {
    "1": ["aluguel", "alugueis", "condominio", "iptu", "casa", "casas", "moradia", "terreno"],
    "2": ["mercado", "mercados", "supermercado", "supermercados", "compra", "compras"],
    "3": ["energia", "conta energia", "conta de energia", "agua", "conta agua", "conta de agua", "luz", "telefone", "telefones", "internet", "netflix", "conta de luz"],
    "4": ["gasolina", "uber", "onibus", "transporte", "transportes", "combustivel", "taxi"],
    "5": ["cinema", "festa", "festas", "lazer", "show", "viagem"],
    "6": ["medico", "hospital", "saude", "exame", "exames", "consulta", "consultas"],
    "7": ["bar", "restaurante", "restaurante chines", "almoço", "janta", "comida chinesa", "habbibs", "habibs", "habibes", "habibis", "macdonalds", "mcdonalds", "ifood", "lanche", "lanches", "pizza", "pizzas", "pizzaria", "jantar", "almoco", "almocos", "cafe", "cafes", "bebida", "bebidas", "churrasco", "churrascos", "agua de coco", "aguas de coco"],
    "8": ["manutencao", "reforma", "reformas", "obra"],
    "9": ["padaria", "padarias", "pao", "paes", "bolo"],
    "10": ["farmacia", "farmacias", "remedio", "remedios", "medicamento", "medicamentos"],
    "11": ["outros", "diverso", "diversos"],
    "12": ["pet", "pets", "cachorro", "cachorros", "gato", "gatos", "racao", "racoes", "areia gato", "areia para gato", "areia do gato", "banho e tosa", "banho", "tosa"],
    "13": ["carro", "carros", "oficina", "oficinas", "mecanico", "mecanico", "pneu", "pneus", "manutençao carro", "manutencao carro", "manutençao do carro", "manutençao carros"]
  };

  constructor(
    private service: EntryService,
    private messageService: MessageService,
    private entryEvents: EntryEventsService
  ) { }

  form = new FormGroup({
    description: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required])
  });

  saveEntry(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // força exibir mensagens de erro
      return;
    }
    const formValue = this.form.value;

    // Sempre recalcula a categoria a partir da descrição
    const categoriaId = this.getCategoriaIdByTerm(formValue.description!);
    const entry = new EntryRequest(formValue.description!, formValue.amount!, categoriaId);
    this.createEntry(entry);
  }

  private getCategoriaIdByTerm(term: string): string {
    const normalize = (str: string) =>
      str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const tokens = normalize(term).split(/\s+/); // quebra em palavras

    let bestCategoria = "11"; // default: outros
    let bestScore = 0;

    for (const [id, termos] of Object.entries(this.categorias)) {
      let score = 0;

      for (const t of termos) {
        const normalizedT = normalize(t);

        for (const token of tokens) {
          // Se o token aparece no termo ou vice-versa, soma ponto
          if (normalizedT.includes(token) || token.includes(normalizedT)) {
            score++;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestCategoria = id;
      }
    }

    return bestCategoria;
  }

  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }

  private createEntry(entryRequest: EntryRequest): void {
    this.service.create(entryRequest).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Entrada atualizada com sucesso!');
        this.form.reset();
        this.entryEvents.notifyEntryCreated();
        this.entryEvents.setDialogState(false);
      },
      error: () => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao atualizar lançamento.');
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
