import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Entry } from '../../pages/entries/model/entry.model';
import { BrlPipe } from '../../shared/pipes/brl.pipe';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [CommonModule, MultiSelectModule, FormsModule, BrlPipe],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.css'
})
export class CategoryFilterComponent {
  @Input() categories: { id: number; description: string }[] = [];
  @Input() entries: Entry[] = [];
  @Output() selectedCategoriesChange = new EventEmitter<number[]>();

  selectedCategoryIds: number[] = [];

  onSelectionChange(): void {
    this.selectedCategoriesChange.emit(this.selectedCategoryIds);
  }

  getTotalForCategories(): number {
    if (this.selectedCategoryIds.length === 0) return 0;

    return this.entries
      .filter(e => {
        const categoryId = e.category?.id;
        return categoryId && this.selectedCategoryIds.includes(categoryId);
      })
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  get hasSelection(): boolean {
    return this.selectedCategoryIds.length > 0;
  }
}
