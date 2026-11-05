import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PrediccionRequest {
  categoria: string;
  mes?: number;
  previo?: number;
  prom3?: number;
}

export interface PrediccionResponse {
  mes: number;
  categoria: string;
  prediccion_prestamos: number;
  valor_continuo: number;
  previo?: number;
  prom3?: number;
  total_historico_db?: number;
  libros_disponibles_db?: number;
  origen_datos?: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrediccionService {
  private readonly apiUrl = `${environment.apiUrl}/api/predicciones/prestamos`;

  constructor(private http: HttpClient) {}

  obtenerPrediccion(datos: PrediccionRequest): Observable<PrediccionResponse> {
    return this.http.post<PrediccionResponse>(this.apiUrl, datos);
  }
}
