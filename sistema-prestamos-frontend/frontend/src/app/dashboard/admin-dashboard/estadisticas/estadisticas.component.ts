import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../services/stats.service';
import { Chart, registerables } from 'chart.js';
import { ThemeService } from '../../../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
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

  // Data cache for charts
  private mostBorrowedBooks: any[] = [];
  private loansByGenre: any[] = [];
  private loansByRole: any[] = [];
  private finesStats: any[] = [];
  private mostBorrowedAuthors: any[] = [];
  private punctualityRate: any = null;
  private loansByMonth: any[] = [];
  private inventoryDistribution: any = null;

  Math = Math; // Para usar en el template

  constructor(
    private statsService: StatsService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTablesData();
    this.fetchChartsData(); // Initial data fetch
  }

  ngAfterViewInit(): void {
    this.themeService.isDarkTheme$.subscribe(() => {
      // Small delay to let the DOM apply classes before re-rendering charts
      setTimeout(() => {
        this.renderCharts();
      }, 0);
    });
  }

  private destroyCharts() {
    this.charts.forEach(c => {
      if (c) c.destroy();
    });
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

  /**
   * Fetches all chart data from API once
   */
  private fetchChartsData() {
    this.loading = true;
    
    // Using forkJoin would be better but let's stick to individual calls for now to minimize breakage
    this.statsService.getMostBorrowedBooks().subscribe(data => {
      this.mostBorrowedBooks = data;
      this.renderCharts();
    });

    this.statsService.getLoansByGenre().subscribe(data => {
      this.loansByGenre = data;
      this.renderCharts();
    });

    this.statsService.getLoansByRole().subscribe(data => {
      this.loansByRole = data;
      this.renderCharts();
    });

    this.statsService.getFinesStats().subscribe(data => {
      this.finesStats = data;
      this.renderCharts();
    });

    this.statsService.getMostBorrowedAuthors().subscribe(data => {
      this.mostBorrowedAuthors = data;
      this.renderCharts();
    });

    this.statsService.getPunctualityRate().subscribe(data => {
      this.punctualityRate = data;
      this.renderCharts();
    });

    this.statsService.getLoansByMonth().subscribe(data => {
      this.loansByMonth = data;
      this.renderCharts();
    });

    this.statsService.getInventoryDistribution().subscribe(data => {
      this.inventoryDistribution = data;
      this.renderCharts();
      this.loading = false;
    });
  }

  /**
   * Renders or re-renders charts using cached data
   */
  private renderCharts() {
    this.destroyCharts();

    if (this.mostBorrowedBooks.length > 0) 
      this.renderBarChart(this.popChartRef, this.mostBorrowedBooks, 'titulo', 'total', '#6366f1');

    if (this.loansByGenre.length > 0) 
      this.renderPieChart(this.genreChartRef, this.loansByGenre, 'genero', 'total');

    if (this.loansByRole.length > 0) 
      this.renderPieChart(this.userTypeChartRef, this.loansByRole, 'rol', 'total');

    if (this.finesStats.length > 0) 
      this.renderDoughnutChart(this.finesChartRef, this.finesStats, 'estado', 'total');

    if (this.mostBorrowedAuthors.length > 0) 
      this.renderBarChart(this.authorChartRef, this.mostBorrowedAuthors, 'autor', 'total', '#10b981');

    if (this.punctualityRate) 
      this.renderPunctualityChart(this.punctualityChartRef, this.punctualityRate);

    if (this.loansByMonth.length > 0) 
      this.renderTrendChart(this.loansByMonth);

    if (this.inventoryDistribution) 
      this.renderDistributionChart(this.inventoryDistribution);
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
    if (!ref || !ref.nativeElement) return;
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
    if (!ref || !ref.nativeElement) return;
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
    if (!ref || !ref.nativeElement) return;
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
    if (!ref || !ref.nativeElement) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['A tiempo', 'Con retraso'],
        datasets: [{ data: [data.aTiempo, data.total - data.aTiempo], backgroundColor: ['#10b981', '#f59e0b'] }]
      },
      options: this.getChartOptions({ cutout: '70%', scales: { x: { display: false }, y: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderTrendChart(data: any[]) {
    if (!this.trendChartRef || !this.trendChartRef.nativeElement) return;
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
    if (!this.distChartRef || !this.distChartRef.nativeElement) return;
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
