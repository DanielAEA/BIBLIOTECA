import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService, Prestamo } from '../../../services/loan.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-mis-prestamos',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mis-prestamos.component.html',
    styleUrls: ['./mis-prestamos.component.scss']
})
export class MisPrestamosComponent implements OnInit {
    Math = Math;
    prestamos: Prestamo[] = [];
    loading = false;
    error: string | null = null;
    totalMulta = 0;

    constructor(
        private loanService: LoanService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loanService.loadAll();
        this.loadMyLoans();
        this.loanService.loans$.subscribe(() => this.loadMyLoans());
    }

    loadMyLoans() {
        const payload = this.authService.getPayload();
        if (!payload || (!payload.sub && !payload.id)) {
            this.error = 'No se pudo obtener la información del usuario.';
            this.loading = false;
            return;
        }
        const userId = payload.id || payload.sub;
        const userIdNumber = Number(userId);
        this.loading = true;
        this.error = null;

        if (userIdNumber && !isNaN(userIdNumber)) {
            this.loanService.getByUserId(userIdNumber).subscribe({
                next: (prestamos) => this.processPrestamos(prestamos),
                error: () => this.loadAllAndFilter(userId, userIdNumber)
            });
        } else {
            this.loadAllAndFilter(userId, userIdNumber);
        }
    }

    private loadAllAndFilter(userId: string | number, userIdNumber: number) {
        this.loanService.getAll().subscribe({
            next: (allPrestamos) => {
                this.processPrestamos(allPrestamos.filter(p => {
                    const pid = p.usuario?.id;
                    return pid === userId || pid === userIdNumber || String(pid) === String(userId);
                }));
            },
            error: (err) => {
                this.error = 'No se pudieron cargar tus préstamos.';
                this.loading = false;
            }
        });
    }

    private processPrestamos(prestamos: Prestamo[]) {
        this.prestamos = prestamos;
        this.totalMulta = this.prestamos
            .filter(p => !p.devuelto)
            .reduce((sum, p) => sum + this.getFine(p), 0);
        this.loading = false;
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
        if (p.devuelto) return 0;
        const dias = this.calculateDaysRemaining(p.fechaDevolucion);
        return dias < 0 ? Math.abs(dias) * 1000 : 0;
    }

    hasOverdue(p: Prestamo): boolean {
        return !p.devuelto && this.calculateDaysRemaining(p.fechaDevolucion) < 0;
    }

    getActiveLoans(): Prestamo[] { return this.prestamos.filter(p => !p.devuelto); }
    getReturnedLoans(): Prestamo[] { return this.prestamos.filter(p => p.devuelto); }

    getLibroTitulo(p: Prestamo): string {
        return p?.ejemplar?.libro?.titulo || 'Libro no disponible';
    }

    getEjemplarCodigo(p: Prestamo): string {
        return p?.ejemplar?.codigo || 'N/A';
    }

    leerOnline(p: Prestamo) {
        const libro = p?.ejemplar?.libro;
        if (libro && libro.archivoDigital) {
            window.open('http://localhost:8080' + libro.archivoDigital, '_blank');
        } else {
            Swal.fire('Error', 'La versión digitalizada de este libro no está disponible.', 'error');
        }
    }
}
