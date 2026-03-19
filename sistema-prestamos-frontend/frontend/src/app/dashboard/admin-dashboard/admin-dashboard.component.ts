import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminSidebarComponent {

  isSidebarCollapsed = false;

  menu = [
    { name: 'Estadísticas', path: '/admin/estadisticas', icon: 'bx-pie-chart-alt-2' },
    { name: 'Préstamos', path: '/admin/prestamos', icon: 'bx-transfer' },
    { name: 'Usuarios', path: '/admin/usuarios', icon: 'bx-group' },
    { name: 'Libros', path: '/admin/libros', icon: 'bx-book' },
    { name: 'Autores', path: '/admin/autores', icon: 'bx-user-pin' },
    { name: 'Editoriales', path: '/admin/editoriales', icon: 'bx-buildings' },
    { name: 'Géneros', path: '/admin/generos', icon: 'bx-purchase-tag' },
    { name: 'Ejemplares', path: '/admin/ejemplares', icon: 'bx-copy' },
    { name: 'Reseñas', path: '/admin/resenas', icon: 'bx-star' },
    { name: 'Salas', path: '/admin/salas', icon: 'bx-door-open' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService
  ) { }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
