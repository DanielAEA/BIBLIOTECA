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
    { name: 'Panel de Administración', path: '/admin/settings' },
    { name: 'Estadísticas', path: '/admin/statistics' },
    { name: 'Libros', path: '/admin/books' },
    { name: 'Autores', path: '/admin/authors' },
    { name: 'Editoriales', path: '/admin/editorials' },
    { name: 'Géneros', path: '/admin/genres' },
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
