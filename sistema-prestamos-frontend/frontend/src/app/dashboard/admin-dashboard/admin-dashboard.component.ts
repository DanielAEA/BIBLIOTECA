import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {

  menu = [
    { name: 'Panel de Administración', path: '/admin/configuracion' },
    { name: 'Estadísticas', path: '/admin/estadisticas' },
    { name: 'Usuarios', path: '/admin/usuarios' },
    { name: 'Libros', path: '/admin/libros' },
    { name: 'Autores', path: '/admin/autores' },
    { name: 'Editoriales', path: '/admin/editoriales' },
    { name: 'Géneros', path: '/admin/generos' },
    { name: 'Ejemplares', path: '/admin/ejemplares' },
    { name: 'Reseñas', path: '/admin/resenas' },
    { name: 'Salas', path: '/admin/salas' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService
  ) { }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  logout() {
    this.authService.logout();
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }
}
