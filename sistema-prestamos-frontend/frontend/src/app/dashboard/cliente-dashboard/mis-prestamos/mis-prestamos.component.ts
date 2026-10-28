import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService, Prestamo } from '../../../services/loan.service';
import { AuthService } from '../../../services/auth.service';
import { StatsService } from '../../../services/stats.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-mis-prestamos',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './mis-prestamos.component.html',
    styleUrls: ['./mis-prestamos.component.scss']
})
export class MisPrestamosComponent implements OnInit {
    Math = Math;
    prestamos: Prestamo[] = [];
    loading = false;
    error: string | null = null;
    totalMulta = 0;

    page: number = 0;
    size: number = 10;
    totalElements: number = 0;

    constructor(
        private loanService: LoanService,
        private authService: AuthService,
        private statsService: StatsService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.page = params['page'] !== undefined ? Math.max(0, parseInt(params['page'], 10) || 0) : 0;
            this.size = params['size'] !== undefined ? Math.max(1, parseInt(params['size'], 10) || 10) : 10;
            this.loadMyLoans();
        });
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
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: this.page, size: this.size },
            queryParamsHandling: 'merge'
        });
    }

    loadMyLoans() {
        const payload = this.authService.getPayload();
        if (!payload || (!payload.sub && !payload.id)) {
            this.error = 'No se pudo obtener la información del usuario.';
            this.loading = false;
            return;
        }
        const userId = payload.id || payload.sub;
        this.loading = true;
        this.error = null;

        this.loanService.getByUserIdPaginated(userId, this.page, this.size).subscribe({
            next: (response) => {
                this.prestamos = response.content || [];
                this.page = response.page;
                this.size = response.size;
                this.totalElements = response.totalElements;
                this.totalMulta = this.prestamos.reduce((sum, p) => sum + this.getFine(p), 0);
                this.loading = false;
            },
            error: () => {
                this.loanService.getByUserId(userId).subscribe({
                    next: (all) => {
                        this.prestamos = all;
                        this.totalElements = all.length;
                        this.totalMulta = this.prestamos.reduce((sum, p) => sum + this.getFine(p), 0);
                        this.loading = false;
                    },
                    error: () => {
                        this.error = 'No se pudieron cargar tus préstamos.';
                        this.loading = false;
                    }
                });
            }
        });
    }

    calculateDaysRemaining(fechaDevolucion: string): number {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dev = new Date(fechaDevolucion); dev.setHours(0, 0, 0, 0);
        return Math.ceil((dev.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    getDaysRemaining(p: Prestamo): number {
        return p.devuelto ? 0 : this.calculateDaysRemaining(p.fechaDevolucion);
    }

    getFine(p: Prestamo): number {
        if (p.multa) {
            return p.multa.pagada ? 0 : p.multa.total;
        }
        if (!p.devuelto) {
            const dias = this.calculateDaysRemaining(p.fechaDevolucion);
            return dias < 0 ? Math.abs(dias) * 2000 : 0; 
        }
        return 0;
    }

    hasOverdue(p: Prestamo): boolean {
        return !p.devuelto && this.calculateDaysRemaining(p.fechaDevolucion) < 0;
    }

    getLibroTitulo(p: Prestamo): string {
        return p.libro?.titulo || 'Libro sin título';
    }

    getEjemplarCodigo(p: Prestamo): string {
        return p.ejemplarCodigo || '-';
    }

    getActiveLoans(): Prestamo[] {
        return this.prestamos.filter(p => !p.devuelto);
    }

    getReturnedLoans(): Prestamo[] {
        return this.prestamos.filter(p => p.devuelto);
    }

    leerOnline(p: Prestamo) {
        if (!p.libro?.id) {
            Swal.fire('Error', 'No se encontró la información del libro', 'error');
            return;
        }

        const payload = this.authService.getPayload();
        const userId = payload?.id || payload?.sub;

        if (userId) {
            this.statsService.registrarLecturaDigital(userId, p.libro.id).subscribe({
                error: (err: any) => console.error('Error al registrar métrica de lectura online:', err)
            });
        }

        if (p.libro?.archivoDigital) {
            window.open(p.libro.archivoDigital, '_blank');
        } else {
            Swal.fire('No disponible', 'Este libro no cuenta con versión digital disponible.', 'info');
        }
    }
}
