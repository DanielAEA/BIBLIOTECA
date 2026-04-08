import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = null;

  constructor(private http: HttpClient) {}

  public async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(this.http.get('/assets/config.json'));
      console.log('Configuración cargada exitosamente:', this.config);
    } catch (error) {
      console.error('Error cargando la configuración (assets/config.json). Se usará URL por defecto.', error);
    }
  }

  get apiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:8080';
  }

  get frontUrl(): string {
    return this.config?.frontUrl || 'http://localhost:4200';
  }
}
