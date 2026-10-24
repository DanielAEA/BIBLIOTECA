import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { StatsService } from '../../../services/stats.service';
import { ThemeService } from '../../../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild References
  @ViewChild('popChart') popChartRef!: ElementRef;
  @ViewChild('genreChart') genreChartRef!: ElementRef;
  @ViewChild('finesChart') finesChartRef!: ElementRef;
  @ViewChild('authorChart') authorChartRef!: ElementRef;
  @ViewChild('punctualityChart') punctualityChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('distChart') distChartRef!: ElementRef;
  @ViewChild('statusChart') statusChartRef!: ElementRef;

  // Data variables
  summary: any = {};
  debtors: any[] = [];
  upcomingExpirations: any[] = [];
  loading = true;
  error = false;
  today: Date = new Date();
  Math = Math;

  // Control Flags
  viewReady = false;
  dataReady = false;

  // Internal Data for Charts
  public mostBorrowedBooks: any[] = [];
  public loansByGenre: any[] = [];
  public finesStats: any[] = [];
  public mostBorrowedAuthors: any[] = [];
  public punctualityRate: any = null;
  public loansByMonth: any[] = [];
  public inventoryDistribution: any = null;
  public loansByStatus: any[] = [];

  // Chart instances and Subscriptions
  private charts: Chart[] = [];
  private themeSubscription?: Subscription;

  constructor(
    private statsService: StatsService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.fetchAllChartsData();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRender();

    // Re-render on theme change
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(() => {
      if (this.viewReady && this.dataReady) {
        setTimeout(() => this.renderCharts(), 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    this.themeSubscription?.unsubscribe();
  }

  // Unified Data Fetching with forkJoin
  public fetchAllChartsData(): void {
    this.loading = true;
    this.error = false;
    this.dataReady = false;
    this.destroyCharts();

    forkJoin({
      summary: this.statsService.getSummary(),
      debtors: this.statsService.getDebtors(),
      expirations: this.statsService.getUpcomingExpirations(),
      books: this.statsService.getMostBorrowedBooks(),
      genres: this.statsService.getLoansByGenre(),
      fines: this.statsService.getFinesStats(),
      authors: this.statsService.getMostBorrowedAuthors(),
      punctuality: this.statsService.getPunctualityRate(),
      trends: this.statsService.getLoansByMonth(),
      status: this.statsService.getLoansByStatus(),
      dist: this.statsService.getInventoryDistribution()
    }).subscribe({
      next: (results) => {
        this.applyData(results);
        this.dataReady = true;
        this.loading = false;
        this.today = new Date();
        this.tryRender();
      },
      error: (err) => {
        console.error('Error fetching stats data:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private applyData(data: any): void {
    this.summary = data.summary || {};
    this.debtors = data.debtors || [];
    this.upcomingExpirations = data.expirations || [];
    this.mostBorrowedBooks = data.books || [];
    this.loansByGenre = data.genres || [];
    this.finesStats = data.fines || [];
    this.mostBorrowedAuthors = data.authors || [];
    this.punctualityRate = data.punctuality;
    this.loansByMonth = data.trends || [];
    this.loansByStatus = data.status || [];
    this.inventoryDistribution = data.dist;
  }

  private tryRender(): void {
    if (this.viewReady && this.dataReady) {
      this.renderCharts();
    }
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private renderCharts(): void {
    this.destroyCharts();

    const isDark = document.body.classList.contains('dark-theme');
    const primaryColor = isDark ? '#00e5ff' : '#0284c7';

    // Chart 1: Popular Books
    if (this.mostBorrowedBooks.length > 0) 
      this.renderBarChart(this.popChartRef, this.mostBorrowedBooks, 'titulo', 'total', primaryColor);

    // Chart 2: Loans by Genre
    if (this.loansByGenre.length > 0) 
      this.renderGenreChart(this.genreChartRef, this.loansByGenre);

    // Chart 3: Fines
    if (this.finesStats.length > 0) 
      this.renderDoughnutChart(this.finesChartRef, this.finesStats, 'estado', 'total');

    // Chart 4: Popular Authors
    if (this.mostBorrowedAuthors.length > 0) 
      this.renderBarChart(this.authorChartRef, this.mostBorrowedAuthors, 'autor', 'total', '#10b981');

    // Chart 5: Punctuality
    if (this.punctualityRate) 
      this.renderPunctualityChart(this.punctualityChartRef, this.punctualityRate);

    // Chart 6: Trend
    if (this.loansByMonth && this.loansByMonth.length > 0) 
      this.renderTrendChart(this.loansByMonth);

    // Chart 7: Distribution
    if (this.inventoryDistribution && Object.keys(this.inventoryDistribution).length > 0) 
      this.renderDistributionChart(this.inventoryDistribution);

    // Chart 8: Loans by Status
    if (this.loansByStatus.length > 0)
      this.renderPieChart(this.statusChartRef, this.loansByStatus, 'estado', 'total');
  }

  private getChartOptions(overrideOptions: any = {}) {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';

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
          beginAtZero: true,
          ticks: { color: textColor, font: { size: 10 }, precision: 0 },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor, font: { size: 10 }, precision: 0 },
          grid: { color: gridColor }
        }
      },
      ...overrideOptions
    };
  }

  private renderBarChart(ref: ElementRef, data: any[], labelKey: string, valueKey: string, color: string) {
    if (!ref?.nativeElement) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d[labelKey]),
        datasets: [{ label: 'Total', data: data.map(d => d[valueKey]), backgroundColor: color, borderRadius: 6, maxBarThickness: 32 }]
      },
      options: this.getChartOptions({ indexAxis: 'y', plugins: { legend: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderGenreChart(ref: ElementRef, data: any[]) {
    if (!ref?.nativeElement) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'polarArea',
      data: {
        labels: data.map(d => d.genero || 'Sin Género'),
        datasets: [{
          data: data.map(d => d.total) as number[],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ]
        }]
      },
      options: this.getChartOptions({
        scales: {
          r: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { display: false }
          },
          x: { display: false },
          y: { display: false }
        }
      })
    });
    this.charts.push(chart);
  }

  private renderPieChart(ref: ElementRef, data: any[], labelKey: string, valueKey: string) {
    if (!ref?.nativeElement) return;
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
    if (!ref?.nativeElement) return;
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
    if (!ref?.nativeElement) return;
    const chart = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['A tiempo', 'Con retraso'],
        datasets: [{ data: [data.aTiempo, data.atrasados], backgroundColor: ['#10b981', '#f59e0b'] }]
      },
      options: this.getChartOptions({ cutout: '70%', scales: { x: { display: false }, y: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderTrendChart(data: any[]) {
    if (!this.trendChartRef?.nativeElement) return;
    const filledData = this.fillMissingMonths(data);
    const isDark = document.body.classList.contains('dark-theme');
    const chart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: filledData.map(d => d.mes),
        datasets: [{
          label: 'Interacciones',
          data: filledData.map(d => d.total) as number[],
          borderColor: isDark ? '#00e5ff' : '#0284c7',
          fill: true,
          backgroundColor: isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(2, 132, 199, 0.1)',
          tension: 0.4
        }]
      },
      options: this.getChartOptions({ plugins: { legend: { display: false } } })
    });
    this.charts.push(chart);
  }

  private renderDistributionChart(data: any) {
    if (!this.distChartRef?.nativeElement) return;
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

  private fillMissingMonths(data: any[]): any[] {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const esMonths = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const today = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const enName = monthNames[d.getMonth()];
      const esName = esMonths[d.getMonth()];
      const existing = data.find(item => 
        item.mes?.toLowerCase() === enName.toLowerCase() || 
        item.mes?.toLowerCase() === esName.toLowerCase() ||
        item.mes === `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      );
      result.push({ mes: esName, total: existing ? existing.total : 0 });
    }
    return result;
  }
}
