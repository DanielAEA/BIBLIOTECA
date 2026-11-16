import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { EjemplarService, Ejemplar, EjemplarPayload } from '../../../services/ejemplar.service';
import { BookService, Libro } from '../../../services/book.service';
import { ConfigService } from '../../../core/services/config.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ejemplares',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejemplares.component.html',
  styleUrls: ['./ejemplares.component.scss']
})
export class EjemplaresComponent implements OnInit {
  ejemplares: Ejemplar[] = [];
  selectedEjemplarIds = new Set<string>();
  editingEjemplar: Ejemplar | null = null;
  showForm = false;
  ejemplarCodigo = '';
  ejemplarDisponible = true;
  ejemplarBloque = '';
  ejemplarEstante = '';
  selectedLibroId: string | null = null;
  libros: Libro[] = [];
  loading = false;
  submitting = false;

  constructor(
    private ejemplarService: EjemplarService,
    private bookService: BookService,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.loadEjemplares();
    this.loadLibros();
  }

  loadEjemplares() {
    this.loading = true;
    this.ejemplarService.getAll().subscribe({
      next: (ejemplares) => {
        this.ejemplares = ejemplares;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ejemplares:', err);
        this.loading = false;
      }
    });
  }

  getEjemplaresAgrupados() {
    const groups: { [key: string]: Ejemplar[] } = {};
    this.ejemplares.forEach(e => {
      const b = e.bloque || 'General';
      if (!groups[b]) groups[b] = [];
      groups[b].push(e);
    });
    return Object.keys(groups).sort().map(key => ({
      bloque: key,
      items: groups[key]
    }));
  }

  loadLibros() {
    this.bookService.getAllBooks().subscribe({
      next: (libros) => (this.libros = libros),
      error: (err) => console.error('Error al cargar libros:', err)
    });
  }

  createEjemplar() {
    this.editingEjemplar = null;
    this.ejemplarCodigo = '';
    this.ejemplarDisponible = true;
    this.ejemplarBloque = '';
    this.ejemplarEstante = '';
    this.selectedLibroId = null;
    this.showForm = true;
  }

  editEjemplar(ejemplar: Ejemplar) {
    this.editingEjemplar = { ...ejemplar };
    this.ejemplarCodigo = ejemplar.codigo;
    this.ejemplarDisponible = ejemplar.disponible;
    this.ejemplarBloque = ejemplar.bloque || '';
    this.ejemplarEstante = ejemplar.estante || '';
    this.selectedLibroId = ejemplar.libro.id;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingEjemplar = null;
    this.ejemplarCodigo = '';
    this.ejemplarDisponible = true;
    this.ejemplarBloque = '';
    this.ejemplarEstante = '';
    this.selectedLibroId = null;
  }

