import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from './user.service';
import { Libro } from './book.service';

export interface Multa {
  id: string;
  total: number;
  diasAtraso: number;
  pagada: boolean;
}

export interface Prestamo {
  id: string;
  usuario: Usuario;
  libro?: Libro;
  ejemplarCodigo?: string;
  tipoPrestamo?: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  fechaDevolucionReal?: string;
  devuelto: boolean;
  estado?: string;
  multa?: Multa;
}

export interface PrestamoPayload {
  usuarioId?: string;
  libroId?: string;
  ejemplarCodigo?: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  devuelto?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoanService {
  private baseUrl = '';
  private loansSubject = new BehaviorSubject<Prestamo[] | null>(null);
  public loans$ = this.loansSubject.asObservable();

  constructor(private http: HttpClient) { }

  getAll(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/api/prestamos`);
  }

  create(payload: PrestamoPayload): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.baseUrl}/api/prestamos`, payload).pipe(
      tap((created) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next([created, ...cur]);
      })
    );
  }

  update(id: string, prestamo: PrestamoPayload): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${id}`, prestamo).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  returnLoan(id: string): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${id}/devolver`, {}).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  acceptLoan(id: string): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${id}/aceptar`, {}).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  rejectLoan(id: string): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${id}/rechazar`, {}).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  payFine(prestamo: Prestamo): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${prestamo.id}/pagar-multa`, {}).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/prestamos/${id}`).pipe(
      tap(() => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.filter((p) => p.id !== id));
      })
    );
  }

  getByUserId(userId: string): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/api/prestamos/usuario/${userId}`);
  }

  loadAll(): void {
    this.getAll().subscribe({
      next: (list) => this.loansSubject.next(list),
      error: (err) => {
        console.error('Error cargando préstamos en LoanService:', err);
        this.loansSubject.next([]);
      }
    });
  }
}
