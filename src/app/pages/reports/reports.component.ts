import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CommonModule } from '@angular/common';
import { ReportService } from './service/report.service';
import { ReportModel } from './model/report.model';
import { SelectedMonthService } from '../../shared/service/selected-month.service';
import { EntryService } from '../entries/service/entry.service';
import { CurrentUserService } from '../../shared/current-user.service';
import { UserService } from '../entries/service/user.service';
import { Entry } from '../entries/model/entry.model';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/page-header/page-header';
import { Card } from 'primeng/card';
import { CustomBreadcrumb } from '../../shared/breadcrumb/custom-breadcrumb';

echarts.use([
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgxEchartsDirective, PageHeader, Card, CustomBreadcrumb, DatePickerModule, FormsModule, CommonModule],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {

  chartOptions: any;
  barChartOptions: any;

  colorList: string[] = [
    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC',
    '#FF7043', '#26C6DA', '#7E57C2', '#EC407A',
    '#9CCC65', '#FFCA28', '#5C6BC0', '#26A69A', '#D4E157'
  ];

  mesAnoSelecionado: Date | null = null;

  // KPIs
  totalSpentThisMonth: number = 0;
  biggestCategory: string = '—';
  numberOfEntries: number = 0;
  deltaPercent: number | null = null;
  deltaPositive: boolean = true;

  // Shared vs Personal
  sharedTotal: number = 0;
  personalTotal: number = 0;

  isAdmin: boolean = false;
  private currentUserId: number | null = null;
  private user2Id: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService,
    private selectedMonthService: SelectedMonthService,
    private entryService: EntryService,
    private currentUserService: CurrentUserService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserService.getCurrentUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(info => {
        this.isAdmin = info.role === 'admin';

        this.userService.getAll().pipe(takeUntil(this.destroy$)).subscribe(users => {
          const match = users.find(u => u.username?.toLowerCase() === (info.username ?? '').toLowerCase());
          this.currentUserId = match?.id ?? users[0]?.id ?? null;
          this.user2Id = users[1]?.id ?? null;

          this.selectedMonthService.selectedMonth$
            .pipe(takeUntil(this.destroy$))
            .subscribe(date => {
              const now = new Date();
              const d = date ?? new Date(now.getFullYear(), now.getMonth(), 1);
              this.mesAnoSelecionado = d;
              const monthsBack = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
              this.loadAllData(monthsBack, d);
            });
        });
      });
  }

  private loadAllData(monthsBack: number, selectedDate: Date): void {
    const dateParam = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      .toISOString().split('T')[0];

    const userId = this.currentUserId;
    const user2Entries$ = this.isAdmin && this.user2Id != null
      ? this.entryService.getByUserAndMonth(this.user2Id, dateParam)
      : of([] as Entry[]);

    forkJoin({
      sixMonths: this.reportService.getLastNMonths(6, monthsBack),
      user1Entries: userId != null
        ? this.entryService.getByUserAndMonth(userId, dateParam)
        : of([] as Entry[]),
      user2Entries: user2Entries$,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ sixMonths, user1Entries, user2Entries }) => {
        const allEntries = [...user1Entries, ...user2Entries];
        this.buildPieChart(sixMonths[0]);
        this.buildKpis(sixMonths[0], sixMonths[1] ?? [], allEntries);
        this.buildBarChart(sixMonths, selectedDate);
      },
      error: err => console.error('Erro ao carregar relatórios:', err)
    });
  }

  private buildPieChart(currentReport: ReportModel[]): void {
    const aggregated: Record<string, number> = currentReport.reduce((acc, r) => {
      const name = r.categoryDescription ?? 'Sem categoria';
      acc[name] = (acc[name] ?? 0) + (Number(r.total) || 0);
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(aggregated)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        value,
        name,
        itemStyle: { color: this.colorList[i % this.colorList.length], borderRadius: [4, 4, 0, 0] }
      }));

    this.chartOptions = {
      title: {
        text: 'Despesas por Categoria',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold', color: '#334155' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const p = params[0];
          return `${p.name}<br/>R$ ${Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLabel: { color: '#495057', fontSize: 12, interval: 0, rotate: chartData.length > 5 ? 20 : 0 }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`,
          color: '#495057'
        }
      },
      series: [{
        type: 'bar',
        data: chartData,
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => `R$ ${Number(p.value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
          fontSize: 11,
          color: '#334155'
        },
        emphasis: { itemStyle: { opacity: 0.8 } }
      }]
    };
  }

  private buildKpis(current: ReportModel[], prev: ReportModel[], allEntries: Entry[]): void {
    const prevTotal = prev.reduce((s, r) => s + (Number(r.total) || 0), 0);

    this.sharedTotal = allEntries.filter(e => !e.isPersonal).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    this.personalTotal = allEntries.filter(e => e.isPersonal).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    this.totalSpentThisMonth = this.sharedTotal + this.personalTotal;
    this.numberOfEntries = allEntries.length;

    const sorted = [...current].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
    this.biggestCategory = sorted[0]?.categoryDescription ?? '—';

    if (prevTotal > 0) {
      this.deltaPercent = ((this.totalSpentThisMonth - prevTotal) / prevTotal) * 100;
      this.deltaPositive = this.deltaPercent <= 0;
    } else {
      this.deltaPercent = null;
      this.deltaPositive = true;
    }
  }

  private buildBarChart(sixMonths: ReportModel[][], selectedDate: Date): void {
    const monthLabels: string[] = [];
    const monthTotals: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
      monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
      monthTotals.push((sixMonths[i] ?? []).reduce((s, r) => s + (Number(r.total) || 0), 0));
    }

    this.barChartOptions = {
      title: {
        text: 'Evolução dos Últimos 6 Meses',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: 'bold', color: '#334155' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const p = params[0];
          return `${p.name}<br/>R$ ${Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }
      },
      xAxis: { type: 'category', data: monthLabels, axisLabel: { color: '#495057' } },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`,
          color: '#495057'
        }
      },
      series: [{
        name: 'Total', type: 'bar', data: monthTotals,
        itemStyle: { color: '#42A5F5', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true, position: 'top',
          formatter: (p: any) => `R$ ${Number(p.value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
        }
      }]
    };
  }

  onReportDateChange(date: Date | null): void {
    this.selectedMonthService.setSelectedMonth(date);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
