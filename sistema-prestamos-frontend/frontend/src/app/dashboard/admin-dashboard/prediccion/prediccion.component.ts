import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { PrediccionService, PrediccionRequest, PrediccionResponse } from '../../../services/prediccion.service';
import { GeneroService, Genero } from '../../../services/genero.service';
import { ThemeService } from '../../../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-prediccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prediccion.component.html',
  styleUrls: ['./prediccion.component.scss']
})
export class PrediccionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('predictChart') predictChartRef!: ElementRef<HTMLCanvasElement>;

  // Selección automática (sin digitación manual)
  categoriaSeleccionada: string = 'Novela';
  mesSeleccionado: number = (new Date().getMonth() + 2 > 12) ? 1 : new Date().getMonth() + 2;

  // Lista de categorías sincronizada con el catálogo
  categorias: string[] = [
    'Novela',
    'Historia',
    'Fantasía',
    'Ciencia Ficción',
    'Biografía',
    'Académico'
  ];

  meses = [
    { num: 1, nombre: 'Enero' },
    { num: 2, nombre: 'Febrero' },
    { num: 3, nombre: 'Marzo' },
    { num: 4, nombre: 'Abril' },
    { num: 5, nombre: 'Mayo' },
    { num: 6, nombre: 'Junio' },
    { num: 7, nombre: 'Julio' },
    { num: 8, nombre: 'Agosto' },
    { num: 9, nombre: 'Septiembre' },
    { num: 10, nombre: 'Octubre' },
    { num: 11, nombre: 'Noviembre' },
    { num: 12, nombre: 'Diciembre' }
  ];

  // State
  loading = false;
  resultado: PrediccionResponse | null = null;
  errorMensaje: string | null = null;

  // Chart
  private chartInstance?: Chart;
  private themeSub?: Subscription;

  constructor(
    private prediccionService: PrediccionService,
    private generoService: GeneroService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Cargar géneros reales de la base de datos si están disponibles
    this.cargarGenerosBd();
    // Ejecutar estimación inicial automática conectada a MongoDB
    this.ejecutarPrediccion();
  }

  cargarGenerosBd(): void {
    this.generoService.getAll().subscribe({
      next: (generosBd: Genero[]) => {
        if (generosBd && generosBd.length > 0) {
          const nombresBd = generosBd.map(g => g.nombre).filter(n => !!n);
          // Combinar y eliminar duplicados manteniendo el orden preferente
          const conjunto = new Set([...this.categorias, ...nombresBd]);
          this.categorias = Array.from(conjunto);
        }
      },
      error: () => {
        // En caso de demora de red, mantiene la lista de categorías base
      }
    });
  }

  ngAfterViewInit(): void {
    this.themeSub = this.themeService.isDarkTheme$.subscribe(() => {
      if (this.resultado) {
        this.renderizarGrafica();
      }
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
    this.chartInstance?.destroy();
  }

  get variacionPorcentual(): number {
    if (!this.resultado || !this.resultado.prom3 || this.resultado.prom3 === 0) return 0;
    const diff = ((this.resultado.prediccion_prestamos - this.resultado.prom3) / this.resultado.prom3) * 100;
    return Math.round(diff * 10) / 10;
  }

  ejecutarPrediccion(): void {
    this.loading = true;
    this.errorMensaje = null;

    // Solo enviamos categoría y mes; MongoDB calcula automáticamente el previo y el promedio
    const payload: PrediccionRequest = {
      categoria: this.categoriaSeleccionada,
      mes: Number(this.mesSeleccionado)
    };

    this.prediccionService.obtenerPrediccion(payload).subscribe({
      next: (res) => {
        this.resultado = res;
        this.loading = false;
        setTimeout(() => this.renderizarGrafica(), 50);
      },
      error: (err) => {
        console.error('Error al consultar cálculo de demanda:', err);
        this.errorMensaje = err?.error?.detail || err?.message || 'No se pudo conectar con el servicio de cálculo.';
        this.loading = false;
      }
    });
  }

  seleccionarCategoria(cat: string): void {
    this.categoriaSeleccionada = cat;
    this.ejecutarPrediccion();
  }

  getNombreMes(num: number): string {
    const m = this.meses.find(item => item.num === num);
    return m ? m.nombre : 'Mes ' + num;
  }

  private renderizarGrafica(): void {
    if (!this.predictChartRef?.nativeElement || !this.resultado) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.predictChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark-theme');
    const colorTexto = isDark ? '#94a3b8' : '#475569';
    const colorGrid = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    const valorProm3 = this.resultado.prom3 ?? 0;
    const valorPrevio = this.resultado.previo ?? 0;
    const valorPrediccion = this.resultado.prediccion_prestamos;

    const labels = [
      'Promedio Trimestral (BD)',
      'Mes Anterior (BD)',
      `Demanda Estimada (${this.getNombreMes(this.resultado.mes)})`
    ];
    const dataValues = [valorProm3, valorPrevio, valorPrediccion];

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Circulación de Ejemplares',
            data: dataValues,
            backgroundColor: [
              'rgba(148, 163, 184, 0.45)',
              'rgba(2, 132, 199, 0.55)',
              isDark ? 'rgba(56, 189, 248, 0.85)' : '#0284c7'
            ],
            borderColor: [
              '#94a3b8',
              '#0284c7',
              isDark ? '#38bdf8' : '#0369a1'
            ],
            borderWidth: 1.5,
            borderRadius: 8,
            barPercentage: 0.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.raw} préstamos`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: colorTexto, font: { weight: 'bold' } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: colorTexto },
            grid: { color: colorGrid }
          }
        }
      }
    });
  }
}
