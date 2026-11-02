import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Card } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { ReportService } from '../../pages/reports/service/report.service';
import { CategoryMonth, CategoryMonthlyReport } from '../../pages/reports/model/report.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'finansys-category-monthly';

@Component({
  selector: 'app-category-monthly',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, SelectModule, SelectButtonModule, SkeletonModule, ButtonModule, BrlPipe],
  templateUrl: './category-monthly.component.html',
  styleUrl: './category-monthly.component.css'
})
export class CategoryMonthlyComponent implements OnInit, OnDestroy {
  categories: { id: number; description: string }[] = [];
  categoryId: number | null = null;
  report: CategoryMonthlyReport | null = null;
  loading = false;
  error = false;

  order: 'recent' | 'highest' = 'recent';
  orderOptions = [
    { label: 'Mais recentes', value: 'recent' },
    { label: 'Maior gasto', value: 'highest' }
  ];

  readonly skeletonRows = [1, 2, 3, 4, 5, 6];
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private reportService: ReportService) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categories?isActive=true`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.categories = data.map(c => ({ id: Number(c.id), description: c.description }));
          const saved = this.readSavedCategory();
          if (saved != null && this.categories.some(c => c.id === saved)) {
            this.categoryId = saved;
            this.load();
          }
        },
        error: err => console.error('Erro ao carregar categorias:', err)
      });
  }

  onCategoryChange(): void {
    this.saveCategory();
    this.load();
  }

  load(): void {
    if (this.categoryId == null) {
      this.report = null;
      return;
    }
    this.loading = true;
    this.error = false;
    this.reportService.getCategoryMonthly(this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: report => {
          // Uma versão antiga da Edge Function ignora categoryId e devolve uma lista
          if (!report || !Array.isArray(report.months)) {
            console.error('Resposta inesperada do relatório por categoria:', report);
            this.report = null;
            this.error = true;
          } else {
            this.report = report;
          }
          this.loading = false;
        },
        error: err => {
          console.error('Erro ao carregar relatório por categoria:', err);
          this.report = null;
          this.error = true;
          this.loading = false;
        }
      });
  }

  get rows(): CategoryMonth[] {
    const months = [...(this.report?.months ?? [])];
    // A API já devolve do mês mais recente para o mais antigo
    return this.order === 'highest' ? months.sort((a, b) => b.total - a.total) : months;
  }

  get max(): number {
    return Math.max(0, ...(this.report?.months ?? []).map(m => m.total));
  }

  get averagePercent(): number {
    return this.max ? ((this.report?.average ?? 0) / this.max) * 100 : 0;
  }

  get hasSpending(): boolean {
    return (this.report?.total ?? 0) > 0;
  }

  barWidth(m: CategoryMonth): number {
    return this.max ? (m.total / this.max) * 100 : 0;
  }

  isPeak(m: CategoryMonth): boolean {
    return m.month === this.report?.peak?.month;
  }

  // new Date('2026-05') seria lido como UTC e viraria 30 de abril no Brasil
  monthLabel(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const name = new Date(year, monthNumber - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
  }

  private readSavedCategory(): number | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value ? Number(value) : null;
    } catch {
      return null;
    }
  }

  private saveCategory(): void {
    try {
      if (this.categoryId == null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, String(this.categoryId));
      }
    } catch {
      // Sem armazenamento local, a escolha só não é lembrada
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
