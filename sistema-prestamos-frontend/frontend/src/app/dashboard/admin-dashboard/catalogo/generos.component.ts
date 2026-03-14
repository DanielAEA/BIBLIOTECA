import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
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

}