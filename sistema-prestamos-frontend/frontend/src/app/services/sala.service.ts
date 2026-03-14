import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sala {
    id: number;
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

    private baseUrl = 'http://localhost:8080/api/salas';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Sala[]> {
        return this.http.get<Sala[]>(this.baseUrl);
    }

    getActivas(): Observable<Sala[]> {
        return this.http.get<Sala[]>(`${this.baseUrl}/activas`);
    }

    getById(id: number): Observable<Sala> {
        return this.http.get<Sala>(`${this.baseUrl}/${id}`);
    }

    create(sala: SalaPayload): Observable<Sala> {
        return this.http.post<Sala>(this.baseUrl, sala);
    }

    update(id: number, sala: SalaPayload): Observable<Sala> {
        return this.http.put<Sala>(`${this.baseUrl}/${id}`, sala);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
