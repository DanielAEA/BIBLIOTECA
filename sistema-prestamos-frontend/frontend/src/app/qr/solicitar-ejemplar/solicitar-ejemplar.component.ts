import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-ejemplar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-ejemplar.component.html',
  styleUrls: ['./solicitar-ejemplar.component.scss']
})
export class SolicitarEjemplarComponent implements OnInit {
  id: string | null = null;
  ejemplar: any = null;
  libroCompleto: any = null;
  loading = true;
  submitting = false;
  success = false;
  portadaUrl = 'assets/default-cover.svg';
  currentUserEmail = '';
  isUserLoggedIn = false;
  diasPrestamo: number = 7;
  opcionesDias: number[] = [3, 7, 14, 30];
  private apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.authService.isLoggedIn()) {
      localStorage.setItem('redirectUrl', this.router.url);
      this.router.navigate(['/login']);
      return;
    }

    this.checkUserSession();

    if (this.id) {
      this.loadEjemplar();
    } else {
      this.loading = false;
    }
  }

  checkUserSession() {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      const payload = this.authService.getPayload();
      this.currentUserEmail = payload?.sub || payload?.correo || payload?.username || 'Usuario';
    } else {
      this.currentUserEmail = '';
    }
  }

  getUserInitial(): string {
    return this.currentUserEmail ? this.currentUserEmail.charAt(0).toUpperCase() : 'U';
  }

  cambiarUsuario() {
    localStorage.setItem('redirectUrl', this.router.url);
    this.authService.logout();
  }

  irALogin() {
    localStorage.setItem('redirectUrl', this.router.url);
    this.router.navigate(['/login']);
  }

  irARegistro() {
    localStorage.setItem('redirectUrl', this.router.url);
    this.router.navigate(['/register']);
  }

  loadEjemplar() {
    this.http.get(`${this.apiUrl}/api/ejemplares/${this.id}`).subscribe({
      next: (res: any) => {
        this.ejemplar = res;
        if (res.libro?.id) {
          this.loadLibroDetails(res.libro.id);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el ejemplar', 'error');
      }
    });
  }

  loadLibroDetails(libroId: string) {
    this.http.get(`${this.apiUrl}/api/libros/${libroId}`).subscribe({
      next: (libro: any) => {
        this.libroCompleto = libro;
        if (libro.urlPortada) {
          if (libro.urlPortada.startsWith('http') || libro.urlPortada.startsWith('assets/') || libro.urlPortada.startsWith('/assets/')) {
            this.portadaUrl = libro.urlPortada;
          } else {
            this.portadaUrl = `${this.apiUrl}${libro.urlPortada.startsWith('/') ? '' : '/'}${libro.urlPortada}`;
          }
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getAutorNombre(): string {
    if (!this.libroCompleto?.autores || !Array.isArray(this.libroCompleto.autores) || this.libroCompleto.autores.length === 0) return '';
    return this.libroCompleto.autores.map((a: any) => a.nombre || a.nombreCompleto || a).filter(Boolean).join(', ');
  }

  onImgError(event: any) {
    event.target.src = 'assets/default-cover.svg';
  }

  seleccionarDias(dias: number) {
    this.diasPrestamo = dias;
  }

  getFechaDevolucionEstimada(): Date {
    const d = new Date();
    d.setDate(d.getDate() + (this.diasPrestamo || 7));
    return d;
  }

  confirmar() {
    const payload = this.authService.getPayload();
    const username = payload?.sub;

    if (!username) {
      Swal.fire('Error', 'Sesión expirada', 'error').then(() => this.router.navigate(['/login']));
      return;
    }

    this.submitting = true;
    const body = {
      ejemplarId: this.id,
      usuarioUsername: username,
      diasPrestamo: this.diasPrestamo || 7
    };

    this.http.post(`${this.apiUrl}/api/solicitudes/nueva`, body).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
      },
      error: (err) => {
        this.submitting = false;
        Swal.fire({
          title: 'No se pudo procesar',
          text: err.error?.message || 'Error interno del servidor',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    });
  }

  cancelar() {
    if (this.isUserLoggedIn) {
      const rol = this.authService.getRol();
      if (rol === 'ADMIN') {
        this.router.navigate(['/admin/libros']);
      } else {
        this.router.navigate(['/cliente/catalogo']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  cerrar() {
    this.router.navigate(['/cliente/prestamos']);
  }
}
