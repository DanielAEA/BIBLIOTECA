import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'sp_token';
  private userSubject = new BehaviorSubject<any>(this.getPayload());
  user$ = this.userSubject.asObservable();

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private router: Router) { }

  login(correo: string, password: string): Observable<void> {
    const body = { correo, password };
    console.log('📤 Enviando petición de login a:', `${this.baseUrl}/auth/login`);
    console.log('📤 Body enviado:', body);

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, body)
      .pipe(
        map((res) => {
          console.log('✅ Respuesta del servidor:', res);
          localStorage.setItem(this.tokenKey, res.token);
          this.userSubject.next(this.getPayload());
        })
      );
  }

  register(userData: any): Observable<any> {
    console.log('📤 Enviando petición de registro a:', `${this.baseUrl}/auth/register`);
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private decode(token: string): any {
    try {
      const p = token.split('.')[1];
      const decoded = atob(p.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  getPayload() {
    const token = this.getToken();
    return token ? this.decode(token) : null;
  }

  hasRole(role: string): boolean {
    const payload = this.getPayload();
    const roles = payload?.roles ?? payload?.authorities ?? [];
    return Array.isArray(roles) && roles.includes(role);
  }

  getRol(): string | null {
    const payload = this.getPayload();
    if (!payload) return null;
    const roles = payload.roles ?? payload.authorities ?? [];
    return Array.isArray(roles) && roles.length > 0 ? roles[0] : null;
  }
}
