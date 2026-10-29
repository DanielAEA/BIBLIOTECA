import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar.component.html',
  styleUrls: ['./solicitar.component.scss']
})
export class SolicitarComponent implements OnInit {
  id: string | null = null;
  libro: any = null;
  loading = true;
  submitting = false;
  success = false;
  hasStock = false;
  portadaUrl = 'assets/img/no-cover.png';
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
      this.loadLibro();
    } else {
      this.loading = false;
    }
  }

  loadLibro() {
    this.http.get(`${this.apiUrl}/api/libros/${this.id}`).subscribe({
      next: (res: any) => {
        this.libro = res;
        this.hasStock = res.stock > 0;
        if (res.urlPortada) {
          this.portadaUrl = res.urlPortada.startsWith('http') 
            ? res.urlPortada 
            : `${this.apiUrl}${res.urlPortada}`;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el libro', 'error');
      }
    });
  }

  onImgError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x450?text=CiberBook';
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
      libroId: this.id,
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
          title: 'Error en la solicitud',
          text: err.error?.message || 'No se pudo procesar tu pedido',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }

  cancelar() {
    this.router.navigate(['/']);
  }

  cerrar() {
    window.close();
    setTimeout(() => {
      this.router.navigate(['/cliente/prestamos']);
    }, 500);
  }
}
