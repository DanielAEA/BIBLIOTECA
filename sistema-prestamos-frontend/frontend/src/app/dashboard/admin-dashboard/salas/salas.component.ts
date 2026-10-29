import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs';
import { SalaService, Sala, SalaPayload } from '../../../services/sala.service';
import { ReservaSalaService, ReservaSala } from '../../../services/reserva-sala.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-salas',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './salas.component.html',
    styleUrls: ['./salas.component.scss']
})
export class SalasComponent implements OnInit, OnDestroy {
    salas: Sala[] = [];
    selectedSalaIds = new Set<string>();
    reservas: ReservaSala[] = [];
    loading = false;
    showForm = false;
    showReservas = false;
    editingSala: Sala | null = null;
    submitting = false;

    salaNombre = '';
    salaDescripcion = '';
    salaCapacidad: number | null = null;
    salaUbicacion = '';
    salaActiva = true;

    selectedSala: Sala | null = null;

    page: number = 0;
    size: number = 10;
    totalElements: number = 0;
    searchTerm: string = '';
    activaFilter: string = ''; // '' | 'true' | 'false'

    private searchSubject = new Subject<string>();
    private searchSub?: Subscription;

    constructor(
        private salaService: SalaService,
        private reservaSalaService: ReservaSalaService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.page = params['page'] !== undefined ? Math.max(0, parseInt(params['page'], 10) || 0) : 0;
            this.size = params['size'] !== undefined ? Math.max(1, parseInt(params['size'], 10) || 10) : 10;
            this.searchTerm = params['search'] || '';
            this.activaFilter = params['activa'] !== undefined ? params['activa'] : '';
            this.loadSalas();
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

    onFilterChange() {
        this.page = 0;
        this.updateQueryParams();
    }

    clearFilters() {
        this.searchTerm = '';
        this.activaFilter = '';
        this.page = 0;
        this.updateQueryParams();
    }

    hasActiveFilters(): boolean {
        return !!(this.searchTerm || this.activaFilter);
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
        if (this.activaFilter !== '') {
            queryParams.activa = this.activaFilter;
        }
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: ''
        });
    }

    loadSalas() {
        this.loading = true;
        let activa: boolean | undefined = undefined;
        if (this.activaFilter === 'true') activa = true;
        else if (this.activaFilter === 'false') activa = false;

        this.salaService.getPaginated(this.page, this.size, this.searchTerm, activa).subscribe({
            next: (response) => {
                this.salas = response.content || [];
                this.page = response.page;
                this.size = response.size;
                this.totalElements = response.totalElements;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar salas:', err);
                this.loading = false;
            }
        });
    }

    createSala() {
        this.editingSala = null;
        this.salaNombre = '';
        this.salaDescripcion = '';
        this.salaCapacidad = null;
        this.salaUbicacion = '';
        this.salaActiva = true;
        this.showForm = true;
        this.showReservas = false;
    }

    editSala(sala: Sala) {
        this.editingSala = { ...sala };
        this.salaNombre = sala.nombre;
        this.salaDescripcion = sala.descripcion;
        this.salaCapacidad = sala.capacidad;
        this.salaUbicacion = sala.ubicacion;
        this.salaActiva = sala.activa;
        this.showForm = true;
        this.showReservas = false;
    }

    cancelForm() {
        this.showForm = false;
        this.editingSala = null;
    }

    saveSala() {
        if (!this.salaNombre.trim()) {
            Swal.fire('Atención', 'Ingresa el nombre de la sala.', 'warning');
            return;
        }
        if (!this.salaCapacidad || this.salaCapacidad <= 0) {
            Swal.fire('Atención', 'Ingresa una capacidad válida.', 'warning');
            return;
        }
        if (!this.salaUbicacion.trim()) {
            Swal.fire('Atención', 'Ingresa la ubicación de la sala.', 'warning');
            return;
        }

        this.submitting = true;
        const payload: SalaPayload = {
            nombre: this.salaNombre.trim(),
            descripcion: this.salaDescripcion.trim(),
            capacidad: this.salaCapacidad,
            ubicacion: this.salaUbicacion.trim(),
            activa: this.salaActiva
        };

        const obs = this.editingSala
            ? this.salaService.update(this.editingSala.id, payload)
            : this.salaService.create(payload);

        obs.pipe(finalize(() => (this.submitting = false))).subscribe({
            next: () => {
                this.loadSalas();
                this.cancelForm();
                Swal.fire({
                    title: this.editingSala ? '¡Actualizada!' : '¡Creada!',
                    text: `Sala ${this.editingSala ? 'actualizada' : 'creada'} correctamente`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: (err) => {
                console.error('Error al guardar sala:', err);
                Swal.fire('Error', 'No se pudo guardar la sala', 'error');
            }
        });
    }

    deleteSala(sala: Sala) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Deseas eliminar la sala "${sala.nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.salaService.delete(sala.id).subscribe({
                    next: () => {
                        this.selectedSalaIds.delete(sala.id);
                        this.loadSalas();
                        Swal.fire('¡Eliminada!', 'La sala ha sido eliminada.', 'success');
                    },
                    error: (err) => {
                        console.error('Error al eliminar sala:', err);
                        Swal.fire('Error', 'No se pudo eliminar la sala', 'error');
                    }
                });
            }
        });
    }

    toggleSelection(id: string) {
        if (this.selectedSalaIds.has(id)) {
            this.selectedSalaIds.delete(id);
        } else {
            this.selectedSalaIds.add(id);
        }
    }

    toggleAll(event: any) {
        if (event.target.checked) {
            this.salas.forEach(s => this.selectedSalaIds.add(s.id));
        } else {
            this.selectedSalaIds.clear();
        }
    }

    isAllSelected(): boolean {
        return this.salas.length > 0 && this.salas.every(s => this.selectedSalaIds.has(s.id));
    }

    deleteSelectedSalas() {
        const count = this.selectedSalaIds.size;
        if (count === 0) return;

        Swal.fire({
            title: '¿Eliminar seleccionados?',
            text: `Se eliminarán ${count} sala(s) seleccionada(s).`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.loading = true;
                const requests = Array.from(this.selectedSalaIds).map(id => this.salaService.delete(id));
                forkJoin(requests).pipe(finalize(() => this.loading = false)).subscribe({
                    next: () => {
                        this.selectedSalaIds.clear();
                        this.loadSalas();
                        Swal.fire('¡Eliminadas!', `${count} sala(s) eliminada(s) correctamente.`, 'success');
                    },
                    error: (err) => {
                        console.error('Error deleting salas:', err);
                        this.selectedSalaIds.clear();
                        this.loadSalas();
                        Swal.fire('Error', 'Ocurrió un problema al eliminar algunas salas.', 'error');
                    }
                });
            }
        });
    }

    viewReservas(sala: Sala) {
        this.selectedSala = sala;
        this.showReservas = true;
        this.showForm = false;
        this.reservaSalaService.getBySala(sala.id).subscribe({
            next: (reservas) => (this.reservas = reservas),
            error: (err) => console.error('Error al cargar reservas:', err)
        });
    }

    closeReservas() {
        this.showReservas = false;
        this.selectedSala = null;
        this.reservas = [];
    }

    cancelarReserva(reserva: ReservaSala) {
        Swal.fire({
            title: '¿Cancelar reserva?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                this.reservaSalaService.cambiarEstado(reserva.id, 'CANCELADA').subscribe({
                    next: () => {
                        if (this.selectedSala) this.viewReservas(this.selectedSala);
                        Swal.fire('Cancelada', 'La reserva ha sido cancelada.', 'success');
                    },
                    error: (err) => Swal.fire('Error', 'No se pudo cancelar la reserva', 'error')
                });
            }
        });
    }

    getEstadoBadgeClass(estado: string): string {
        switch (estado) {
            case 'CONFIRMADA': return 'status-available';
            case 'CANCELADA': return 'status-borrowed';
            case 'COMPLETADA': return 'status-available';
            default: return 'status-borrowed';
        }
    }
}
