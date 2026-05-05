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
  today: Date = new Date();
  Math = Math;
  isSampleData = false;

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

  // Real Data Backup
  private realData: any = null;

  constructor(
    private statsService: StatsService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTablesData();
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
  private fetchAllChartsData(): void {
    this.loading = true;
    forkJoin({
      summary: this.statsService.getSummary().pipe(catchError(() => of({}))),
      debtors: this.statsService.getDebtors().pipe(catchError(() => of([]))),
      expirations: this.statsService.getUpcomingExpirations().pipe(catchError(() => of([]))),
      books: this.statsService.getMostBorrowedBooks().pipe(catchError(() => of([]))),
      genres: this.statsService.getLoansByGenre().pipe(catchError(() => of([]))),
      fines: this.statsService.getFinesStats().pipe(catchError(() => of([]))),
      authors: this.statsService.getMostBorrowedAuthors().pipe(catchError(() => of([]))),
      punctuality: this.statsService.getPunctualityRate().pipe(catchError(() => of({ aTiempo: 0, atrasados: 0 }))),
      trends: this.statsService.getLoansByMonth().pipe(catchError(() => of([]))),
      status: this.statsService.getLoansByStatus().pipe(catchError(() => of([]))),
      dist: this.statsService.getInventoryDistribution().pipe(catchError(() => of({})))
    }).subscribe({
      next: (results) => {
        this.realData = results;
        this.applyData(results);

        // Verification for automatic preview mode - If there's literally anything in the DB, use real data
        const summary = results.summary || {};
        const hasRealData = (summary.totalLibros > 0) || 
                          (summary.totalUsuarios > 0) || 
                          (summary.prestamosActivos > 0) ||
                          (results.trends && results.trends.length > 0);

        console.log('--- Resumen de Datos ---');
        console.log('Libros:', summary.totalLibros);
        console.log('Usuarios:', summary.totalUsuarios);
        console.log('Préstamos Activos:', summary.prestamosActivos);
        console.log('Tendencias:', results.trends?.length);
        console.log('¿Usando datos reales?:', hasRealData);

        if (!hasRealData) {
          this.isSampleData = true;
          this.populateWithSampleData();
        } else {
          this.isSampleData = false;
        }

        this.dataReady = true;
        this.loading = false;
        this.tryRender();
      },
      error: (err) => {
        console.error('Error fetching stats data:', err);
        this.isSampleData = true;
        this.populateWithSampleData();
        this.dataReady = true;
        this.loading = false;
        this.tryRender();
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

  toggleDataSource(): void {
    this.isSampleData = !this.isSampleData;
    if (this.isSampleData) {
      this.populateWithSampleData();
    } else {
      if (this.realData) {
        this.applyData(this.realData);
      } else {
        this.fetchAllChartsData();
        return;
      }
    }
    this.today = new Date();
    setTimeout(() => this.renderCharts(), 0);
  }

  private populateWithSampleData(): void {
    this.summary = {
      totalLibros: 450,
      totalUsuarios: 125,
      prestamosActivos: 18,
      totalMultasPendientes: 45000,
      prestamosVencidos: 3,
      ejemplaresDisponibles: 432,
      nuevosUsuariosMes: 12,
      tasaPuntualidad: 85
    };
    this.debtors = [
      { usuario: 'Juan Pérez', deuda: 12500 },
      { usuario: 'María García', deuda: 5000 },
      { usuario: 'Carlos López', deuda: 8500 }
    ];
    this.upcomingExpirations = [
      { libro: 'Cien años de soledad', usuario: 'Juan Pérez', vencimiento: new Date(Date.now() + 86400000) },
      { libro: '1984', usuario: 'Elena Ruiz', vencimiento: new Date(Date.now() + 172800000) }
    ];
    this.mostBorrowedBooks = [
      { titulo: 'Cien años de soledad', total: 25 },
      { titulo: 'Don Quijote de la Mancha', total: 18 },
      { titulo: 'El Principito', total: 15 },
      { titulo: '1984', total: 12 },
      { titulo: 'Rayuela', total: 10 }
    ];
    this.loansByGenre = [
      { genero: 'Ficción', total: 45 },
      { genero: 'Historia', total: 30 },
      { genero: 'Ciencia', total: 20 },
      { genero: 'Biografía', total: 15 },
      { genero: 'Poesía', total: 10 }
    ];
    this.finesStats = [
      { estado: 'PAGADA', total: 65000 },
      { estado: 'PENDIENTE', total: 45000 }
    ];
    this.mostBorrowedAuthors = [
      { autor: 'Gabriel García Márquez', total: 40 },
      { autor: 'Miguel de Cervantes', total: 32 },
      { autor: 'Antoine de Saint-Exupéry', total: 28 },
      { autor: 'George Orwell', total: 22 },
      { autor: 'Julio Cortázar', total: 18 }
    ];
    this.punctualityRate = { aTiempo: 85, atrasados: 15 };
    this.loansByMonth = [
      { mes: 'Enero', total: 120 },
      { mes: 'Febrero', total: 150 },
      { mes: 'Marzo', total: 110 },
      { mes: 'Abril', total: 180 },
      { mes: 'Mayo', total: 200 }
    ];
    this.loansByStatus = [
      { estado: 'ENTREGADO', total: 150 },
      { estado: 'EN_PROCESO', total: 45 },
      { estado: 'DEVUELTO', total: 300 }
    ];
    this.inventoryDistribution = { 'FISICO': 450, 'DIGITAL': 120, 'AMBOS': 80 };
  }

  private tryRender(): void {
    if (this.viewReady && this.dataReady) {
      this.renderCharts();
    }
  }

  private loadSummary() {
    // No longer needed separately as it's included in fetchAllChartsData
  }

  private loadTablesData() {
    // No longer needed separately as it's included in fetchAllChartsData
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private renderCharts(): void {
    this.destroyCharts();

    // Chart 1: Popular Books
    if (this.mostBorrowedBooks.length > 0) 
      this.renderBarChart(this.popChartRef, this.mostBorrowedBooks, 'titulo', 'total', '#6366f1');

    // Chart 2: Loans by Genre (Polar Area for better visualization)
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
    if (this.loansByMonth) 
      this.renderTrendChart(this.loansByMonth);

    // Chart 7: Distribution
    if (this.inventoryDistribution) 
      this.renderDistributionChart(this.inventoryDistribution);

    // Chart 8: Loans by Status
    if (this.loansByStatus.length > 0)
      this.renderPieChart(this.statusChartRef, this.loansByStatus, 'estado', 'total');
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
    const chart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: filledData.map(d => d.mes),
        datasets: [{ label: 'Interacciones', data: filledData.map(d => d.total) as number[], borderColor: '#6366f1', fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4 }]
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
