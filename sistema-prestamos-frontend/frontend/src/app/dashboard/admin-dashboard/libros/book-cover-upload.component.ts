import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Libro } from '../../../services/book.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-book-cover-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cover-upload-container p-3 border rounded bg-light">
      <label class="form-label font-weight-bold">Asistente de ISBN (Google Books)</label>
      
      <div class="d-flex align-items-start gap-3">
        <div class="preview-area border rounded bg-white d-flex align-items-center justify-content-center" 
             style="width: 120px; height: 180px; overflow: hidden; flex-shrink: 0;">
          <img [src]="previewUrl || currentCover || 'https://via.placeholder.com/120x180?text=Sin+Portada'" 
               (error)="onImgError($event)"
               class="img-fluid" style="object-fit: cover; height: 100%; width: 100%;">
        </div>

        <div class="flex-grow-1">
          <div class="d-flex flex-wrap gap-2 mb-3">
            <button type="button" class="btn btn-primary" 
                    *ngIf="isbn" (click)="fetchFullMetadata()" [disabled]="searching">
              <i class="fas" [ngClass]="searching ? 'fa-spinner fa-spin' : 'fa-magic'"></i>
              Auto-completar por ISBN
            </button>
            
            <div class="w-100" *ngIf="libroId">
              <label class="small text-muted d-block mb-1">O sube una imagen manual:</label>
              <input type="file" class="form-control form-control-sm" 
                     accept="image/jpeg,image/png,image/webp"
                     (change)="onFileSelected($event)">
            </div>

            <button type="button" class="btn btn-success btn-sm mt-2" 
                    *ngIf="libroId && selectedFile" [disabled]="uploading" 
                    (click)="upload()">
              <i class="fas" [ngClass]="uploading ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
              Subir Archivo Seleccionado
            </button>

            <button type="button" class="btn btn-outline-danger btn-sm mt-2" 
                    *ngIf="libroId && currentCover && !currentCover.includes('placeholder')" 
                    (click)="delete()">
              <i class="fas fa-trash"></i> Eliminar Portada
            </button>
          </div>

          <div *ngIf="uploadProgress > 0" class="progress mt-2" style="height: 5px;">
            <div class="progress-bar bg-success" [style.width.%]="uploadProgress"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cover-upload-container { background-color: #f0f4f8; border: 1px solid #cbd5e1; }
    .preview-area { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-color: #94a3b8 !important; }
  `]
})
export class BookCoverUploadComponent {
  @Input() libroId?: string;
  @Input() isbn?: string;
  @Input() currentCover?: string;
  @Output() coverUpdated = new EventEmitter<string>();
  @Output() metadataFetched = new EventEmitter<any>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  searching = false;
  uploadProgress = 0;

  constructor(private bookService: BookService) {}

  fetchFullMetadata() {
    if (!this.isbn) return;
    this.searching = true;
    this.bookService.getBookMetadata(this.isbn).subscribe({
      next: (data) => {
        this.searching = false;
        if (data) {
          Swal.fire({
            title: '¡Libro encontrado!',
            html: `
              <div class="text-start">
                <p><strong>Título:</strong> ${data.titulo}</p>
                <p><strong>Autores:</strong> ${data.autores?.join(', ') || 'N/A'}</p>
                <p><strong>Editorial:</strong> ${data.editorial || 'N/A'}</p>
              </div>
            `,
            imageUrl: data.urlPortada,
            imageHeight: 150,
            showCancelButton: true,
            confirmButtonText: 'Importar todo',
            cancelButtonText: 'Solo portada',
            showDenyButton: true,
            denyButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.previewUrl = data.urlPortada;
              this.metadataFetched.emit(data);
              Swal.fire('Importado', 'Se han rellenado los campos del formulario', 'success');
            } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
              this.previewUrl = data.urlPortada;
              this.coverUpdated.emit(data.urlPortada);
              Swal.fire('Actualizado', 'Solo se ha actualizado la portada', 'success');
            }
          });
        } else {
          Swal.fire('No encontrado', 'No hay información para este ISBN', 'info');
        }
      },
      error: () => {
        this.searching = false;
        Swal.fire('Error', 'No se pudo conectar con el asistente', 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Error', 'El archivo supera los 2MB', 'error');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  upload() {
    if (!this.selectedFile || !this.libroId) return;
    this.uploading = true;
    this.uploadProgress = 10;

    this.bookService.uploadPortada(this.libroId, this.selectedFile).subscribe({
      next: (res) => {
        this.uploadProgress = 100;
        this.currentCover = res.urlPortada;
        this.previewUrl = null;
        this.selectedFile = null;
        this.coverUpdated.emit(res.urlPortada!);
        Swal.fire('Éxito', 'Portada subida correctamente', 'success');
        setTimeout(() => { this.uploading = false; this.uploadProgress = 0; }, 1000);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadProgress = 0;
        Swal.fire('Error', err.error?.error || 'Error al subir', 'error');
      }
    });
  }

  delete() {
    if (!this.libroId) return;
    Swal.fire({
      title: '¿Eliminar portada?',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deletePortada(this.libroId!).subscribe({
          next: () => {
            this.currentCover = undefined;
            this.previewUrl = null;
            this.coverUpdated.emit('');
            Swal.fire('Eliminado', 'Portada eliminada', 'success');
          }
        });
      }
    });
  }

  onImgError(event: any) {
    event.target.src = 'https://via.placeholder.com/120x180?text=Sin+Portada';
  }
}
