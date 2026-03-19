import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-cliente-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteSidebarComponent {

  isSidebarCollapsed = false;

  menu = [
    { name: 'Mis Préstamos', path: '/cliente/prestamos', icon: 'bx-book-content' },
    { name: 'Catálogo', path: '/cliente/catalogo', icon: 'bx-library' },
    { name: 'Reservar Sala', path: '/cliente/salas', icon: 'bx-calendar-event' }
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
