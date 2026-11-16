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
  nuevoBloque = '';
  nuevoEstante = '';
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
    const payload = { 
      codigo: this.nuevoCodigo,
      bloque: this.nuevoBloque.trim() || undefined,
      estante: this.nuevoEstante.trim() || undefined
    };
    this.bookService.addEjemplar(this.libroId, payload).subscribe({
      next: () => {
        this.nuevoCodigo = '';
        this.nuevoBloque = '';
        this.nuevoEstante = '';
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
    const solicitUrl = `/solicitar-ejemplar/${ejemplar.id}`;
    const libroTitulo = this.libro?.titulo || 'Libro';
    const ubicacion = [ejemplar.bloque, ejemplar.estante].filter(Boolean).join(' - ') || 'Biblioteca Central';

    Swal.fire({
      title: `Código QR • ${ejemplar.codigo}`,
      html: `
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
          <div style="background: #ffffff; padding: 14px; border-radius: 16px; border: 2px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.08); display: inline-block;">
            <img src="${qrUrl}" alt="QR ${ejemplar.codigo}" 
                 style="width: 220px; height: 220px; display: block; border-radius: 8px;"
                 onerror="this.style.display='none'; document.getElementById('qr-error-box').style.display='block';">
            <div id="qr-error-box" style="display:none; color: #ef4444; font-size: 0.85rem; padding: 1.5rem; width: 220px;">
              <i class='bx bx-error-circle' style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
              No se pudo cargar el código QR.
            </div>
          </div>
          <div style="margin-top: 0.25rem;">
            <strong style="font-size: 1rem; color: inherit; display: block;">${libroTitulo}</strong>
            <span style="font-size: 0.85rem; color: #64748b; display: block; margin-top: 2px;">
              Ubicación: <strong>${ubicacion}</strong> • Estado: <strong>${ejemplar.estado || 'DISPONIBLE'}</strong>
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center;">
            <button id="btn-descargar-qr" class="swal2-styled" style="background:#0284c7;color:#fff;border-radius:8px;padding:8px 16px;font-size:0.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:none;">
              <i class='bx bx-download'></i> Descargar QR
            </button>
            <button id="btn-imprimir-qr" class="swal2-styled" style="background:#059669;color:#fff;border-radius:8px;padding:8px 16px;font-size:0.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:none;">
              <i class='bx bx-printer'></i> Imprimir Etiqueta
            </button>
            <a href="${solicitUrl}" target="_blank" class="swal2-styled" style="background:#475569;color:#fff;border-radius:8px;padding:8px 16px;font-size:0.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;text-decoration:none;cursor:pointer;">
              <i class='bx bx-link-external'></i> Probar Enlace
            </a>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: 480,
      padding: '2rem',
      didOpen: () => {
        const btnDescargar = document.getElementById('btn-descargar-qr');
        if (btnDescargar) {
          btnDescargar.addEventListener('click', () => {
            this.descargarQr(qrUrl, `QR-${ejemplar.codigo}.png`);
          });
        }
        const btnImprimir = document.getElementById('btn-imprimir-qr');
        if (btnImprimir) {
          btnImprimir.addEventListener('click', () => {
            this.imprimirEtiqueta(libroTitulo, ejemplar.codigo, ubicacion, qrUrl);
          });
        }
      }
    });
  }

  descargarQr(url: string, filename: string) {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => window.open(url, '_blank'));
  }

  imprimirEtiqueta(libroTitulo: string, ejemplarCodigo: string, ubicacion: string, qrUrl: string) {
    const w = window.open('', '_blank', 'width=500,height=550');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta QR - ${ejemplarCodigo}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 95vh; margin: 0; background: #fff; }
            .sticker { width: 300px; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; box-sizing: border-box; }
            .header { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0284c7; font-weight: 800; margin-bottom: 10px; }
            .qr-img { width: 170px; height: 170px; display: block; margin: 0 auto 10px; }
            .codigo { font-family: monospace; font-size: 18px; font-weight: 800; background: #f1f5f9; padding: 4px 12px; border-radius: 6px; display: inline-block; margin-bottom: 6px; color: #0f172a; }
            .titulo { font-size: 13px; font-weight: 700; color: #0f172a; margin: 4px 0; max-height: 38px; overflow: hidden; }
            .ubicacion { font-size: 11px; color: #64748b; margin-top: 4px; }
            @media print {
              body { background: transparent; }
              .sticker { border: 1px solid #94a3b8; }
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="header">CiberBook • Biblioteca</div>
            <img src="${qrUrl}" class="qr-img" alt="QR" onload="window.print();" />
            <div class="codigo">${ejemplarCodigo}</div>
            <div class="titulo">${libroTitulo}</div>
            <div class="ubicacion">${ubicacion}</div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
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
