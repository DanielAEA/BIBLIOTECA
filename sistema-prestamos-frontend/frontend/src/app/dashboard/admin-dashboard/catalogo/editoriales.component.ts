import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs';
import { EditorialService, Editorial } from '../../../services/editorial.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editoriales',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './editoriales.component.html',
  styleUrls: ['./editoriales.component.scss']
})
export class EditorialesComponent implements OnInit, OnDestroy {
  editoriales: Editorial[] = [];
  selectedEditorialIds = new Set<string>();
  editingEditorial: Editorial | null = null;
  showForm = false;
  editorialNombre = '';
  loading = false;
  submitting = false;

  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  searchTerm: string = '';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private editorialService: EditorialService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] !== undefined ? Math.max(0, parseInt(params['page'], 10) || 0) : 0;
      this.size = params['size'] !== undefined ? Math.max(1, parseInt(params['size'], 10) || 10) : 10;
      this.searchTerm = params['search'] || '';
      this.loadEditoriales();
    });

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.page = 0;
      this.searchTerm = term;
      this.updateQueryParams();
    });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  onSearchInput(value: string) {
    this.searchSubject.next(value);
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.updateQueryParams();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.updateQueryParams();
  }

  private updateQueryParams() {
    const queryParams: any = {
      page: this.page,
      size: this.size
    };
    if (this.searchTerm.trim()) {
      queryParams.search = this.searchTerm.trim();
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: ''
    });
  }

  loadEditoriales() {
    this.loading = true;
    this.editorialService.getPaginated(this.page, this.size, this.searchTerm).subscribe({
      next: (response) => {
        this.editoriales = response.content || [];
        this.page = response.page;
        this.size = response.size;
        this.totalElements = response.totalElements;
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
