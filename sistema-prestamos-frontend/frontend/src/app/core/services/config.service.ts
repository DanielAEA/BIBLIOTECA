import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = null;

  constructor(private http: HttpClient) {}

  public async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(this.http.get('/assets/config.json'));
    } catch {
      this.config = {};
    }
  }

  get apiUrl(): string {
    const url = (this.config?.apiUrl || environment.apiUrl || '').trim();
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  get frontUrl(): string {
    const url = (this.config?.frontUrl || environment.frontUrl || '').trim();
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  get googleClientId(): string {
    return (this.config?.googleClientId || '').trim();
  }

  get microsoftClientId(): string {
    return (this.config?.microsoftClientId || '').trim();
  }
}
