import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  password?: string;
  rol?: string;
}


export interface UsuarioCreatePayload {
  nombre: string;
  correo: string;
  password: string;
  rol?: string;
}


export interface UsuarioUpdatePayload {
  nombre: string;
  correo: string;
  password?: string;
  rol?: string;
}

import { PageResponse } from '../shared/pagination/pagination.component';

@Injectable({ providedIn: 'root' })
export class UserService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/api/usuarios`);
  }

  getUsersPaginated(page: number = 0, size: number = 10, search?: string): Observable<PageResponse<Usuario>> {
    let params: any = { page, size };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return this.http.get<PageResponse<Usuario>>(`${this.baseUrl}/api/usuarios`, { params });
  }

  getUserById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/api/usuarios/${id}`);
  }

  updateUser(id: string, usuario: UsuarioUpdatePayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/api/usuarios/${id}`, usuario);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/usuarios/${id}`);
  }

  createUser(usuario: UsuarioCreatePayload): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/api/usuarios`, usuario);
  }
}

