import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService, Libro, EjemplarDTO } from '../../services/book.service';
import { ResenaService, Resena } from '../../services/resena.service';
import { LoanService } from '../../services/loan.service';
import { AuthService } from '../../services/auth.service';
import { StatsService } from '../../services/stats.service';
import { ConfigService } from '../../core/services/config.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libro-detalle.component.html',
  styleUrls: ['./libro-detalle.component.scss']
})
export class LibroDetalleComponent implements OnInit {
  Math = Math;
  libro: Libro | null = null;
  loading = true;
  isAdmin = false;
  libroId = '';

  
  showEjemplarForm = false;
  nuevoCodigo = '';
  addingEjemplar = false;
  nextSuggestedCode = '';

  
  resenasLibro: Resena[] = [];
  promedioLibro = 0;
  showResenaForm = false;
  resenaCalificacion = 5;
  resenaComentario = '';
  submittingResena = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private resenaService: ResenaService,
    private loanService: LoanService,
    private authService: AuthService,
    private statsService: StatsService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.libroId = this.route.snapshot.paramMap.get('id') || '';
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.loadLibro();
    this.loadResenas();
  }

  loadLibro() {
    this.loading = true;
    const apiUrl = this.configService.apiUrl || 'http://localhost:8080';
    this.bookService.getBookById(this.libroId).subscribe({
      next: (libro: Libro) => {
        if (libro.urlQr && !libro.urlQr.startsWith('http')) {
          libro.urlQr = `${apiUrl}${libro.urlQr}`;
        }
        if (libro.archivoDigital && !libro.archivoDigital.startsWith('http')) {
          libro.archivoDigital = `${apiUrl}${libro.archivoDigital}`;
        }
        if (libro.urlPortada && !libro.urlPortada.startsWith('http') && !libro.urlPortada.startsWith('https')) {
          libro.urlPortada = `${apiUrl}${libro.urlPortada}`;
        }
        this.libro = libro;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadResenas() {
    this.resenaService.getByLibro(this.libroId).subscribe({
      next: (r: Resena[]) => this.resenasLibro = r
    });
    this.resenaService.getPromedio(this.libroId).subscribe({
      next: (p: any) => this.promedioLibro = p.promedio
    });
  }

  getAutoresStr(): string {
    return this.libro?.autores?.map(a => a.nombre).join(', ') || 'Sin autor';
  }

  goBack() {
    if (this.isAdmin) {
      this.router.navigate(['/admin/libros']);
    } else {
      this.router.navigate(['/cliente/catalogo']);
    }
  }

  
  
  

  toggleEjemplarForm() {
    this.showEjemplarForm = !this.showEjemplarForm;
    this.nuevoCodigo = '';
    if (this.showEjemplarForm) {
      this.bookService.getNextEjemplarCode().subscribe({
        next: (res) => {
          this.nextSuggestedCode = res.nextCode;
          this.nuevoCodigo = res.nextCode;
        }
      });
    }
  }

  addEjemplar() {
    if (!this.nuevoCodigo.trim()) return;
    this.addingEjemplar = true;
    this.bookService.addEjemplar(this.libroId, { codigo: this.nuevoCodigo }).subscribe({
      next: () => {
        this.nuevoCodigo = '';
        this.showEjemplarForm = false;
        this.addingEjemplar = false;
        this.loadLibro(); 
        Swal.fire('¡Añadido!', 'Ejemplar registrado correctamente.', 'success');
      },
      error: (err) => {
        this.addingEjemplar = false;
        const msg = err.error?.error || 'No se pudo añadir el ejemplar.';
        Swal.fire('Atención', msg, 'error');
      }
    });
  }

  deleteEjemplar(ejemplar: EjemplarDTO) {
    Swal.fire({
      title: '¿Eliminar ejemplar?',
      text: `Se borrará la copia con código ${ejemplar.codigo}`,
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.bookService.deleteEjemplar(this.libroId, ejemplar.id).subscribe({
          next: () => {
            this.loadLibro(); 
            Swal.fire('Eliminado', '', 'success');
          }
        });
      }
    });
  }

  verQrEjemplar(ejemplar: EjemplarDTO) {
    const apiUrl = this.configService.apiUrl || 'http://localhost:8080';
    
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const qrUrl = `${cleanApiUrl}/api/libros/${this.libroId}/ejemplares/${ejemplar.id}/qr`;
    
    Swal.fire({
      title: `QR — ${ejemplar.codigo}`,
      html: `
        <div style="text-align: center; min-height: 250px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <img src="${qrUrl}" alt="Cargando QR..." 
               style="width:250px;height:250px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
               onerror="this.style.display='none'; document.getElementById('qr-error').style.display='block';">
          <div id="qr-error" style="display:none; color: #ef4444; font-size: 0.9rem; padding: 2rem;">
            <i class='bx bx-error-circle' style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
            No se pudo cargar el código QR.<br>Asegúrate de que el backend esté corriendo.
          </div>
          <p style="margin-top:1rem;color:#64748b;font-size:0.9rem;">Escanea para solicitar préstamo</p>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: 400,
      padding: '2rem'
    });
  }

  verQrLibro() {
    if (this.libro?.urlQr) {
      Swal.fire({
        title: `QR Libro — ${this.libro.titulo}`,
        html: `<img src="${this.libro.urlQr}" style="width:250px;height:250px;">`,
        showConfirmButton: false
      });
    }
  }

  getTotalEjemplares(): number {
    return this.libro?.ejemplares?.length || 0;
  }

  getStockDisponible(): number {
    return this.libro?.ejemplares?.filter(e => e.disponible).length || 0;
  }

  reservarLibro() {
    if (this.getStockDisponible() <= 0) {
      Swal.fire('No disponible', 'No hay ejemplares disponibles.', 'info');
      return;
    }

    const userPayload = this.authService.getPayload();
    if (!userPayload) return;

    
    const ejemplar = this.libro?.ejemplares?.find(e => e.disponible);
    if (!ejemplar) return;

    Swal.fire({
      title: '¿Reservar préstamo?',
      text: `${this.libro?.titulo} (${ejemplar.codigo})`,
      icon: 'question',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        const today = new Date();
        const body = {
          usuarioId: userPayload.id || userPayload.sub,
          libroId: this.libro!.id,
          ejemplarCodigo: ejemplar.codigo,
          fechaPrestamo: today.toISOString(),
          fechaDevolucion: new Date(today.getTime() + 15*24*60*60*1000).toISOString(),
          devuelto: false
        };

        this.loanService.create(body).subscribe({
          next: () => {
            this.loadLibro();
            Swal.fire('¡Reservado!', 'Tu solicitud está pendiente de aprobación.', 'success');
          },
          error: (err) => Swal.fire('Error', err.error?.error || 'No se pudo reservar.', 'error')
        });
      }
    });
  }

  leerOnline() {
    if (this.libro?.archivoDigital) {
      window.open(this.libro.archivoDigital, '_blank');
    }
  }

  toggleResenaForm() {
    this.showResenaForm = !this.showResenaForm;
    this.resenaCalificacion = 5;
    this.resenaComentario = '';
  }

  setCalificacion(stars: number) { this.resenaCalificacion = stars; }

  submitResena() {
    const userPayload = this.authService.getPayload();
    if (!userPayload) return;

    this.submittingResena = true;
    this.resenaService.create({
      libro: { id: this.libroId },
      usuario: { id: userPayload.id || userPayload.sub },
      calificacion: this.resenaCalificacion,
      comentario: this.resenaComentario
    }).subscribe({
      next: () => {
        this.submittingResena = false;
        this.showResenaForm = false;
        this.loadResenas();
        Swal.fire('¡Gracias!', 'Reseña publicada.', 'success');
      },
      error: () => { this.submittingResena = false; Swal.fire('Error', 'No se pudo enviar.', 'error'); }
    });
  }

  getStars(n: number): number[] { return Array(n).fill(0); }
  getEmptyStars(n: number): number[] { return Array(5 - n).fill(0); }
}
