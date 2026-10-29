import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { GeneroService, Genero } from '../../../services/genero.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generos.component.html',
  styleUrls: ['./generos.component.scss']
})
export class GenerosComponent implements OnInit {

  generos: Genero[] = [];
  selectedGeneroIds = new Set<string>();
  editingGenero: Genero | null = null;
  showForm = false;
  generoNombre = '';
  loading = false;
  submitting = false;

  constructor(private generoService: GeneroService) { }

  ngOnInit() {
    this.loadGeneros();
  }

  loadGeneros() {
    this.loading = true;
    this.generoService.getAll().subscribe({
      next: (generos) => {
        this.generos = generos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar géneros:', err);
        this.loading = false;
      }
    });
  }

  createGenero() {
    this.editingGenero = null;
    this.generoNombre = '';
    this.showForm = true;
  }

  editGenero(genero: Genero) {
    this.editingGenero = genero;
    this.generoNombre = genero.nombre;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingGenero = null;
    this.generoNombre = '';
  }

  saveGenero() {

    if (!this.generoNombre.trim()) {
      Swal.fire({
        title: 'Atención',
        text: 'Ingresa el nombre del género.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.submitting = true;

    if (this.editingGenero) {

      this.generoService
        .update(this.editingGenero.id, this.generoNombre.trim())
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadGeneros();
            this.cancelForm();

            Swal.fire({
              title: '¡Actualizado!',
              text: 'Género actualizado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al actualizar género:', err);
            Swal.fire('Error', 'No se pudo actualizar el género', 'error');
          }
        });

    } else {

      this.generoService
        .create(this.generoNombre.trim())
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadGeneros();
            this.cancelForm();

            Swal.fire({
              title: '¡Creado!',
              text: 'Género creado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al crear género:', err);
            Swal.fire('Error', 'No se pudo crear el género', 'error');
          }
        });

    }
  }

  deleteGenero(genero: Genero) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar el género "${genero.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.isConfirmed) {

        this.generoService.delete(genero.id).subscribe({
          next: () => {
            this.selectedGeneroIds.delete(genero.id);
            this.loadGeneros();

            Swal.fire({
              title: '¡Eliminado!',
              text: 'El género ha sido eliminado.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al eliminar género:', err);
            Swal.fire('Error', 'No se pudo eliminar el género', 'error');
          }
        });

      }

    });
  }

  toggleSelection(id: string) {
    if (this.selectedGeneroIds.has(id)) {
      this.selectedGeneroIds.delete(id);
    } else {
      this.selectedGeneroIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.generos.forEach(g => this.selectedGeneroIds.add(g.id));
    } else {
      this.selectedGeneroIds.clear();
    }
  }

  isAllSelected(): boolean {
    return this.generos.length > 0 && this.generos.every(g => this.selectedGeneroIds.has(g.id));
  }

  deleteSelectedGeneros() {
    const count = this.selectedGeneroIds.size;
    if (count === 0) return;

    Swal.fire({
      title: '¿Eliminar seleccionados?',
      text: `Se eliminarán ${count} género(s) seleccionado(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const requests = Array.from(this.selectedGeneroIds).map(id => this.generoService.delete(id));
        forkJoin(requests).pipe(finalize(() => this.loading = false)).subscribe({
          next: () => {
            this.selectedGeneroIds.clear();
            this.loadGeneros();
            Swal.fire('¡Eliminados!', `${count} género(s) eliminado(s) correctamente.`, 'success');
          },
          error: (err) => {
            console.error('Error deleting generos:', err);
            this.selectedGeneroIds.clear();
            this.loadGeneros();
            Swal.fire('Error', 'Ocurrió un problema al eliminar algunos géneros.', 'error');
          }
        });
      }
    });
  }

}