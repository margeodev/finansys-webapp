import { Component, OnInit } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ReportService } from './service/report.service';
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
  imports: [NgxEchartsDirective, PageHeader, Card, CustomBreadcrumb],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  chartData: any[] = [];
  chartOptions: any;

  colorList: string[] = [
    '--color-blue', '--color-green', '--color-orange', '--color-purple',
    '--color-deep-orange', '--color-cyan', '--color-indigo', '--color-pink',
    '--color-light-green', '--color-yellow', '--color-blue-grey',
    '--color-teal', '--color-lime'
  ];

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.getReport();
  }

  getReport(monthsBack: number = 0): void {
    this.reportService.getByMonth(monthsBack.toString()).subscribe({
      next: (data) => {
        const chartData = data.map((r: any) => ({
          value: Number(r.total),
          name: r.categoryDescription
        }));

        const colors = data.map((_: any, i: number) =>
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

  onSelect(event: any): void {
    console.log('Selecionado:', event);
  }
}