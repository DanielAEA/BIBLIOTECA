import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private baseUrl = '/api/stats';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary`);
  }

  registrarLecturaDigital(usuarioId: string, libroId: string): Observable<any> {
    return this.http.post('/api/prestamos/lectura-virtual', { usuarioId, libroId });
  }

  getMostBorrowedBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/most-borrowed`);
  }

  getLoansByMonth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/loans-by-month`);
  }

  getInventoryDistribution(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory`);
  }

  getLoansByGenre(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-genre`);
  }

  getLoansByRole(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-role`);
  }

  getMostBorrowedAuthors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/most-borrowed-authors`);
  }

  getLoansByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-status`);
  }

  getPunctualityRate(): Observable<any> {
    return this.http.get(`${this.baseUrl}/punctuality`);
  }

  getDebtors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/debtors`);
  }

  getFinesStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fines-stats`);
  }

  getUpcomingExpirations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/upcoming-expirations`);
  }

  getInactiveBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inactive-books`);
  }
}
