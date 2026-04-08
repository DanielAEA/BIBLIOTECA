import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Genero {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class GeneroService {

  private baseUrl = '';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${this.baseUrl}/api/generos`);
  }

  getById(id: string): Observable<Genero> {
    return this.http.get<Genero>(`${this.baseUrl}/api/generos/${id}`);
  }

  create(nombre: string): Observable<Genero> {
    return this.http.post<Genero>(`${this.baseUrl}/api/generos`, { nombre });
  }

  update(id: string, nombre: string): Observable<Genero> {
    return this.http.put<Genero>(`${this.baseUrl}/api/generos/${id}`, { nombre });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/generos/${id}`);
  }
}


