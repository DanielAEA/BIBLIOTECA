import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs';
import { GeneroService, Genero } from '../../../services/genero.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './generos.component.html',
  styleUrls: ['./generos.component.scss']
})
export class GenerosComponent implements OnInit, OnDestroy {

  generos: Genero[] = [];
  selectedGeneroIds = new Set<string>();
  editingGenero: Genero | null = null;
  showForm = false;
  generoNombre = '';
  loading = false;
  submitting = false;

  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  searchTerm: string = '';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private generoService: GeneroService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.page = params['page'] !== undefined ? Math.max(0, parseInt(params['page'], 10) || 0) : 0;
      this.size = params['size'] !== undefined ? Math.max(1, parseInt(params['size'], 10) || 10) : 10;
      this.searchTerm = params['search'] || '';
      this.loadGeneros();
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

  loadGeneros() {
    this.loading = true;
    this.generoService.getPaginated(this.page, this.size, this.searchTerm).subscribe({
      next: (response) => {
        this.generos = response.content || [];
        this.page = response.page;
        this.size = response.size;
        this.totalElements = response.totalElements;
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