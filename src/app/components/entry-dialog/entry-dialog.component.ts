import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EntryService } from '../../pages/entries/service/entry.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EntryRequest } from '../../pages/entries/model/entryRequest.model';
import { ToastModule } from 'primeng/toast';
import { NotificationType } from '../../shared/notification-type';

@Component({
  selector: 'app-entry-dialog',
  imports: [ButtonModule, DialogModule, InputTextModule, ReactiveFormsModule, ToastModule],
  templateUrl: './entry-dialog.component.html',
  styleUrl: './entry-dialog.component.css'
})
export class EntryDialogComponent {

  visible: boolean = false;
  @Input() deveExibirBotaoAdicionar: boolean = false;
  @Input() entryToEdit: any | null = null;
  @Output() onSave: EventEmitter<void> = new EventEmitter<void>();
  title: string = 'Incluir novo Lançamento';

  categorias: { [key: string]: string[] } = {
    "1": ["aluguel", "alugueis", "condominio", "condominios", "iptu", "casa", "casas", "moradia", "moradias"],
    "2": ["mercado", "mercados", "supermercado", "supermercados", "compra", "compras"],
    "3": ["energia", "conta energia", "conta de energia", "agua", "conta agua", "conta de agua", "luz", "telefone", "telefones", "internet", "internets", "conta de luz"],
    "4": ["gasolina", "uber", "onibus", "transporte", "transportes", "combustivel", "taxi"],
    "5": ["cinema", "festa", "festas", "lazer", "show", "viagem"],
    "6": ["medico", "hospital", "saude", "exame", "exames", "consulta", "consultas"],
    "7": ["bar", "restaurante", "restaurante chines", "almoço", "janta", "comida chinesa", "habbibs", "habibs", "habibes", "habibis", "macdonalds", "mcdonalds", "ifood", "lanche", "lanches", "pizza", "pizzas", "pizzaria", "jantar", "almoco", "almocos", "cafe", "cafes", "bebida", "bebidas", "churrasco", "churrascos", "agua de coco", "aguas de coco"],
    "8": ["manutencao", "reforma", "reformas", "obra"],
    "9": ["padaria", "padarias", "pao", "paes", "bolo", "bolos"],
    "10": ["farmacia", "farmacias", "remedio", "remedios", "medicamento", "medicamentos"],
    "11": ["outros", "diverso", "diversos"],
    "12": ["pet", "pets", "cachorro", "cachorros", "gato", "gatos", "racao", "racoes", "areia gato", "areia para gato", "areia do gato", "banho e tosa", "banho", "tosa"],
    "13": ["carro", "carros", "oficina", "oficinas", "mecanico", "mecanico", "pneu", "pneus", "manutençao carro", "manutencao carro", "manutençao do carro", "manutençao carros"]
  };

  constructor(
    private service: EntryService,
    private messageService: MessageService,
  ) {}

  form = new FormGroup({
    description: new FormControl(''),
    amount: new FormControl('')
  });

  ngOnChanges() {
    // 👉 sempre que entryToEdit mudar, preencher o formulário
    if (this.entryToEdit) {
      this.form.patchValue({
        description: this.entryToEdit.description,
        amount: this.entryToEdit.amount
      });
      this.showDialog();
    }
  }

  getCategoriaIdByTerm(term: string): string {
    const normalizedTerm = term
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

    for (const [id, termos] of Object.entries(this.categorias)) {
      const normalizedTermos = termos.map(t =>
        t
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      );

      if (normalizedTermos.includes(normalizedTerm)) {
        return id;
      }
    }

    return "11";
  }

saveEntry(): void {
  const description = this.form.value.description ?? '';
  const amount = this.form.value.amount ?? '';

  // Sempre recalcula a categoria a partir da descrição
  const categoriaId = this.getCategoriaIdByTerm(description ?? '11');
  const parsedCategoriaId = parseInt(categoriaId, 10) || 11;

  if (this.entryToEdit) {
    // Atualização
    const updatedEntry: EntryRequest = {
      ...this.entryToEdit,
      description: description,
      amount: amount,
      categoryId: parsedCategoriaId.toString()
    };

    console.log('Payload update:', updatedEntry);

    this.service.update(this.entryToEdit.id, updatedEntry).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Lançamento atualizado com sucesso.');
        this.onSave.emit();
        this.resetAndClose();
      },
      error: (err) => {
        console.error('Erro ao atualizar entry:', err);
        this.showMessage(NotificationType.ERROR, '', 'Erro ao atualizar registro');
      }
    });

  } else {
    // Criação de novo
    if (!this.deveExibirBotaoAdicionar) {
      this.showMessage(NotificationType.ERROR, '', 'Usuário não autorizado a adicionar lançamentos.');
      return;
    }

    const entryRequest: EntryRequest = {
      description: description,
      amount: amount,
      categoryId: parsedCategoriaId.toString()
    };

    console.log('Payload create:', entryRequest);

    this.service.create(entryRequest).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Lançamento incluído com sucesso.');
        this.onSave.emit();
        this.resetAndClose();
      },
      error: (err) => {
        console.error('Erro ao salvar entry:', err);
        this.showMessage(NotificationType.ERROR, '', 'Erro ao tentar adicionar registro')
      }
    });
  }
}



  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }

  private resetAndClose(): void {
    this.form.reset();
    this.entryToEdit = null; // limpa o modo edição
    this.visible = false;    // garante que o modal será fechado
  }


  showDialog() {
      this.visible = true;
  }

  hideDialog() {
    this.visible = false;
    this.entryToEdit = null; // limpa edição ao fechar
    this.form.reset();
  }

}
