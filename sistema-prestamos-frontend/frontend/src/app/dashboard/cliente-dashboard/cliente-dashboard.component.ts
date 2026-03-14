import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteDashboardComponent {

  menu = [
    { name: 'Mis Préstamos', path: '/cliente/prestamos' },
    { name: 'Catálogo', path: '/cliente/catalogo' },
    { name: 'Reservar Sala', path: '/cliente/salas' }
  ];

  constructor(private router: Router, private authService: AuthService) { }

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
