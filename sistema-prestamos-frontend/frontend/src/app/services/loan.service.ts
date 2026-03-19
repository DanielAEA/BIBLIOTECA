import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from './user.service';
import { Ejemplar } from './ejemplar.service';

export interface Multa {
  id: number;
  total: number;
  diasAtraso: number;
  pagada: boolean;
}

export interface Prestamo {
  id: number;
  usuario: Usuario;
  ejemplar: Ejemplar;
  fechaPrestamo: string;
  fechaDevolucion: string;
  fechaDevolucionReal?: string;
  devuelto: boolean;
  multa?: Multa;
}

export interface PrestamoPayload {
  usuarioId?: number;
  ejemplarId?: number;
  usuario?: { id: number };
  ejemplar?: { id: number };
  fechaPrestamo: string;
  fechaDevolucion: string;
  devuelto: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoanService {
  private baseUrl = 'http://localhost:8080';
  // Estado local compartido de préstamos (CRUD reactivo)
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

  update(id: number, prestamo: PrestamoPayload): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${id}`, prestamo).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  returnLoan(id: number): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/api/prestamos/${id}/devolver`, {}).pipe(
      tap((updated) => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => (p.id === updated.id ? updated : p)));
      })
    );
  }

  payFine(prestamo: Prestamo): Observable<any> {
    if (!prestamo.multa) return new Observable();
    const updatedMulta = { ...prestamo.multa, pagada: true };
    return this.http.put(`${this.baseUrl}/api/multas/${prestamo.multa.id}`, updatedMulta).pipe(
      tap(() => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.map((p) => {
          if (p.id === prestamo.id && p.multa) {
            return { ...p, multa: { ...p.multa, pagada: true } };
          }
          return p;
        }));
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/prestamos/${id}`).pipe(
      tap(() => {
        const cur = this.loansSubject.value ?? [];
        this.loansSubject.next(cur.filter((p) => p.id !== id));
      })
    );
  }

  getByUserId(userId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/api/prestamos/usuario/${userId}`);
  }

  // Cargar y sincronizar todos los préstamos en el subject
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

