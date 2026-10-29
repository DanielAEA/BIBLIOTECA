import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Libro } from './book.service';
import { environment } from '../../environments/environment';

export interface Ejemplar {
  id: string;
  codigo: string;
  disponible: boolean;
  estado?: string;
  bloque?: string;
  estante?: string;
  libro: Libro;
}

export interface EjemplarPayload {
  codigo: string;
  disponible: boolean;
  bloque?: string;
  estante?: string;
  libro: { id: string };
}

@Injectable({ providedIn: 'root' })
export class EjemplarService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ejemplar[]> {
    return this.http.get<Ejemplar[]>(`${this.baseUrl}/api/ejemplares`);
  }

  getById(id: string): Observable<Ejemplar> {
    return this.http.get<Ejemplar>(`${this.baseUrl}/api/ejemplares/${id}`);
  }

  create(ejemplar: EjemplarPayload): Observable<Ejemplar> {
    return this.http.post<Ejemplar>(`${this.baseUrl}/api/ejemplares`, ejemplar);
  }

  update(ejemplar: Ejemplar): Observable<Ejemplar> {
    return this.http.put<Ejemplar>(`${this.baseUrl}/api/ejemplares/${ejemplar.id}`, ejemplar);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/ejemplares/${id}`);
  }
}


