import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../services/stats.service';
import { Chart, registerables } from 'chart.js';
import { ThemeService } from '../../../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('popChart') popChartRef!: ElementRef;
  @ViewChild('genreChart') genreChartRef!: ElementRef;
  @ViewChild('userTypeChart') userTypeChartRef!: ElementRef;
  @ViewChild('finesChart') finesChartRef!: ElementRef;
  @ViewChild('authorChart') authorChartRef!: ElementRef;
  @ViewChild('punctualityChart') punctualityChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('distChart') distChartRef!: ElementRef;

  summary: any = {};
  debtors: any[] = [];
  inactiveBooks: any[] = [];
  upcomingExpirations: any[] = [];
  loading = true;
  today: Date = new Date();
  private charts: Chart[] = [];

  Math = Math; // Para usar en el template

  constructor(
    private statsService: StatsService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTablesData();
  }

  ngAfterViewInit(): void {
    this.themeService.isDarkTheme$.subscribe(() => {
      this.destroyCharts();
      this.loadChartsData();
    });
  }

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  loadSummary() {
    this.statsService.getSummary().subscribe(data => {
      this.summary = data;
    });
  }

  loadTablesData() {
    this.statsService.getDebtors().subscribe(data => this.debtors = data);
    this.statsService.getInactiveBooks().subscribe(data => this.inactiveBooks = data);
    this.statsService.getUpcomingExpirations().subscribe(data => this.upcomingExpirations = data);
  }

  loadChartsData() {
    // 1. Libros más solicitados
    this.statsService.getMostBorrowedBooks().subscribe(data => this.renderBarChart(this.popChartRef, data, 'titulo', 'total', '#6366f1'));

    // 2. Préstamos por género
    this.statsService.getLoansByGenre().subscribe(data => this.renderPieChart(this.genreChartRef, data, 'genero', 'total'));

    // 3. Uso por tipo de usuario
    this.statsService.getLoansByRole().subscribe(data => this.renderPieChart(this.userTypeChartRef, data, 'rol', 'total'));

    // 4. Multas generadas vs pagadas
    this.statsService.getFinesStats().subscribe(data => this.renderDoughnutChart(this.finesChartRef, data, 'estado', 'total'));

    // 5. Autores más prestados
    this.statsService.getMostBorrowedAuthors().subscribe(data => this.renderBarChart(this.authorChartRef, data, 'autor', 'total', '#10b981'));

    // 6. Tasa de puntualidad
    this.statsService.getPunctualityRate().subscribe(data => this.renderPunctualityChart(this.punctualityChartRef, data));

    // 7. Tendencia mensual
    this.statsService.getLoansByMonth().subscribe(data => this.renderTrendChart(data));

    // 8. Distribución de formatos
    this.statsService.getInventoryDistribution().subscribe(data => {
      this.renderDistributionChart(data);
      this.loading = false;
    });
  }

  private getChartOptions(overrideOptions: any = {}) {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#a3aed1' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: textColor, font: { family: 'Inter', size: 10 } }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 10 } },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor, font: { size: 10 } },
          grid: { color: gridColor }
        }
      },
      ...overrideOptions
    };
  }

  private renderBarChart(ref: ElementRef, data: any[], labelKey: string, valueKey: string, color: string) {
    if (!ref) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d[labelKey]),
        datasets: [{ label: 'Total', data: data.map(d => d[valueKey]), backgroundColor: color, borderRadius: 6 }]
      },
      options: this.getChartOptions({ indexAxis: 'y', plugins: { legend: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderPieChart(ref: ElementRef, data: any[], labelKey: string, valueKey: string) {
    if (!ref) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'pie',
      data: {
        labels: data.map(d => d[labelKey]),
        datasets: [{ data: data.map(d => d[valueKey]) as number[], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }]
      },
      options: this.getChartOptions({ scales: { x: { display: false }, y: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderDoughnutChart(ref: ElementRef, data: any[], labelKey: string, valueKey: string) {
    if (!ref) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d[labelKey]),
        datasets: [{ data: data.map(d => d[valueKey]) as number[], backgroundColor: ['#10b981', '#ef4444'] }]
      },
      options: this.getChartOptions({ scales: { x: { display: false }, y: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderPunctualityChart(ref: ElementRef, data: any) {
    if (!ref) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['A tiempo', 'Con retraso'],
        datasets: [{ data: [data.onTime, data.total - data.onTime], backgroundColor: ['#10b981', '#f59e0b'] }]
      },
      options: this.getChartOptions({ cutout: '70%', scales: { x: { display: false }, y: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderTrendChart(data: any[]) {
    const chart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => d.mes),
        datasets: [{ label: 'Préstamos', data: data.map(d => d.total) as number[], borderColor: '#6366f1', fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4 }]
      },
      options: this.getChartOptions({ plugins: { legend: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderDistributionChart(data: any) {
    if (!this.distChartRef) return;
    const chart = new Chart(this.distChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data) as number[], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'] }]
      },
      options: this.getChartOptions({ scales: { x: { display: false }, y: { display: false } } })
    });
    this.charts.push(chart);
  }
}
