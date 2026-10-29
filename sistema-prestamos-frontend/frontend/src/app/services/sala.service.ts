import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { PageResponse } from '../shared/pagination/pagination.component';

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

    getPaginated(page: number = 0, size: number = 10, search?: string, activa?: boolean): Observable<PageResponse<Sala>> {
        let params: any = { page, size };
        if (search?.trim()) {
            params.search = search.trim();
        }
        if (activa !== undefined && activa !== null) {
            params.activa = activa;
        }
        return this.http.get<PageResponse<Sala>>(`${this.baseUrl}/api/salas`, { params });
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

