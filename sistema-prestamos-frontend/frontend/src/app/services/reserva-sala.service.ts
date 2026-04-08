import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

    private baseUrl = '/api/reservas-sala';

    constructor(private http: HttpClient) { }

    getAll(): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(this.baseUrl);
    }

    getByUsuario(usuarioId: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/usuario/${usuarioId}`);
    }

    getBySala(salaId: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/sala/${salaId}`);
    }

    getBySalaYFecha(salaId: string, fecha: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/sala/${salaId}/fecha/${fecha}`);
    }

    create(reserva: ReservaSalaPayload): Observable<ReservaSala> {
        return this.http.post<ReservaSala>(this.baseUrl, reserva);
    }

    update(id: string, reserva: ReservaSalaPayload): Observable<ReservaSala> {
        return this.http.put<ReservaSala>(`${this.baseUrl}/${id}`, reserva);
    }

    cambiarEstado(id: string, estado: string): Observable<ReservaSala> {
        return this.http.patch<ReservaSala>(`${this.baseUrl}/${id}/estado`, { estado });
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
