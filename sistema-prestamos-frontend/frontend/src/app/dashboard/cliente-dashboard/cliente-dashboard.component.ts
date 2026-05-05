import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-cliente-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.scss']
})
export class ClienteSidebarComponent implements OnInit {

  isSidebarCollapsed = false;

  menu = [
    { name: 'Mis Préstamos', path: '/cliente/prestamos', icon: 'bx-book-content' },
    { name: 'Catálogo', path: '/cliente/catalogo', icon: 'bx-library' },
    { name: 'Reservar Sala', path: '/cliente/salas', icon: 'bx-calendar-event' }
  ];

  constructor(
    private router: Router, 
    private authService: AuthService,
    public themeService: ThemeService,
    private loanService: LoanService
  ) { }

  ngOnInit() {
    this.checkDebtsAndAlert();
  }

  checkDebtsAndAlert() {
    const payload = this.authService.getPayload();
    if (!payload) return;
    const userId = payload.id || payload.sub;
    
    this.loanService.getByUserId(userId).subscribe({
      next: (prestamos) => {
        let totalMulta = 0;
        let mensajes: string[] = [];
        const today = new Date(); today.setHours(0,0,0,0);
        
        prestamos.forEach(p => {
          let multaPrueba = 0;
          if (p.multa && !p.multa.pagada) {
            multaPrueba = p.multa.total;
          }
          
          if (!p.devuelto) {
            const dev = new Date(p.fechaDevolucion); dev.setHours(0,0,0,0);
            const dias = Math.ceil((dev.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (dias < 0) {
              const titulo = p.libro?.titulo || 'Libro';
              mensajes.push(`- "${titulo}" (Vencido hace ${Math.abs(dias)} días)`);
              if (!p.multa) { 
                multaPrueba = Math.abs(dias) * 2000;
              }
            }
          }
          totalMulta += multaPrueba;
        });
        
        if (mensajes.length > 0 || totalMulta > 0) {
          import('sweetalert2').then(Swal => {
            let texto = mensajes.length > 0 ? "Tienes libros pendientes por devolver:\n" + mensajes.join('\n') : "";
            if (totalMulta > 0) {
               texto += `\n\nDeuda actual en sistema: $${totalMulta.toLocaleString()}`;
            }
            Swal.default.fire({
              title: 'Aviso de CiberBook',
              text: texto,
              icon: 'warning',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#10b981'
            });
          });
        }
      },
      error: (err) => console.error("Error cargando deudas", err)
    });
  }

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
