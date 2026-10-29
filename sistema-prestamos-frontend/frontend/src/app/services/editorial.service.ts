import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Editorial {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class EditorialService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Editorial[]> {
    return this.http.get<Editorial[]>(`${this.baseUrl}/api/editoriales`);
  }

  getById(id: string): Observable<Editorial> {
    return this.http.get<Editorial>(`${this.baseUrl}/api/editoriales/${id}`);
  }

  create(nombre: string): Observable<Editorial> {
    return this.http.post<Editorial>(`${this.baseUrl}/api/editoriales`, { nombre });
  }

  update(id: string, nombre: string): Observable<Editorial> {
    return this.http.put<Editorial>(`${this.baseUrl}/api/editoriales/${id}`, { nombre });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/editoriales/${id}`);
  }
}


