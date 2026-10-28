import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EjemplarDTO {
  id: string;
  codigo: string;
  disponible: boolean;
  estado: string;
  bloque?: string;
  estante?: string;
}

export interface Libro {
  id: string;
  titulo: string;
  autores?: { id: string; nombre: string }[];
  editorial?: { id: string; nombre: string };
  genero?: { id: string; nombre: string };
  stockDisponible: number;
  archivoDigital?: string;
  tieneDigital?: boolean;
  formato?: string;
  isbn?: string;
  urlPortada?: string;
  urlQr?: string;
  codigo?: string;
  publicacion?: string;
  descripcion?: string;
  ejemplares?: EjemplarDTO[];
}

export interface LibroPayload {
  titulo: string;
  autores: Array<{ id: string }>;
  editorial: { id: string } | null;
  genero: { id: string } | null;
  formato: string;
  isbn?: string;
  urlPortada?: string;
  urlQr?: string;
  publicacion?: string;
  descripcion?: string;
}

import { PageResponse } from '../shared/pagination/pagination.component';

@Injectable({ providedIn: 'root' })
export class BookService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllBooks(page?: number, size?: number): Observable<Libro[]> {
    let url = `${this.baseUrl}/api/libros`;
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    return this.http.get<Libro[]>(url);
  }

  getBooksPaginated(page: number = 0, size: number = 10, filters?: any): Observable<PageResponse<Libro>> {
    let params: any = { page, size };
    if (filters) {
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.autor?.trim()) params.autor = filters.autor.trim();
      if (filters.genero?.trim()) params.genero = filters.genero.trim();
      if (filters.bloque?.trim()) params.bloque = filters.bloque.trim();
      if (filters.armario?.trim()) params.armario = filters.armario.trim();
    }
    return this.http.get<PageResponse<Libro>>(`${this.baseUrl}/api/libros`, { params });
  }
  getBookById(id: string): Observable<Libro> {
    return this.http.get<Libro>(`${this.baseUrl}/api/libros/${id}`);
  }

  createBook(libro: LibroPayload): Observable<Libro> {
    return this.http.post<Libro>(`${this.baseUrl}/api/libros`, libro);
  }

  updateBook(id: string, libro: LibroPayload): Observable<Libro> {
    return this.http.put<Libro>(`${this.baseUrl}/api/libros/${id}`, libro);
  }

  bulkDeleteBooks(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/libros/bulk-delete`, { body: ids });
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/libros/${id}`);
  }

  getCoverPreview(isbn: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/api/libros/cover-preview`, { params: { isbn } });
  }

  getBookMetadata(isbn: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/libros/metadata`, { params: { isbn } });
  }

  uploadPortada(id: string, file: File): Observable<Libro> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Libro>(`${this.baseUrl}/api/libros/${id}/portada`, formData);
  }

  deletePortada(id: string): Observable<Libro> {
    return this.http.delete<Libro>(`${this.baseUrl}/api/libros/${id}/portada`);
  }

  uploadPdf(id: string, file: File): Observable<Libro> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Libro>(`${this.baseUrl}/api/libros/${id}/upload-pdf`, formData);
  }

  
  
  

  addEjemplar(libroId: string, ejemplar: { codigo: string; bloque?: string; estante?: string }): Observable<Libro> {
    return this.http.post<Libro>(`${this.baseUrl}/api/libros/${libroId}/ejemplares`, ejemplar);
  }

  deleteEjemplar(libroId: string, ejemplarId: string): Observable<Libro> {
    return this.http.delete<Libro>(`${this.baseUrl}/api/libros/${libroId}/ejemplares/${ejemplarId}`);
  }

  getEjemplarQrUrl(libroId: string, ejemplarId: string): string {
    return `${this.baseUrl}/api/libros/${libroId}/ejemplares/${ejemplarId}/qr`;
  }

  getNextEjemplarCode(): Observable<{ nextCode: string }> {
    return this.http.get<{ nextCode: string }>(`${this.baseUrl}/api/libros/ejemplares/next-code`);
  }
}
