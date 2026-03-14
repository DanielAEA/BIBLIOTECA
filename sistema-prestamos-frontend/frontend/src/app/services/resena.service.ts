import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resena {
    id: number;
    libro: { id: number; titulo?: string };
    usuario: { id: number; nombre?: string; correo?: string };
    calificacion: number;
    comentario: string;
    fechaCreacion: string;
}

export interface ResenaPayload {
    libro: { id: number };
    usuario: { id: number };
    calificacion: number;
    comentario: string;
}

export interface PromedioCalificacion {
    libroId: number;
    promedio: number;
    totalResenas: number;
}

@Injectable({ providedIn: 'root' })
export class ResenaService {

    private baseUrl = 'http://localhost:8080/api/resenas';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Resena[]> {
        return this.http.get<Resena[]>(this.baseUrl);
    }

    getByLibro(libroId: number): Observable<Resena[]> {
        return this.http.get<Resena[]>(`${this.baseUrl}/libro/${libroId}`);
    }

    getByUsuario(usuarioId: number): Observable<Resena[]> {
        return this.http.get<Resena[]>(`${this.baseUrl}/usuario/${usuarioId}`);
    }

    getPromedio(libroId: number): Observable<PromedioCalificacion> {
        return this.http.get<PromedioCalificacion>(`${this.baseUrl}/libro/${libroId}/promedio`);
    }

    create(resena: ResenaPayload): Observable<Resena> {
        return this.http.post<Resena>(this.baseUrl, resena);
    }

    update(id: number, resena: ResenaPayload): Observable<Resena> {
        return this.http.put<Resena>(`${this.baseUrl}/${id}`, resena);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
