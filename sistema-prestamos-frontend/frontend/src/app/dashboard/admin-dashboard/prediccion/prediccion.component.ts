import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { PrediccionService, PrediccionRequest, PrediccionResponse } from '../../../services/prediccion.service';
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

  // Form Model
  mesSeleccionado: number = 5;
  categoriaSeleccionada: string = 'Historia';
  previoValor: number = 44;
  prom3Valor: number = 38.0;

  // Categorías del modelo
  categorias: string[] = [
    'Historia',
    'Novela',
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
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Ejecutar predicción inicial de prueba
    this.ejecutarPrediccion();
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

  ejecutarPrediccion(): void {
    this.loading = true;
    this.errorMensaje = null;

    const payload: PrediccionRequest = {
      mes: Number(this.mesSeleccionado),
      categoria: this.categoriaSeleccionada,
      previo: Number(this.previoValor),
      prom3: Number(this.prom3Valor)
    };

    this.prediccionService.obtenerPrediccion(payload).subscribe({
      next: (res) => {
        this.resultado = res;
        this.loading = false;
        setTimeout(() => this.renderizarGrafica(), 50);
      },
      error: (err) => {
        console.error('Error al consultar microservicio predictivo:', err);
        this.errorMensaje = err?.error?.detail || err?.message || 'No se pudo conectar con el microservicio predictivo.';
        this.loading = false;
      }
    });
  }

  cargarPreset(categoria: string, mes: number, previo: number, prom3: number): void {
    this.categoriaSeleccionada = categoria;
    this.mesSeleccionado = mes;
    this.previoValor = previo;
    this.prom3Valor = prom3;
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

    const labels = ['Promedio (3 Meses)', 'Mes Anterior (Previo)', `Proyección IA (${this.getNombreMes(this.resultado.mes)})`];
    const dataValues = [this.prom3Valor, this.previoValor, this.resultado.prediccion_prestamos];

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Demanda de Préstamos',
            data: dataValues,
            backgroundColor: [
              'rgba(148, 163, 184, 0.5)',
              'rgba(2, 132, 199, 0.65)',
              isDark ? '#00e5ff' : '#0284c7'
            ],
            borderColor: [
              '#94a3b8',
              '#0284c7',
              isDark ? '#38bdf8' : '#0369a1'
            ],
            borderWidth: 2,
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
              label: (item) => ` ${item.raw} préstamos estimados`
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
