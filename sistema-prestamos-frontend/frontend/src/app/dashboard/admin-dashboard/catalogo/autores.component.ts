import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AuthorService, Autor } from '../../../services/author.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-autores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autores.component.html',
  styleUrls: ['./autores.component.scss']
})
export class AutoresComponent implements OnInit {

  autores: Autor[] = [];
  selectedAutorIds = new Set<string>();
  editingAutor: Autor | null = null;
  showForm = false;
  autorNombre = '';
  loading = false;
  submitting = false;

  constructor(private authorService: AuthorService) { }

  ngOnInit() {
    this.loadAutores();
  }

  loadAutores() {
    this.loading = true;
    this.authorService.getAll().subscribe({
      next: (autores) => {
        this.autores = autores;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar autores:', err);
        this.loading = false;
      }
    });
  }

  createAutor() {
    this.editingAutor = null;
    this.autorNombre = '';
    this.showForm = true;
  }

  editAutor(autor: Autor) {
    this.editingAutor = autor;
    this.autorNombre = autor.nombre;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingAutor = null;
    this.autorNombre = '';
  }

  saveAutor() {

    if (!this.autorNombre.trim()) {
      Swal.fire({
        title: 'Atención',
        text: 'Ingresa el nombre del autor.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.submitting = true;

    if (this.editingAutor) {

      this.authorService
        .update(this.editingAutor.id, this.autorNombre.trim())
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadAutores();
            this.cancelForm();

            Swal.fire({
              title: '¡Actualizado!',
              text: 'Autor actualizado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al actualizar autor:', err);
            Swal.fire('Error', 'No se pudo actualizar el autor', 'error');
          }
        });

    } else {

      this.authorService
        .create(this.autorNombre.trim())
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadAutores();
            this.cancelForm();

            Swal.fire({
              title: '¡Creado!',
              text: 'Autor creado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al crear autor:', err);
            Swal.fire('Error', 'No se pudo crear el autor', 'error');
          }
        });

    }
  }

  deleteAutor(autor: Autor) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar el autor "${autor.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.isConfirmed) {

        this.authorService.delete(autor.id).subscribe({
          next: () => {
            this.selectedAutorIds.delete(autor.id);
            this.loadAutores();

            Swal.fire({
              title: '¡Eliminado!',
              text: 'El autor ha sido eliminado.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al eliminar autor:', err);
            Swal.fire('Error', 'No se pudo eliminar el autor', 'error');
          }
        });

      }

    });
  }

  toggleSelection(id: string) {
    if (this.selectedAutorIds.has(id)) {
      this.selectedAutorIds.delete(id);
    } else {
      this.selectedAutorIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.autores.forEach(a => this.selectedAutorIds.add(a.id));
    } else {
      this.selectedAutorIds.clear();
    }
  }

  isAllSelected(): boolean {
    return this.autores.length > 0 && this.autores.every(a => this.selectedAutorIds.has(a.id));
  }

  deleteSelectedAutores() {
    const count = this.selectedAutorIds.size;
    if (count === 0) return;

    Swal.fire({
      title: '¿Eliminar seleccionados?',
      text: `Se eliminarán ${count} autor(es) seleccionado(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const requests = Array.from(this.selectedAutorIds).map(id => this.authorService.delete(id));
        forkJoin(requests).pipe(finalize(() => this.loading = false)).subscribe({
          next: () => {
            this.selectedAutorIds.clear();
            this.loadAutores();
            Swal.fire('¡Eliminados!', `${count} autor(es) eliminado(s) correctamente.`, 'success');
          },
          error: (err) => {
            console.error('Error deleting autores:', err);
            this.selectedAutorIds.clear();
            this.loadAutores();
            Swal.fire('Error', 'Ocurrió un problema al eliminar algunos autores.', 'error');
          }
        });
      }
    });
  }

}