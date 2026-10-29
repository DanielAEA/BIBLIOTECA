import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { EditorialService, Editorial } from '../../../services/editorial.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editoriales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editoriales.component.html',
  styleUrls: ['./editoriales.component.scss']
})
export class EditorialesComponent implements OnInit {
  editoriales: Editorial[] = [];
  selectedEditorialIds = new Set<string>();
  editingEditorial: Editorial | null = null;
  showForm = false;
  editorialNombre = '';
  loading = false;
  submitting = false;

  constructor(private editorialService: EditorialService) { }

  ngOnInit() {
    this.loadEditoriales();
  }

  loadEditoriales() {
    this.loading = true;
    this.editorialService.getAll().subscribe({
      next: (editoriales) => {
        this.editoriales = editoriales;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar editoriales:', err);
        this.loading = false;
      }
    });
  }

  createEditorial() {
    this.editingEditorial = null;
    this.editorialNombre = '';
    this.showForm = true;
  }

  editEditorial(editorial: Editorial) {
    this.editingEditorial = editorial;
    this.editorialNombre = editorial.nombre;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingEditorial = null;
    this.editorialNombre = '';
  }

  saveEditorial() {
    if (!this.editorialNombre.trim()) {
      Swal.fire({
        title: 'Atención',
        text: 'Ingresa el nombre de la editorial.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.submitting = true;
    if (this.editingEditorial) {
      this.editorialService
        .update(this.editingEditorial.id, this.editorialNombre.trim())
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadEditoriales();
            this.cancelForm();
            Swal.fire({
              title: '¡Actualizado!',
              text: 'Editorial actualizada correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al actualizar editorial:', err);
            Swal.fire('Error', 'No se pudo actualizar la editorial', 'error');
          }
        });
    } else {
      this.editorialService
        .create(this.editorialNombre.trim())
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.loadEditoriales();
            this.cancelForm();
            Swal.fire({
              title: '¡Creado!',
              text: 'Editorial creada correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al crear editorial:', err);
            Swal.fire('Error', 'No se pudo crear la editorial', 'error');
          }
        });
    }
  }

  deleteEditorial(editorial: Editorial) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar la editorial "${editorial.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.editorialService.delete(editorial.id).subscribe({
          next: () => {
            this.selectedEditorialIds.delete(editorial.id);
            this.loadEditoriales();
            Swal.fire({
              title: '¡Eliminado!',
              text: 'La editorial ha sido eliminada.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error al eliminar editorial:', err);
            Swal.fire('Error', 'No se pudo eliminar la editorial', 'error');
          }
        });
      }
    });
  }

  toggleSelection(id: string) {
    if (this.selectedEditorialIds.has(id)) {
      this.selectedEditorialIds.delete(id);
    } else {
      this.selectedEditorialIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.editoriales.forEach(e => this.selectedEditorialIds.add(e.id));
    } else {
      this.selectedEditorialIds.clear();
    }
  }

  isAllSelected(): boolean {
    return this.editoriales.length > 0 && this.editoriales.every(e => this.selectedEditorialIds.has(e.id));
  }

  deleteSelectedEditoriales() {
    const count = this.selectedEditorialIds.size;
    if (count === 0) return;

    Swal.fire({
      title: '¿Eliminar seleccionadas?',
      text: `Se eliminarán ${count} editorial(es) seleccionada(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const requests = Array.from(this.selectedEditorialIds).map(id => this.editorialService.delete(id));
        forkJoin(requests).pipe(finalize(() => this.loading = false)).subscribe({
          next: () => {
            this.selectedEditorialIds.clear();
            this.loadEditoriales();
            Swal.fire('¡Eliminadas!', `${count} editorial(es) eliminada(s) correctamente.`, 'success');
          },
          error: (err) => {
            console.error('Error deleting editoriales:', err);
            this.selectedEditorialIds.clear();
            this.loadEditoriales();
            Swal.fire('Error', 'Ocurrió un problema al eliminar algunas editoriales.', 'error');
          }
        });
      }
    });
  }
}
