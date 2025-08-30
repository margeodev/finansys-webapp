import { Component, Input, OnInit } from '@angular/core';
import { CustomBreadcrumb } from '../../shared/breadcrumb/custom-breadcrumb';
import { PageHeader } from '../../shared/page-header/page-header';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { EntryService } from './service/entry.service';
import { Entry } from './model/entry.model';
import { MessageService } from 'primeng/api';
import { NotificationType } from '../../shared/notification-type';
import { AuthService } from '../login/service/auth.service';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { EntryRequest } from './model/entryRequest.model';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';



@Component({
  selector: 'app-entries',
  imports: [CustomBreadcrumb, PageHeader, CardModule, 
    ButtonModule, InputTextModule, DialogModule, InputNumberModule,
    ReactiveFormsModule, CommonModule,  DividerModule, 
    ChipModule, TableModule],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries implements OnInit {  

  editingEntryId: string | null = null;
  entries: Entry[] = [];
  entryToSave: EntryRequest = new EntryRequest();
  visible: boolean = false;
  deveExibirBotaoAdicionar: boolean = false;
  categorias: { [key: string]: string[] } = {
    "1": ["aluguel", "alugueis", "condominio", "condominios", "iptu", "casa", "casas", "moradia", "moradias"],
    "2": ["mercado", "mercados", "supermercado", "supermercados", "compra", "compras"],
    "3": ["energia", "conta energia", "conta de energia", "agua", "conta agua", "conta de agua", "luz", "telefone", "telefones", "internet", "internets", "conta de luz"],
    "4": ["gasolina", "uber", "onibus", "transporte", "transportes", "combustivel", "taxi"],
    "5": ["cinema", "festa", "festas", "lazer", "show", "viagem", "hotel", "pousada", "parque"],
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  form = new FormGroup({
    description: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required])
  });

  // ========================== INICIO CADASTRO ==========================
  saveEntry22(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // força exibir mensagens de erro
      return;
    }
    this.visible = false;
    this.addEntry();
  }

  saveEntry(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // força exibir mensagens de erro
      return;
    }
    this.setEntryValues();
    if (this.editingEntryId) { 
      this.updateEntry(Number(this.editingEntryId));
    } else {
       this.setEntryValues();
      this.addEntry();
    }
  }

  showCreateDialog() {
    this.editingEntryId = null; // modo criação
    this.form.reset();
    this.visible = true;
  }

  showEditDialog(entry: Entry) {
    this.editingEntryId = entry.id!;

    this.form.patchValue({
      description: entry.description,
      amount: entry.amount
    });
    this.visible = true;
  }

  private setEntryValues(): void {
    const description = this.form.value.description ?? '';
    this.entryToSave.description = description;
    this.entryToSave.amount = this.form.value.amount ?? '';
    this.entryToSave.categoryId = this.getCategoriaIdByTerm(description);
  }

  private addEntry(): void {
    this.service.create(this.entryToSave).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Lançamento incluído com sucesso.');
        this.resetAndClose();
         this.loadEntries();
      },
      error: (err) => {
        console.error('Erro ao salvar entry:', err);
        this.showMessage(NotificationType.ERROR, '', 'Erro ao tentar adicionar registro')
      }
    });
  }

  private updateEntry(id: number): void {
    this.service.update(id, this.entryToSave).subscribe({
      next: () => {
        this.showMessage(NotificationType.SUCCESS, '', 'Lançamento atualizado com sucesso.');
        this.resetAndClose();
        this.loadEntries();
      },
      error: (err) => {
        this.showMessage(NotificationType.ERROR, '', 'Erro ao tentar atualizar registro');
      }
    });
  }

  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }
  
  private resetAndClose(): void {
    this.form.reset();
    this.visible = false;
    this.editingEntryId = null;
  }

  private getCategoriaIdByTerm(term: string): string {
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
// ========================== FIM CADASTRO ==========================

// ========================== INICIO TABELA ==========================

  private loadEntries(): void {
    const user = this.authService.getLoggedUser();
    if (!user) {
      this.showMessage(NotificationType.ERROR, '', 'User ID not found. Cannot load entries.')
      return;
    }

    this.service.getByUserAndMonth(user.username).subscribe({
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
      '1': 'house',          // Moradia
      '2': 'cart-shopping',// Supermercado
      '3': 'lightbulb-dollar',              // Conta Consumo
      '4': 'gas-pump',     // Transporte
      '5': 'joystick',           // Lazer
      '6': 'stethoscope',           // Saúde
      '7': 'fork-knife',            // Bares e Restaurantes
      '8': 'screwdriver-wrench',     // Manutenção Casa
      '9': 'croissant',         // Padaria
      '10': 'prescription-bottle-medical',       // Farmácia
      '11': 'list',            // Outros
      '12': 'cat',                 // Pets
      '13': 'car-wrench'            // Manutenção Carro
    };
    return iconsMap[categoryId] || 'list';
  }
}