import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReservaSala {
    id: number;
    sala: { id: number; nombre?: string; ubicacion?: string };
    usuario: { id: number; nombre?: string; correo?: string };
    fechaReserva: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
    estado: string;
}

export interface ReservaSalaPayload {
    sala: { id: number };
    usuario: { id: number };
    fechaReserva: string;
    horaInicio: string;
    horaFin: string;
    motivo: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaSalaService {

    private baseUrl = 'http://localhost:8080/api/reservas-sala';

    constructor(private http: HttpClient) { }

    getAll(): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(this.baseUrl);
    }

    getByUsuario(usuarioId: number): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/usuario/${usuarioId}`);
    }

    getBySala(salaId: number): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/sala/${salaId}`);
    }

    getBySalaYFecha(salaId: number, fecha: string): Observable<ReservaSala[]> {
        return this.http.get<ReservaSala[]>(`${this.baseUrl}/sala/${salaId}/fecha/${fecha}`);
    }

    create(reserva: ReservaSalaPayload): Observable<ReservaSala> {
        return this.http.post<ReservaSala>(this.baseUrl, reserva);
    }

    update(id: number, reserva: ReservaSalaPayload): Observable<ReservaSala> {
        return this.http.put<ReservaSala>(`${this.baseUrl}/${id}`, reserva);
    }

    cambiarEstado(id: number, estado: string): Observable<ReservaSala> {
        return this.http.patch<ReservaSala>(`${this.baseUrl}/${id}/estado`, { estado });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
