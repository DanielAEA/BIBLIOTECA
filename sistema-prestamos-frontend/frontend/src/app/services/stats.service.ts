import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/stats/summary`);
  }

  registrarLecturaDigital(usuarioId: string, libroId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/prestamos/lectura-virtual`, { usuarioId, libroId });
  }

  getMostBorrowedBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/most-borrowed`);
  }

  getLoansByMonth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/loans-by-month`);
  }

  getInventoryDistribution(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/stats/inventory`);
  }

  getLoansByGenre(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/by-genre`);
  }

  getLoansByRole(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/by-role`);
  }

  getMostBorrowedAuthors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/most-borrowed-authors`);
  }

  getLoansByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/by-status`);
  }

  getPunctualityRate(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/stats/punctuality`);
  }

  getDebtors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/debtors`);
  }

  getFinesStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/fines-stats`);
  }

  getUpcomingExpirations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/upcoming-expirations`);
  }

  getInactiveBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/stats/inactive-books`);
  }
}
