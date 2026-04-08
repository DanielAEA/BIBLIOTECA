import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resena {
    id: string;
    libro: { id: string; titulo?: string };
    usuario: { id: string; nombre?: string; correo?: string };
    calificacion: number;
    comentario: string;
    fechaCreacion: string;
}

export interface ResenaPayload {
    libro: { id: string };
    usuario: { id: string };
    calificacion: number;
    comentario: string;
}

export interface PromedioCalificacion {
    libroId: string;
    promedio: number;
    totalResenas: number;
}

@Injectable({ providedIn: 'root' })
export class ResenaService {

    private baseUrl = '/api/resenas';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Resena[]> {
        return this.http.get<Resena[]>(this.baseUrl);
    }

    getByLibro(libroId: string): Observable<Resena[]> {
        return this.http.get<Resena[]>(`${this.baseUrl}/libro/${libroId}`);
    }

    getByUsuario(usuarioId: string): Observable<Resena[]> {
        return this.http.get<Resena[]>(`${this.baseUrl}/usuario/${usuarioId}`);
    }

    getPromedio(libroId: string): Observable<PromedioCalificacion> {
        return this.http.get<PromedioCalificacion>(`${this.baseUrl}/libro/${libroId}/promedio`);
    }

    create(resena: ResenaPayload): Observable<Resena> {
        return this.http.post<Resena>(this.baseUrl, resena);
    }

    update(id: string, resena: ResenaPayload): Observable<Resena> {
        return this.http.put<Resena>(`${this.baseUrl}/${id}`, resena);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
