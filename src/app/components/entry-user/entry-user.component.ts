import { Component, Input, OnInit } from '@angular/core';
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
import { EntryFormComponent } from "../entry-form/entry-form.component";

@Component({
  selector: 'app-entry-user',
   imports: [CardModule,
    ButtonModule, DialogModule, InputNumberModule,
    CommonModule, DividerModule,
    ChipModule, TableModule, EntryFormComponent],
  templateUrl: './entry-user.component.html',
  styleUrl: './entry-user.component.css'
})
export class EntryUserComponent implements OnInit {  

  @Input() userName: string = '';
  isEditing: boolean = false;
  editingEntryId: string | null = null;
  entries: Entry[] = [];
  entryToSave: EntryRequest = new EntryRequest();
  entryToEdit: EntryRequest = new EntryRequest();
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
  
  showCreateDialog() {
    this.isEditing = false;
    this.visible = true;
  }

  showEditDialog(entry: Entry) {   
    this.entryToEdit = entry
    this.isEditing = true;
    this.visible = true;
  }

  showFormDialog(entry: Entry) {
    
  }

  
  private showMessage(severity: NotificationType, summary: string, message: string) {
    this.messageService.clear();
    this.messageService.add({ severity: severity, summary: summary, detail: message });
  }
  
  onCloseDialog() {
    this.loadEntries();
    this.visible = false;
  }


  private resetAndClose(): void {
    // this.form.reset();
    this.visible = false;
    this.editingEntryId = null;
  }

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
}