import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Libro {
  id: number;
  titulo: string;
  autores?: { id: number; nombre: string }[];
  editorial?: { id: number; nombre: string };
  genero?: { id: number; nombre: string };
  stockDisponible: number;
  archivoDigital?: string;
  tieneDigital?: boolean;
  formato?: string;
}

export interface LibroPayload {
  titulo: string;
  autores: Array<{ id: number }>;
  editorial: { id: number } | null;
  genero: { id: number } | null;
  formato: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAllBooks(): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.baseUrl}/api/libros`);
  }

  getBookById(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.baseUrl}/api/libros/${id}`);
  }

  createBook(libro: LibroPayload): Observable<Libro> {
    return this.http.post<Libro>(`${this.baseUrl}/api/libros`, libro);
  }

  updateBook(id: number, libro: LibroPayload): Observable<Libro> {
    return this.http.put<Libro>(`${this.baseUrl}/api/libros/${id}`, libro);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/libros/${id}`);
  }

  uploadPdf(id: number, file: File): Observable<Libro> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('sp_token');

    return new Observable<Libro>(observer => {
      fetch(`${this.baseUrl}/api/libros/${id}/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        return response.json();
      })
      .then(data => {
        observer.next(data);
        observer.complete();
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }
}

