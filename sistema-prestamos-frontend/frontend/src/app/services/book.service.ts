import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

export interface LibroPayload {
  titulo: string;
  autores: Array<{ id: string }>;
  editorial: { id: string } | null;
  genero: { id: string } | null;
  formato: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {

  private baseUrl = '';

  constructor(private http: HttpClient) {}

  getAllBooks(): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.baseUrl}/api/libros`);
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

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/libros/${id}`);
  }

  uploadPdf(id: string, file: File): Observable<Libro> {
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


