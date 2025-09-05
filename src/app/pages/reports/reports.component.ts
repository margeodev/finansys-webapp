import { ChangeDetectorRef, Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CustomBreadcrumb } from "../../shared/breadcrumb/custom-breadcrumb";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PageHeader } from "../../shared/page-header/page-header";
import { ChartModule } from 'primeng/chart';
import { Card } from "primeng/card";
import { ReportService } from './service/report.service';
import { ReportModel } from './model/report.model';

@Component({
  selector: 'app-reports',
  imports: [CustomBreadcrumb, CommonModule, PageHeader, ChartModule, Card],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  basicData: any;
  basicOptions: any;

  reports: ReportModel[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.getReport();

    this.basicOptions = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: this.getCssVariable('--text-color')
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: this.getCssVariable('--text-color')
          },
          grid: {
            color: this.getCssVariable('--grid-color')
          }
        },
        y: {
          ticks: {
            color: this.getCssVariable('--text-color')
          },
          grid: {
            color: this.getCssVariable('--grid-color')
          }
        }
      }
    };
  }

  getReport(monthsBack: number = 0) {
    this.reportService.getByMonth(monthsBack.toString()).subscribe({
      next: (data) => {
        this.reports = data;
        console.log('Relatórios recebidos:', this.reports);

        // Monta os dados do gráfico a partir do backend
        this.basicData = {
          labels: this.reports.map(r => r.categoryDescription),
          datasets: [
            {
              label: 'Despesas',
              data: this.reports.map(r => Number(r.total)),
              backgroundColor: [
                this.getCssVariable('--color-blue'),
                this.getCssVariable('--color-green'),
                this.getCssVariable('--color-orange'),
                this.getCssVariable('--color-purple'),
                this.getCssVariable('--color-deep-orange'),
                this.getCssVariable('--color-cyan'),
                this.getCssVariable('--color-indigo'),
                this.getCssVariable('--color-pink'),
                this.getCssVariable('--color-light-green'),
                this.getCssVariable('--color-yellow'),
                this.getCssVariable('--color-blue-grey'),
                this.getCssVariable('--color-teal'),
                this.getCssVariable('--color-lime')
              ]
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

}