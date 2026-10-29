import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReservaSala {
    id: string;
    sala: { id: string; nombre?: string; ubicacion?: string };
    usuario: { id: string; nombre?: string; correo?: string };
    fechaReserva: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
    estado: string;
}

export interface ReservaSalaPayload {
    sala: { id: string };
    usuario: { id: string };
    fechaReserva: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaSalaService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/api/reservas-sala`);
    }

    getByUsuario(usuarioId: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/api/reservas-sala/usuario/${usuarioId}`);
    }

    getBySala(salaId: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/api/reservas-sala/sala/${salaId}`);
    }

    getBySalaYFecha(salaId: string, fecha: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/api/reservas-sala/sala/${salaId}/fecha/${fecha}`);
    }

    create(reserva: ReservaSalaPayload): Observable<ReservaSala> {
        return this.http.post<ReservaSala>(`${this.baseUrl}/api/reservas-sala`, reserva);
    }

    update(id: string, reserva: ReservaSalaPayload): Observable<ReservaSala> {
        return this.http.put<ReservaSala>(`${this.baseUrl}/api/reservas-sala/${id}`, reserva);
    }

    cambiarEstado(id: string, estado: string): Observable<ReservaSala> {
        return this.http.patch<ReservaSala>(`${this.baseUrl}/api/reservas-sala/${id}/estado`, { estado });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/reservas-sala/${id}`);
    }
}
