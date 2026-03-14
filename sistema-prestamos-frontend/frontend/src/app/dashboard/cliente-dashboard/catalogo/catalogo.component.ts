import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Libro } from '../../../services/book.service';
import { LoanService } from '../../../services/loan.service';
import { ResenaService, Resena } from '../../../services/resena.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-catalogo-cliente',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './catalogo.component.html',
    styleUrls: ['./catalogo.component.scss']
})
export class CatalogoClienteComponent implements OnInit {
    Math = Math;
    libros: any[] = [];
    filteredLibros: any[] = [];
    loading = false;
    searchTerm = '';

    // Resena inline
    showResenaForm = false;
    resenaLibroId: number | null = null;
    resenaLibroTitulo = '';
    resenaCalificacion = 5;
    resenaComentario = '';
    resenasLibro: Resena[] = [];
    promedioLibro: number = 0;
    submittingResena = false;

    constructor(
        private bookService: BookService,
        private loanService: LoanService,
        private resenaService: ResenaService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadLibros();
    }

    loadLibros() {
        this.loading = true;
        this.bookService.getAllBooks().subscribe({
            next: (libros) => {
                this.libros = libros;
                this.filteredLibros = libros;
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    filterLibros() {
        const term = this.searchTerm.toLowerCase();
        this.filteredLibros = this.libros.filter((l: any) =>
            l.titulo?.toLowerCase().includes(term) ||
            l.autores?.some((a: any) => a.nombre?.toLowerCase().includes(term)) ||
            l.genero?.nombre?.toLowerCase().includes(term)
        );
    }

    getEjemplaresDisponibles(libro: any): number {
        return libro.ejemplares?.filter((e: any) => e.disponible && (!e.estado || e.estado === 'DISPONIBLE')).length || 0;
    }

    getAutoresStr(libro: any): string {
        return libro.autores?.map((a: any) => a.nombre).join(', ') || 'Sin autor';
    }

    reservarLibro(libro: any) {
        const disponibles = libro.ejemplares?.filter((e: any) => e.disponible && (!e.estado || e.estado === 'DISPONIBLE')) || [];
        if (disponibles.length === 0) {
            Swal.fire('No disponible', 'No hay ejemplares disponibles de este libro.', 'info');
            return;
        }

        const userPayload = this.authService.getPayload();
        if (!userPayload) {
            Swal.fire('Error', 'No se pudo obtener tu informacion. Inicia sesion nuevamente.', 'error');
            return;
        }

        Swal.fire({
            title: 'Reservar este libro?',
            html: `<strong>${libro.titulo}</strong><br>Ejemplar: ${disponibles[0].codigo}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si, reservar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const today = new Date();
                const devolucion = new Date(today);
                devolucion.setDate(devolucion.getDate() + 15);

                const body = {
                    usuario: { id: userPayload.id || userPayload.sub },
                    ejemplar: { id: disponibles[0].id },
                    fechaPrestamo: today.toISOString().split('T')[0],
                    fechaDevolucion: devolucion.toISOString().split('T')[0],
                    devuelto: false
                };

                this.loanService.create(body).subscribe({
                    next: () => {
                        this.loadLibros();
                        Swal.fire({ title: 'Reservado!', text: `"${libro.titulo}" ha sido reservado por 15 dias.`, icon: 'success', timer: 3000, showConfirmButton: false });
                    },
                    error: (err: any) => {
                        Swal.fire('Error', err.error?.error || 'No se pudo reservar el libro', 'error');
                    }
                });
            }
        });
    }

    leerOnline(libro: any) {
        if (libro.archivoDigital) {
            window.open('http://localhost:8080' + libro.archivoDigital, '_blank');
        } else {
            Swal.fire('Error', 'El archivo de este libro no se encuentra disponible.', 'error');
        }
    }

    // --- RESENAS ---
    openResenaForm(libro: any) {
        this.resenaLibroId = libro.id;
        this.resenaLibroTitulo = libro.titulo;
        this.resenaCalificacion = 5;
        this.resenaComentario = '';
        this.showResenaForm = true;

        this.resenaService.getByLibro(libro.id).subscribe({
            next: (r) => this.resenasLibro = r
        });
        this.resenaService.getPromedio(libro.id).subscribe({
            next: (p) => this.promedioLibro = p.promedio
        });
    }

    closeResenaForm() {
        this.showResenaForm = false;
        this.resenaLibroId = null;
        this.resenasLibro = [];
    }

    setCalificacion(stars: number) {
        this.resenaCalificacion = stars;
    }

    submitResena() {
        const userPayload = this.authService.getPayload();
        if (!userPayload || !this.resenaLibroId) return;

        this.submittingResena = true;
        this.resenaService.create({
            libro: { id: this.resenaLibroId },
            usuario: { id: userPayload.id || userPayload.sub },
            calificacion: this.resenaCalificacion,
            comentario: this.resenaComentario
        }).subscribe({
            next: () => {
                this.submittingResena = false;
                Swal.fire({ title: 'Gracias!', text: 'Tu resena ha sido publicada.', icon: 'success', timer: 2000, showConfirmButton: false });
                this.openResenaForm({ id: this.resenaLibroId!, titulo: this.resenaLibroTitulo });
            },
            error: (err: any) => {
                this.submittingResena = false;
                Swal.fire('Error', err.error?.error || 'No se pudo enviar la resena', 'error');
            }
        });
    }

    getStars(n: number): number[] { return Array(n).fill(0); }
    getEmptyStars(n: number): number[] { return Array(5 - n).fill(0); }
}
