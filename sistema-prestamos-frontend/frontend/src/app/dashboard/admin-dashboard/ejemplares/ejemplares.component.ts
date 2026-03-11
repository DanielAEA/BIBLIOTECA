import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EjemplarService, Ejemplar, EjemplarPayload } from '../../../services/ejemplar.service';
import { BookService, Libro } from '../../../services/book.service';
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
  editingEjemplar: Ejemplar | null = null;
  showForm = false;
  ejemplarCodigo = '';
  ejemplarDisponible = true;
  selectedLibroId: number | null = null;
  libros: Libro[] = [];
  loading = false;
  submitting = false;

  constructor(
    private ejemplarService: EjemplarService,
    private bookService: BookService
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
    this.selectedLibroId = null;
    this.showForm = true;
  }

  editEjemplar(ejemplar: Ejemplar) {
    this.editingEjemplar = { ...ejemplar };
    this.ejemplarCodigo = ejemplar.codigo;
    this.ejemplarDisponible = ejemplar.disponible;
    this.selectedLibroId = ejemplar.libro.id;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingEjemplar = null;
    this.ejemplarCodigo = '';
    this.ejemplarDisponible = true;
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
      libro: { id: this.selectedLibroId! }
    };

    if (this.editingEjemplar) {
      const updatedEjemplar: Ejemplar = {
        ...this.editingEjemplar,
        codigo: payload.codigo,
        disponible: payload.disponible,
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
}
