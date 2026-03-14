import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaService, Sala } from '../../../services/sala.service';
import { ReservaSalaService, ReservaSala } from '../../../services/reserva-sala.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-reservar-salas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reservar-salas.component.html',
    styleUrls: ['./reservar-salas.component.scss']
})
export class ReservarSalasComponent implements OnInit {
    salas: Sala[] = [];
    misReservas: ReservaSala[] = [];
    loading = false;

    // Form
    showForm = false;
    selectedSalaId: number | null = null;
    reservaFecha = '';
    reservaHoraInicio = '';
    reservaHoraFin = '';
    reservaMotivo = '';
    submitting = false;

    horasDisponibles: string[] = [];
    horasFinDisponibles: string[] = [];
    reservasActivas: ReservaSala[] = [];

    constructor(
        private salaService: SalaService,
        private reservaSalaService: ReservaSalaService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadSalas();
        this.loadMisReservas();
        this.generarHorarios();
    }

    loadSalas() {
        this.loading = true;
        this.salaService.getActivas().subscribe({
            next: (salas) => { this.salas = salas; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    loadMisReservas() {
        const payload = this.authService.getPayload();
        if (!payload) return;
        const userId = payload.id || payload.sub;
        this.reservaSalaService.getByUsuario(userId).subscribe({
            next: (r) => this.misReservas = r,
            error: (err: any) => console.error('Error cargando reservas:', err)
        });
    }

    openReservaForm(sala: Sala) {
        this.selectedSalaId = sala.id;
        this.reservaFecha = '';
        this.reservaHoraInicio = '';
        this.reservaHoraFin = '';
        this.reservaMotivo = '';
        this.reservasActivas = [];
        this.generarHorarios();
        this.showForm = true;
    }

    cancelForm() {
        this.showForm = false;
        this.selectedSalaId = null;
        this.reservasActivas = [];
    }

    onFechaChange() {
        this.reservasActivas = [];
        this.reservaHoraInicio = '';
        this.reservaHoraFin = '';
        this.horasFinDisponibles = [];
        this.generarHorarios(); // Reset a todos disponibles inicialmente
        
        if (!this.selectedSalaId || !this.reservaFecha) return;
        
        this.loading = true;
        this.reservaSalaService.getBySalaYFecha(this.selectedSalaId, this.reservaFecha).subscribe({
            next: (reservas) => {
                this.reservasActivas = reservas.filter(r => r.estado !== 'CANCELADA');
                this.filtrarHorariosOcupados();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando reservas de la fecha', err);
                this.loading = false;
            }
        });
    }

    filtrarHorariosOcupados() {
        // Remove times from horasDisponibles if they fall strictly within an active reservation block
        // Un horario "H" es invalido si existe una reserva R donde R.horaInicio <= H < R.horaFin
        this.horasDisponibles = this.horasDisponibles.filter(hora => {
            for (const r of this.reservasActivas) {
                const exInicio = r.horaInicio.substring(0, 5);
                const exFin = r.horaFin.substring(0, 5);
                if (hora >= exInicio && hora < exFin) {
                    return false; // Está ocupado
                }
            }
            return true;
        });
    }

    generarHorarios() {
        this.horasDisponibles = [];
        // Generar horas de 08:00 a 18:30 para inicio (la última reserva inicia 18:30 y termina 19:00)
        for (let h = 8; h <= 18; h++) {
            const hora = h < 10 ? `0${h}` : `${h}`;
            this.horasDisponibles.push(`${hora}:00`);
            this.horasDisponibles.push(`${hora}:30`);
        }
    }

    onHoraInicioChange() {
        this.horasFinDisponibles = [];
        this.reservaHoraFin = '';
        if (!this.reservaHoraInicio) return;
        
        let [hStr, mStr] = this.reservaHoraInicio.split(':');
        let h = parseInt(hStr, 10);
        let m = parseInt(mStr, 10);
        
        // Empezar a agregar desde los siguientes 30 min
        m += 30;
        if (m === 60) {
            h++;
            m = 0;
        }

        let maxOpciones = 2; // Máximo 1 hora (2 incrementos de 30 minutos)
        let opcionesAgregadas = 0;

        while ((h < 19 || (h === 19 && m === 0)) && opcionesAgregadas < maxOpciones) {
            const hora = h < 10 ? `0${h}` : `${h}`;
            const minuto = m === 0 ? '00' : '30';
            const horaCandidata = `${hora}:${minuto}`;

            // Check if this end time crosses into a new reservation block
            // An end time E is invalid if there is an active reservation R where R.horaInicio > horaInicio AND R.horaInicio < E
            let cruzaReserva = false;
            for (const r of this.reservasActivas) {
                const exInicio = r.horaInicio.substring(0, 5);
                if (exInicio > this.reservaHoraInicio && exInicio < horaCandidata) {
                    cruzaReserva = true;
                    break;
                }
            }

            if (cruzaReserva) {
                break; // Stop offering longer durations if it hits the next reservation
            }

            this.horasFinDisponibles.push(horaCandidata);
            m += 30;
            if (m === 60) {
                h++;
                m = 0;
            }
            opcionesAgregadas++;
        }
    }

    getSalaName(id: number): string {
        return this.salas.find(s => s.id === id)?.nombre || 'Sala';
    }

    submitReserva() {
        if (!this.selectedSalaId || !this.reservaFecha || !this.reservaHoraInicio || !this.reservaHoraFin) {
            Swal.fire('Atencion', 'Completa todos los campos obligatorios.', 'warning');
            return;
        }

        if (this.reservaHoraInicio < '08:00' || this.reservaHoraFin > '19:00') {
            Swal.fire('Atencion', 'Las reservas solo están permitidas entre las 08:00 y las 19:00.', 'warning');
            return;
        }

        if (this.reservaHoraInicio >= this.reservaHoraFin) {
            Swal.fire('Atencion', 'La hora de fin debe ser posterior a la hora de inicio.', 'warning');
            return;
        }

        // Validate conflicts with active reservations
        for (const existente of this.reservasActivas) {
            // Un solapamiento ocurre si: Inicio nuevo < Fin existente Y Fin nuevo > Inicio existente
            // Formato 'HH:mm' se puede comparar como string al azar length: '08:00' < '09:00'
            const exInicio = existente.horaInicio.substring(0, 5); // Tomamos HH:mm por si trae segundos
            const exFin = existente.horaFin.substring(0, 5);

            if (this.reservaHoraInicio < exFin && this.reservaHoraFin > exInicio) {
                Swal.fire({
                    title: 'Horario no disponible',
                    text: `La sala ya está ocupada desde las ${exInicio} hasta las ${exFin}. Por favor, selecciona otro horario.`,
                    icon: 'error'
                });
                return;
            }
        }

        const payload = this.authService.getPayload();
        if (!payload) return;

        this.submitting = true;
        this.reservaSalaService.create({
            sala: { id: this.selectedSalaId },
            usuario: { id: payload.id || payload.sub },
            fechaReserva: this.reservaFecha,
            horaInicio: this.reservaHoraInicio,
            horaFin: this.reservaHoraFin,
            motivo: this.reservaMotivo
        }).subscribe({
            next: () => {
                this.submitting = false;
                this.cancelForm();
                this.loadMisReservas();
                Swal.fire({ title: 'Reservada!', text: 'Tu sala ha sido reservada.', icon: 'success', timer: 2000, showConfirmButton: false });
            },
            error: (err: any) => {
                this.submitting = false;
                Swal.fire('Error', err.error?.error || 'No se pudo reservar la sala', 'error');
            }
        });
    }

    cancelarReserva(reserva: ReservaSala) {
        Swal.fire({
            title: 'Cancelar reserva?',
            text: 'Esta accion no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Si, cancelar',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                this.reservaSalaService.cambiarEstado(reserva.id, 'CANCELADA').subscribe({
                    next: () => {
                        this.loadMisReservas();
                        Swal.fire('Cancelada', 'Tu reserva ha sido cancelada.', 'success');
                    },
                    error: () => Swal.fire('Error', 'No se pudo cancelar la reserva', 'error')
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

    getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }
}
