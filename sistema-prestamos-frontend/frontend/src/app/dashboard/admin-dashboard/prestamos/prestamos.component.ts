import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { LoanService, Prestamo, PrestamoPayload } from '../../../services/loan.service';
import { UserService, Usuario } from '../../../services/user.service';
import { EjemplarService, Ejemplar } from '../../../services/ejemplar.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.scss']
})
export class PrestamosComponent implements OnInit {
  Math = Math;
  
  prestamos: Prestamo[] = [];
  users: Usuario[] = [];
  ejemplares: Ejemplar[] = [];
  
  loadingLoans = false;
  errorLoans: string | null = null;
  creatingLoan = false;
  showLoanForm = false;
  returningLoanId: number | null = null;
  
  selectedUserId: number | null = null;
  selectedEjemplarId: number | null = null;
  loanDays = 15;

  loanFilters = {
    usuario: '',
    libro: '',
    ejemplar: '',
    codigo: '',
    estado: '',
    soloConMulta: false
  };

  constructor(
    private loanService: LoanService,
    private userService: UserService,
    private ejemplarService: EjemplarService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadEjemplares();
    
    this.loanService.loans$.subscribe((list) => {
      if (list === null) return;
      this.prestamos = list;
      this.loadingLoans = false;
    });

    this.loanService.loadAll();
  }

  private loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  private loadEjemplares() {
    this.ejemplarService.getAll().subscribe({
      next: (ejemplares) => this.ejemplares = ejemplares,
      error: (err) => console.error('Error al cargar ejemplares:', err)
    });
  }

  get availableEjemplares(): Ejemplar[] {
    return this.ejemplares.filter((e) => e.disponible);
  }

  get filteredPrestamos(): Prestamo[] {
    return this.prestamos.filter(p => {
      const matchUsuario = !this.loanFilters.usuario || 
        p.usuario.nombre.toLowerCase().includes(this.loanFilters.usuario.toLowerCase());
      
      const matchLibro = !this.loanFilters.libro || 
        p.ejemplar.libro.titulo.toLowerCase().includes(this.loanFilters.libro.toLowerCase());

      const matchCodigo = !this.loanFilters.codigo ||
        p.ejemplar.codigo.toLowerCase().includes(this.loanFilters.codigo.toLowerCase());
      
      const matchEstado = !this.loanFilters.estado || 
        (this.loanFilters.estado === 'devuelto' ? p.devuelto : !p.devuelto);

      const matchMulta = !this.loanFilters.soloConMulta || 
        (p.multa && !p.multa.pagada);

      return matchUsuario && matchLibro && matchCodigo && matchEstado && matchMulta;
    });
  }

  createLoan() {
    if (!this.selectedUserId || !this.selectedEjemplarId) {
      Swal.fire('Atención', 'Selecciona usuario y ejemplar.', 'warning');
      return;
    }

    const today = this.formatDate(new Date());
    const dueDate = this.formatDate(this.addDays(new Date(), this.loanDays));
    const payload: PrestamoPayload = {
      usuarioId: Number(this.selectedUserId),
      ejemplarId: Number(this.selectedEjemplarId),
      usuario: { id: Number(this.selectedUserId) },
      ejemplar: { id: Number(this.selectedEjemplarId) },
      fechaPrestamo: today,
      fechaDevolucion: dueDate,
      devuelto: false
    };

    this.creatingLoan = true;
    this.loanService.create(payload)
      .pipe(finalize(() => (this.creatingLoan = false)))
      .subscribe({
        next: () => {
          this.selectedUserId = null;
          this.selectedEjemplarId = null;
          this.showLoanForm = false;
          this.loadEjemplares();
          Swal.fire('¡Registrado!', 'Préstamo registrado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error al crear préstamo:', err);
          Swal.fire('Error', 'No se pudo registrar el préstamo', 'error');
        }
      });
  }

  markAsReturned(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Marcar como devuelto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.returningLoanId = prestamo.id;
        this.loanService.returnLoan(prestamo.id)
          .pipe(finalize(() => (this.returningLoanId = null)))
          .subscribe({
            next: () => {
              this.loanService.loadAll();
              this.loadEjemplares();
              Swal.fire('¡Devuelto!', 'Préstamo marcado como devuelto', 'success');
            },
            error: (err) => {
              console.error('Error al devolver préstamo:', err);
              Swal.fire('Error', 'No se pudo procesar la devolución', 'error');
            }
          });
      }
    });
  }

  payFine(prestamo: Prestamo) {
    if (!prestamo.multa) return;
    Swal.fire({
      title: '¿Confirmar cobro?',
      text: `¿Cobrar multa de $${prestamo.multa.total.toLocaleString()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cobrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loanService.payFine(prestamo).subscribe({
          next: () => {
            Swal.fire('¡Cobrada!', 'La multa ha sido pagada.', 'success');
            this.loanService.loadAll();
          }
        });
      }
    });
  }

  deleteLoan(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Eliminar préstamo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loanService.delete(prestamo.id).subscribe({
          next: () => {
            this.loanService.loadAll();
            this.loadEjemplares();
            Swal.fire('Eliminado', 'Préstamo eliminado correctamente', 'success');
          }
        });
      }
    });
  }

  getDaysRemaining(p: Prestamo): number {
    if (p.devuelto) return 0;
    const today = new Date();
    const devolucion = new Date(p.fechaDevolucion);
    const diffTime = devolucion.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  hasOverdue(p: Prestamo): boolean {
    if (p.devuelto) return false;
    return this.getDaysRemaining(p) < 0;
  }

  getFine(p: Prestamo): number {
    if (p.multa) return p.multa.total;
    if (!p.devuelto) {
      const days = this.getDaysRemaining(p);
      if (days < 0) return Math.abs(days) * 2000;
    }
    return 0;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