  saveEjemplar() {
    if (!this.ejemplarCodigo.trim()) {
      Swal.fire('Atención', 'Ingresa el código del ejemplar.', 'warning');
      return;
    }
    if (!this.selectedLibroId) {
      Swal.fire('Atención', 'Selecciona un libro.', 'warning');
      return;
    }

    this.submitting = true;
    const payload: EjemplarPayload = {
      codigo: this.ejemplarCodigo.trim(),
      disponible: this.ejemplarDisponible,
      bloque: this.ejemplarBloque.trim() || undefined,
      estante: this.ejemplarEstante.trim() || undefined,
      libro: { id: this.selectedLibroId! }
    };

    if (this.editingEjemplar) {
      const updatedEjemplar: Ejemplar = {
        ...this.editingEjemplar,
        codigo: payload.codigo,
        disponible: payload.disponible,
        bloque: payload.bloque,
        estante: payload.estante,
        libro: this.libros.find(l => l.id === payload.libro.id)!
      };
      this.ejemplarService
        .update(updatedEjemplar)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadEjemplares();
            this.cancelForm();
            Swal.fire({
              title: '¡Guardado!',
              text: 'Ejemplar procesado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al procesar ejemplar:', err);
            Swal.fire('Error', 'No se pudo completar la operación', 'error');
          }
        });
    } else {
      this.ejemplarService
        .create(payload)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadEjemplares();
            this.cancelForm();
            Swal.fire({
              title: '¡Creado!',
              text: 'Ejemplar creado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al crear ejemplar:', err);
            Swal.fire('Error', 'No se pudo crear el ejemplar', 'error');
          }
        });
    }
  }

  deleteEjemplar(ejemplar: Ejemplar) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar el ejemplar "${ejemplar.codigo}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejemplarService.delete(ejemplar.id).subscribe({
          next: () => {
            this.selectedEjemplarIds.delete(ejemplar.id);
            this.loadEjemplares();
            Swal.fire('¡Eliminado!', 'El ejemplar ha sido eliminado.', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar ejemplar:', err);
            Swal.fire('Error', 'No se pudo eliminar el ejemplar', 'error');
          }
        });
      }
    });
  }

  toggleSelection(id: string) {
    if (this.selectedEjemplarIds.has(id)) {
      this.selectedEjemplarIds.delete(id);
    } else {
      this.selectedEjemplarIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.ejemplares.forEach(e => this.selectedEjemplarIds.add(e.id));
    } else {
      this.selectedEjemplarIds.clear();
    }
  }

  isAllSelected(): boolean {
    return this.ejemplares.length > 0 && this.ejemplares.every(e => this.selectedEjemplarIds.has(e.id));
  }

  deleteSelectedEjemplares() {
    const count = this.selectedEjemplarIds.size;
    if (count === 0) return;

    Swal.fire({
      title: '¿Eliminar seleccionados?',
      text: `Se eliminarán ${count} ejemplar(es) seleccionado(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const requests = Array.from(this.selectedEjemplarIds).map(id => this.ejemplarService.delete(id));
        forkJoin(requests).pipe(finalize(() => this.loading = false)).subscribe({
          next: () => {
            this.selectedEjemplarIds.clear();
            this.loadEjemplares();
            Swal.fire('¡Eliminados!', `${count} ejemplar(es) eliminado(s) correctamente.`, 'success');
          },
          error: (err) => {
            console.error('Error deleting ejemplares:', err);
            this.selectedEjemplarIds.clear();
            this.loadEjemplares();
            Swal.fire('Error', 'Ocurrió un problema al eliminar algunos ejemplares.', 'error');
          }
        });
      }
    });
  }

  verQr(ejemplar: Ejemplar) {
    const apiBase = this.configService.apiUrl;
    const cleanApi = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    const qrImgUrl = `${cleanApi}/api/ejemplares/${ejemplar.id}/qr`;
    const solicitUrl = `/solicitar-ejemplar/${ejemplar.id}`;
    const libroTitulo = ejemplar.libro?.titulo || 'Libro';
    const ubicacion = [ejemplar.bloque, ejemplar.estante].filter(Boolean).join(' - ') || 'Biblioteca Central';
    
    Swal.fire({
      title: `Código QR • ${ejemplar.codigo}`,
      html: `
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
          <div style="background: #ffffff; padding: 14px; border-radius: 16px; border: 2px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.08); display: inline-block;">
            <img src="${qrImgUrl}" alt="QR Code ${ejemplar.codigo}" 
                 style="width:220px;height:220px;display:block;border-radius:8px;"
                 onerror="this.style.display='none'; document.getElementById('qr-error-box-ej').style.display='block';">
            <div id="qr-error-box-ej" style="display:none; color: #ef4444; font-size: 0.85rem; padding: 1.5rem; width: 220px;">
              <i class='bx bx-error-circle' style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
              No se pudo cargar el código QR.
            </div>
          </div>
          <div style="margin-top: 0.25rem;">
            <strong style="font-size: 1.05rem; color: inherit; display: block;">${libroTitulo}</strong>
            <span style="font-size: 0.85rem; color: #64748b; display: block; margin-top: 2px;">
              Ubicación: <strong>${ubicacion}</strong> • Estado: <strong>${ejemplar.disponible ? 'Disponible' : 'Prestado'}</strong>
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center;">
            <button id="btn-descargar-qr-ej" class="swal2-styled" style="background:#0284c7;color:#fff;border-radius:8px;padding:8px 16px;font-size:0.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:none;">
              <i class='bx bx-download'></i> Descargar QR
            </button>
            <button id="btn-imprimir-qr-ej" class="swal2-styled" style="background:#059669;color:#fff;border-radius:8px;padding:8px 16px;font-size:0.85rem;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:none;">
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
        const btnDescargar = document.getElementById('btn-descargar-qr-ej');
        if (btnDescargar) {
          btnDescargar.addEventListener('click', () => {
            this.descargarQr(qrImgUrl, `QR-${ejemplar.codigo}.png`);
          });
        }
        const btnImprimir = document.getElementById('btn-imprimir-qr-ej');
        if (btnImprimir) {
          btnImprimir.addEventListener('click', () => {
            this.imprimirEtiqueta(libroTitulo, ejemplar.codigo, ubicacion, qrImgUrl);
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
}
