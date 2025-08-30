import { Component } from '@angular/core';
import { CustomBreadcrumb } from '../../shared/breadcrumb/custom-breadcrumb';
import { PageHeader } from '../../shared/page-header/page-header';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { EntryUserComponent } from "../../components/entry-user/entry-user.component";



@Component({
  selector: 'app-entries',
  imports: [CustomBreadcrumb, PageHeader, CardModule,
    ButtonModule, InputTextModule, DialogModule, InputNumberModule,
    ReactiveFormsModule, CommonModule, DividerModule,
    ChipModule, TableModule, EntryUserComponent],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries {  

  
  
}