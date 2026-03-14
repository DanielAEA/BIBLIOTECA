import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SalaService, Sala, SalaPayload } from '../../../services/sala.service';
import { ReservaSalaService, ReservaSala } from '../../../services/reserva-sala.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-salas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './salas.component.html',
    styleUrls: ['./salas.component.scss']
})
export class SalasComponent implements OnInit {
    salas: Sala[] = [];
    reservas: ReservaSala[] = [];
    loading = false;
    showForm = false;
    showReservas = false;
    editingSala: Sala | null = null;
    submitting = false;

    // Formulario sala
    salaNombre = '';
    salaDescripcion = '';
    salaCapacidad: number | null = null;
    salaUbicacion = '';
    salaActiva = true;

    // Ver reservas de una sala
    selectedSala: Sala | null = null;

    constructor(
        private salaService: SalaService,
        private reservaSalaService: ReservaSalaService
    ) { }

    ngOnInit() {
        this.loadSalas();
    }

    loadSalas() {
        this.loading = true;
        this.salaService.getAll().subscribe({
            next: (salas) => {
                this.salas = salas;
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
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.salaService.delete(sala.id).subscribe({
                    next: () => {
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
            case 'CONFIRMADA': return 'badge-success';
            case 'CANCELADA': return 'badge-danger';
            case 'COMPLETADA': return 'badge-info';
            default: return 'badge-warning';
        }
    }
}
