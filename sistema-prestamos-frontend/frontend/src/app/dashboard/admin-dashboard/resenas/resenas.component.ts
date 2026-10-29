import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { ResenaService, Resena } from '../../../services/resena.service';
import { BookService, Libro } from '../../../services/book.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-resenas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './resenas.component.html',
    styleUrls: ['./resenas.component.scss']
})
export class ResenasComponent implements OnInit {
    resenas: Resena[] = [];
    selectedResenaIds = new Set<string>();
    libros: Libro[] = [];
    loading = false;

    
    selectedLibroFilter: string | null = null;

    constructor(
        private resenaService: ResenaService,
        private bookService: BookService
    ) { }

    ngOnInit() {
        this.loadResenas();
        this.loadLibros();
    }

    loadResenas() {
        this.loading = true;
        const obs = this.selectedLibroFilter
            ? this.resenaService.getByLibro(this.selectedLibroFilter)
            : this.resenaService.getAll();

        obs.subscribe({
            next: (resenas) => {
                this.resenas = resenas;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar reseñas:', err);
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

    filterByLibro() {
        this.loadResenas();
    }

    clearFilter() {
        this.selectedLibroFilter = null;
        this.loadResenas();
    }

    getStars(rating: number): string {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    deleteResena(resena: Resena) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Deseas eliminar esta reseña`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.resenaService.delete(resena.id).subscribe({
                    next: () => {
                        this.selectedResenaIds.delete(resena.id);
                        this.loadResenas();
                        Swal.fire('¡Eliminada!', 'La reseña ha sido eliminada.', 'success');
                    },
                    error: (err) => {
                        console.error('Error al eliminar reseña:', err);
                        Swal.fire('Error', 'No se pudo eliminar la reseña', 'error');
                    }
                });
            }
        });
    }

    toggleSelection(id: string) {
        if (this.selectedResenaIds.has(id)) {
            this.selectedResenaIds.delete(id);
        } else {
            this.selectedResenaIds.add(id);
        }
    }

    toggleAll(event: any) {
        if (event.target.checked) {
            this.resenas.forEach(r => this.selectedResenaIds.add(r.id));
        } else {
            this.selectedResenaIds.clear();
        }
    }

    isAllSelected(): boolean {
        return this.resenas.length > 0 && this.resenas.every(r => this.selectedResenaIds.has(r.id));
    }

    deleteSelectedResenas() {
        const count = this.selectedResenaIds.size;
        if (count === 0) return;

        Swal.fire({
            title: '¿Eliminar seleccionadas?',
            text: `Se eliminarán ${count} reseña(s) seleccionada(s).`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.loading = true;
                const requests = Array.from(this.selectedResenaIds).map(id => this.resenaService.delete(id));
                forkJoin(requests).pipe(finalize(() => this.loading = false)).subscribe({
                    next: () => {
                        this.selectedResenaIds.clear();
                        this.loadResenas();
                        Swal.fire('¡Eliminadas!', `${count} reseña(s) eliminada(s) correctamente.`, 'success');
                    },
                    error: (err) => {
                        console.error('Error deleting resenas:', err);
                        this.selectedResenaIds.clear();
                        this.loadResenas();
                        Swal.fire('Error', 'Ocurrió un problema al eliminar algunas reseñas.', 'error');
                    }
                });
            }
        });
    }
}
