import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { PageResponse } from '../shared/pagination/pagination.component';

export interface Genero {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class GeneroService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Genero[]> {
    return this.http.get<Genero[]>(`${this.baseUrl}/api/generos`);
  }

  getPaginated(page: number = 0, size: number = 10, search?: string): Observable<PageResponse<Genero>> {
    let params: any = { page, size };
    if (search?.trim()) {
      params.search = search.trim();
    }
    return this.http.get<PageResponse<Genero>>(`${this.baseUrl}/api/generos`, { params });
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


