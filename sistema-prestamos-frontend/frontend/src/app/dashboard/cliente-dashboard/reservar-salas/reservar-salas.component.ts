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
    loadingHorarios = false;

    showForm = false;
    selectedSalaId: string | null = null;
    reservaFecha = '';
    reservaHoraInicio = '';
    reservaHoraFin = '';
    reservaMotivo = '';
    submitting = false;

    selectedDateNoSlots = false;
    selectedDateNoSlotsMessage = '';

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
    }

    loadSalas() {
        this.loading = true;
        this.salaService.getActivas().subscribe({
            next: (salas) => {
                this.salas = (salas || []).filter(s => s.activa !== false);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando salas activas:', err);
                this.loading = false;
            }
        });
    }

    loadMisReservas() {
        const payload = this.authService.getPayload();
        if (!payload) return;
        const userId = payload.id || payload.sub;
        this.reservaSalaService.getByUsuario(userId).subscribe({
            next: (r) => {
                this.misReservas = (r || []).map(reserva => ({
                    ...reserva,
                    sala: reserva.sala || this.salas.find(s => s.id === (reserva as any).salaId) || { id: '', nombre: 'Sala de Estudio' }
                }));
            },
            error: (err: any) => console.error('Error cargando mis reservas:', err)
        });
    }

    openReservaForm(sala: Sala) {
        this.selectedSalaId = sala.id;
        this.reservaFecha = this.getTodayDate();
        this.reservaHoraInicio = '';
        this.reservaHoraFin = '';
        this.reservaMotivo = '';
        this.reservasActivas = [];
        this.showForm = true;
        this.onFechaChange();
    }

    cancelForm() {
        this.showForm = false;
        this.selectedSalaId = null;
        this.reservasActivas = [];
        this.selectedDateNoSlots = false;
        this.selectedDateNoSlotsMessage = '';
    }

    formatHora(hora: any): string {
        if (!hora) return '';
        if (typeof hora === 'string') return hora.substring(0, 5);
        if (Array.isArray(hora) && hora.length >= 2) {
            const h = String(hora[0]).padStart(2, '0');
            const m = String(hora[1] || 0).padStart(2, '0');
            return `${h}:${m}`;
        }
        if (typeof hora === 'object' && hora.hour !== undefined) {
            const h = String(hora.hour).padStart(2, '0');
            const m = String(hora.minute || 0).padStart(2, '0');
            return `${h}:${m}`;
        }
        return String(hora).substring(0, 5);
    }

    onFechaChange() {
        this.reservasActivas = [];
        this.reservaHoraInicio = '';
        this.reservaHoraFin = '';
        this.horasFinDisponibles = [];
        this.generarHorarios();

        if (!this.selectedSalaId || !this.reservaFecha || this.selectedDateNoSlots) return;

        this.loadingHorarios = true;
        this.reservaSalaService.getBySalaYFecha(this.selectedSalaId, this.reservaFecha).subscribe({
            next: (reservas) => {
                this.reservasActivas = (reservas || []).filter(r => r.estado !== 'CANCELADA');
                this.filtrarHorariosOcupados();
                this.loadingHorarios = false;
            },
            error: (err) => {
                console.error('Error cargando reservas de la fecha', err);
                this.loadingHorarios = false;
            }
        });
    }

    filtrarHorariosOcupados() {
        if (!this.horasDisponibles.length) return;

        this.horasDisponibles = this.horasDisponibles.filter(hora => {
            for (const r of this.reservasActivas) {
                const exInicio = this.formatHora(r.horaInicio);
                const exFin = this.formatHora(r.horaFin);
                if (exInicio && exFin && hora >= exInicio && hora < exFin) {
                    return false;
                }
            }
            return true;
        });

        if (this.horasDisponibles.length === 0 && !this.selectedDateNoSlots) {
            this.selectedDateNoSlots = true;
            this.selectedDateNoSlotsMessage = 'Todos los horarios de atención para esta fecha se encuentran ocupados en esta sala. Por favor selecciona otra fecha u otra sala.';
        }
    }

    generarHorarios() {
        this.horasDisponibles = [];
        this.selectedDateNoSlots = false;
        this.selectedDateNoSlotsMessage = '';

        if (!this.reservaFecha) return;

        const now = new Date();
        const parts = this.reservaFecha.split('-').map(v => parseInt(v, 10));
        if (parts.length < 3) return;

        const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (selectedDate < todayDate) {
            this.selectedDateNoSlots = true;
            this.selectedDateNoSlotsMessage = 'No puedes realizar reservas en fechas pasadas.';
            return;
        }

        const isToday = selectedDate.getTime() === todayDate.getTime();

        for (let h = 8; h <= 18; h++) {
            for (const m of ['00', '30']) {
                const horaStr = `${h < 10 ? '0' + h : h}:${m}`;

                if (isToday) {
                    const candidateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, parseInt(m, 10), 0, 0);
                    // 15 minutes ahead buffer
                    const minFutureTime = new Date(now.getTime() + 15 * 60 * 1000);
                    if (candidateTime <= minFutureTime) continue;
                }

                this.horasDisponibles.push(horaStr);
            }
        }

        if (isToday && this.horasDisponibles.length === 0) {
            this.selectedDateNoSlots = true;
            this.selectedDateNoSlotsMessage = 'El horario de atención es de 08:00 a 19:00. Ya no quedan turnos disponibles para el día de hoy; por favor reserva a partir de mañana.';
        }
    }

    onHoraInicioChange() {
        this.horasFinDisponibles = [];
        this.reservaHoraFin = '';
        if (!this.reservaHoraInicio) return;

        const [hStr, mStr] = this.reservaHoraInicio.split(':');
        let h = parseInt(hStr, 10);
        let m = parseInt(mStr, 10);

        m += 30;
        if (m === 60) {
            h++;
            m = 0;
        }

        const maxOpciones = 4; // allow blocks up to 2 hours
        let opcionesAgregadas = 0;

        while ((h < 19 || (h === 19 && m === 0)) && opcionesAgregadas < maxOpciones) {
            const hora = h < 10 ? `0${h}` : `${h}`;
            const minuto = m === 0 ? '00' : '30';
            const horaCandidata = `${hora}:${minuto}`;

            let cruzaReserva = false;
            for (const r of this.reservasActivas) {
                const exInicio = this.formatHora(r.horaInicio);
                if (exInicio && exInicio >= this.reservaHoraInicio && exInicio < horaCandidata) {
                    cruzaReserva = true;
                    break;
                }
            }

            if (cruzaReserva) {
                break;
            }

            this.horasFinDisponibles.push(horaCandidata);
            m += 30;
            if (m === 60) {
                h++;
                m = 0;
            }
            opcionesAgregadas++;
        }

        if (this.horasFinDisponibles.length > 0) {
            this.reservaHoraFin = this.horasFinDisponibles[0];
        }
    }

    getSalaName(id: string): string {
        return this.salas.find(s => s.id === id)?.nombre || 'Sala de Estudio';
    }

    submitReserva() {
        if (!this.selectedSalaId || !this.reservaFecha || !this.reservaHoraInicio || !this.reservaHoraFin) {
            Swal.fire('Atención', 'Completa todos los campos obligatorios.', 'warning');
            return;
        }

        if (this.reservaHoraInicio < '08:00' || this.reservaHoraFin > '19:00') {
            Swal.fire('Atención', 'Las reservas solo están permitidas entre las 08:00 y las 19:00.', 'warning');
            return;
        }

        if (this.reservaHoraInicio >= this.reservaHoraFin) {
            Swal.fire('Atención', 'La hora de fin debe ser posterior a la hora de inicio.', 'warning');
            return;
        }

        for (const existente of this.reservasActivas) {
            const exInicio = this.formatHora(existente.horaInicio);
            const exFin = this.formatHora(existente.horaFin);

            if (exInicio && exFin && this.reservaHoraInicio < exFin && this.reservaHoraFin > exInicio) {
                Swal.fire({
                    title: 'Horario no disponible',
                    text: `La sala ya está ocupada desde las ${exInicio} hasta las ${exFin}. Por favor, selecciona otro horario.`,
                    icon: 'warning'
                });
                return;
            }
        }

        const payload = this.authService.getPayload();
        if (!payload) {
            Swal.fire('Sesión requerida', 'Debes iniciar sesión para realizar una reserva.', 'warning');
            return;
        }

        this.submitting = true;
        this.reservaSalaService.create({
            sala: { id: this.selectedSalaId },
            usuario: { id: payload.id || payload.sub },
            fechaReserva: this.reservaFecha,
            horaInicio: this.reservaHoraInicio,
            horaFin: this.reservaHoraFin,
            motivo: this.reservaMotivo ? this.reservaMotivo.trim() : 'Estudio'
        }).subscribe({
            next: () => {
                this.submitting = false;
                this.cancelForm();
                this.loadMisReservas();
                Swal.fire({
                    title: '¡Reservada!',
                    text: 'Tu sala ha sido reservada con éxito.',
                    icon: 'success',
                    timer: 2200,
                    showConfirmButton: false
                });
            },
            error: (err: any) => {
                this.submitting = false;
                console.error('Error al reservar sala:', err);
                const msg = err.error?.error || err.message || 'No se pudo reservar la sala';
                Swal.fire('Error', msg, 'error');
            }
        });
    }

    cancelarReserva(reserva: ReservaSala) {
        Swal.fire({
            title: '¿Cancelar reserva?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                this.reservaSalaService.cambiarEstado(reserva.id, 'CANCELADA').subscribe({
                    next: () => {
                        this.loadMisReservas();
                        Swal.fire('¡Cancelada!', 'Tu reserva ha sido cancelada exitosamente.', 'success');
                    },
                    error: (err: any) => {
                        console.error('Error al cancelar reserva:', err);
                        const msg = err.error?.error || 'No se pudo cancelar la reserva';
                        Swal.fire('Error', msg, 'error');
                    }
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
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
