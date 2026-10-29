import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sala {
    id: string;
    nombre: string;
    descripcion: string;
    capacidad: number;
    ubicacion: string;
    activa: boolean;
}

export interface SalaPayload {
    nombre: string;
    descripcion: string;
    capacidad: number;
    ubicacion: string;
    activa: boolean;
}

@Injectable({ providedIn: 'root' })
export class SalaService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Sala[]> {
        return this.http.get<Sala[]>(`${this.baseUrl}/api/salas`);
    }

    getActivas(): Observable<Sala[]> {
        return this.http.get<Sala[]>(`${this.baseUrl}/api/salas/activas`);
    }

    getById(id: string): Observable<Sala> {
        return this.http.get<Sala>(`${this.baseUrl}/api/salas/${id}`);
    }

    create(sala: SalaPayload): Observable<Sala> {
        return this.http.post<Sala>(`${this.baseUrl}/api/salas`, sala);
    }

    update(id: string, sala: SalaPayload): Observable<Sala> {
        return this.http.put<Sala>(`${this.baseUrl}/api/salas/${id}`, sala);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/salas/${id}`);
    }
}

