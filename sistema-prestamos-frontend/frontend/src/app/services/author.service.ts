import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Autor {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AuthorService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Autor[]> {
    return this.http.get<Autor[]>(`${this.baseUrl}/api/autores`);
  }

  getById(id: string): Observable<Autor> {
    return this.http.get<Autor>(`${this.baseUrl}/api/autores/${id}`);
  }

  create(nombre: string): Observable<Autor> {
    return this.http.post<Autor>(`${this.baseUrl}/api/autores`, { nombre });
  }

  update(id: string, nombre: string): Observable<Autor> {
    return this.http.put<Autor>(`${this.baseUrl}/api/autores/${id}`, { nombre });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/autores/${id}`);
  }
}


