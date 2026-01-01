import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { Subscription } from 'rxjs';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ReportService } from './service/report.service';
import { SelectedMonthService } from '../../shared/service/selected-month.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { PageHeader } from "../../shared/page-header/page-header";
import { Card } from "primeng/card";
import { CustomBreadcrumb } from "../../shared/breadcrumb/custom-breadcrumb";

// Registra os componentes usados pelo ECharts
echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgxEchartsDirective, PageHeader, Card, CustomBreadcrumb, DatePickerModule, FormsModule],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {

  chartData: any[] = [];
  chartOptions: any;

  colorList: string[] = [
    '--color-blue', '--color-green', '--color-orange', '--color-purple',
    '--color-deep-orange', '--color-cyan', '--color-indigo', '--color-pink',
    '--color-light-green', '--color-yellow', '--color-blue-grey',
    '--color-teal', '--color-lime'
  ];

  mesAnoSelecionado: Date | null = null;
  private selectedMonthSub?: Subscription;

  constructor(private reportService: ReportService, private selectedMonthService: SelectedMonthService) { }

  ngOnInit(): void {
    // subscribe to shared selected month (set by Entries or Reports' own picker)
    this.selectedMonthSub = this.selectedMonthService.selectedMonth$.subscribe(date => {
      if (date) {
        this.mesAnoSelecionado = date;
        const now = new Date();
        const monthsBack = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        this.getReport(monthsBack);
      } else {
        this.getReport(0);
      }
    });
  }

  getReport(monthsBack: number = 0): void {
    this.reportService.getByMonth(monthsBack.toString()).subscribe({
      next: (data) => {
        // Agrega resultados por categoria para evitar duplicação caso a API retorne
        // múltiplas linhas com a mesma categoria (ex.: por meses ou subgrupos)
        const aggregated: Record<string, number> = data.reduce((acc: Record<string, number>, r: any) => {
          const name = r.categoryDescription ?? 'Sem categoria';
          const value = Number(r.total) || 0;
          acc[name] = (acc[name] ?? 0) + value;
          return acc;
        }, {});

        const chartData = Object.entries(aggregated).map(([name, value]) => ({
          value,
          name
        }));

        const colors = chartData.map((_: any, i: number) =>
          this.getCssVariable(this.colorList[i % this.colorList.length])
        );

        this.chartOptions = {
          title: {
            text: 'Despesas por Categoria',
            top: 0,
            left: 'center',
            textStyle: {
              fontSize: 22,
              fontWeight: 'bold',
              color: '#334155',              
            }
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            top: 60,
            left: 'left',
            type: 'scroll',
            itemWidth: 14,
            itemHeight: 14,
            icon: 'circle',
            textStyle: {
              color: '#333',
              fontSize: 14
            },
            formatter: (name: any) => ` ${name}`,
            backgroundColor: '#f9f9f9',
            borderColor: '#ccc',
            borderWidth: 1,
            padding: [20, 20]
          },
          color: colors,
          series: [
            {
              name: 'Despesas',
              top: 40,
              type: 'pie',
              radius: ['20%', '80%'],
              center: ['55%', '50%'],
              data: chartData,
              label: {
                show: true,
                formatter: '{b}: R$ {c}',
                fontSize: 14,
                color: '#333'
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]

        };
      },
      error: (err) => console.error('Erro ao carregar relatórios:', err)
    });
  }

  getCssVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  onReportDateChange(date: Date | null): void {
    // quando o usuário altera a data na tela de Relatórios, propaga para o serviço
    this.selectedMonthService.setSelectedMonth(date);
  }

  onSelect(event: any): void {
    console.log('Selecionado:', event);
  }

  ngOnDestroy(): void {
    this.selectedMonthSub?.unsubscribe();
  }
}