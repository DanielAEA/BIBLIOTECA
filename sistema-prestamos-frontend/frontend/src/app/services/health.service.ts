import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private baseUrl = '';

  constructor(private http: HttpClient) {}

  
  checkBackendHealth(): Observable<{ available: boolean; message: string }> {
    
    
    return this.http.options(`${this.baseUrl}/auth/login`, { observe: 'response' }).pipe(
      map(() => ({
        available: true,
        message: 'Backend disponible y funcionando correctamente'
      })),
      catchError((err) => {
        
        if (err.status === 401 || err.status === 403 || err.status === 405) {
          return of({
            available: true,
            message: 'Backend disponible (el endpoint requiere autenticación)'
          });
        }
        
        if (err.status === 404) {
          return this.http.options(`${this.baseUrl}/api/prestamos`, { observe: 'response' }).pipe(
            map(() => ({
              available: true,
              message: 'Backend disponible y funcionando correctamente'
            })),
            catchError(() => of({
              available: false,
              message: 'No se pudo conectar al backend. Verifica que esté corriendo correctamente.'
            }))
          );
        }
        
        return of({
          available: false,
          message: `Error de conexión: ${err.message || 'No se pudo conectar al backend'}`
        });
      })
    );
  }

  
  isBackendAvailable(): Observable<boolean> {
    return this.checkBackendHealth().pipe(
      map(result => result.available)
    );
  }
}


