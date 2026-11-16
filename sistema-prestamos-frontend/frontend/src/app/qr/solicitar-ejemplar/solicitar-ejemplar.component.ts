import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-ejemplar',
  standalone: true,
  imports: [CommonModule],
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

    if (this.id) {
      this.loadEjemplar();
    } else {
      this.loading = false;
    }
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
      usuarioUsername: username
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
    this.router.navigate(['/']);
  }

  cerrar() {
    // Intentar cerrar la pestaña (funciona si se abrió mediante script o en ciertos navegadores móviles)
    window.close();
    // Fallback por si window.close() es bloqueado
    setTimeout(() => {
      this.router.navigate(['/cliente/prestamos']);
    }, 500);
  }
}
