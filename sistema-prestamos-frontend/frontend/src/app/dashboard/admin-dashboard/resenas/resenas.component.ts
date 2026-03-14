import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    libros: Libro[] = [];
    loading = false;

    // Filtro
    selectedLibroFilter: number | null = null;

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
}
