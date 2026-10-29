import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, forkJoin, finalize } from 'rxjs';
import { LoanService, Prestamo, PrestamoPayload } from '../../../services/loan.service';
import { UserService, Usuario } from '../../../services/user.service';
import { EjemplarService, Ejemplar } from '../../../services/ejemplar.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.scss']
})
export class PrestamosComponent implements OnInit, OnDestroy {
  Math = Math;
  
  prestamos: Prestamo[] = [];
  selectedLoanIds = new Set<string>();
  users: Usuario[] = [];
  ejemplares: Ejemplar[] = [];
  
  loadingLoans = false;
  errorLoans: string | null = null;
  creatingLoan = false;
  showLoanForm = false;
  returningLoanId: string | null = null;
  
  selectedUserId: string | null = null;
  selectedEjemplarId: string | null = null;
  loanDays = 15;

  page: number = 0;
  size: number = 10;
  totalElements: number = 0;

  loanFilters = {
    usuario: '',
    libro: '',
    codigo: '',
    estado: '',
    soloConMulta: false
  };

  private textFilterSubject = new Subject<void>();
  private textFilterSub?: Subscription;

  constructor(
    private loanService: LoanService,
    private userService: UserService,
    private ejemplarService: EjemplarService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadEjemplares();

    this.route.queryParams.subscribe(params => {
      this.page = params['page'] !== undefined ? Math.max(0, parseInt(params['page'], 10) || 0) : 0;
      this.size = params['size'] !== undefined ? Math.max(1, parseInt(params['size'], 10) || 10) : 10;
      this.loanFilters.usuario = params['usuario'] || '';
      this.loanFilters.libro = params['libro'] || '';
      this.loanFilters.codigo = params['codigo'] || '';
      this.loanFilters.estado = params['estado'] || '';
      this.loanFilters.soloConMulta = params['soloConMulta'] === 'true';

      this.fetchLoans();
    });

    this.textFilterSub = this.textFilterSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.page = 0;
      this.updateQueryParams();
    });
  }

  ngOnDestroy() {
    this.textFilterSub?.unsubscribe();
  }

  onFilterTextInput() {
    this.textFilterSubject.next();
  }

  onFilterChange() {
    this.page = 0;
    this.updateQueryParams();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.updateQueryParams();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.updateQueryParams();
  }

  private updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
        size: this.size,
        usuario: this.loanFilters.usuario ? this.loanFilters.usuario : null,
        libro: this.loanFilters.libro ? this.loanFilters.libro : null,
        codigo: this.loanFilters.codigo ? this.loanFilters.codigo : null,
        estado: this.loanFilters.estado ? this.loanFilters.estado : null,
        soloConMulta: this.loanFilters.soloConMulta ? 'true' : null
      },
      queryParamsHandling: 'merge'
    });
  }

  fetchLoans() {
    this.loadingLoans = true;
    this.errorLoans = null;
    this.loanService.getLoansPaginated(this.page, this.size, this.loanFilters).subscribe({
      next: (response) => {
        this.prestamos = response.content || [];
        this.page = response.page;
        this.size = response.size;
        this.totalElements = response.totalElements;
        this.loadingLoans = false;
      },
      error: (err) => {
        console.error('Error al cargar préstamos:', err);
        this.errorLoans = 'No se pudieron cargar los préstamos.';
        this.loadingLoans = false;
      }
    });
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

  createLoan() {
    if (!this.selectedUserId || !this.selectedEjemplarId) {
      Swal.fire('Atención', 'Selecciona usuario y ejemplar.', 'warning');
      return;
    }

    const today = this.formatDate(new Date());
    const dueDate = this.formatDate(this.addDays(new Date(), this.loanDays));
    
    const selectedEjemplar = this.ejemplares.find(e => e.id === this.selectedEjemplarId);
    
    const payload: PrestamoPayload = {
      usuarioId: this.selectedUserId,
      libroId: selectedEjemplar?.libro?.id,
      ejemplarCodigo: selectedEjemplar?.codigo,
      fechaPrestamo: today,
      fechaDevolucion: dueDate,
      devuelto: false
    };

    this.creatingLoan = true;
    this.loanService.create(payload).subscribe({
      next: () => {
        this.creatingLoan = false;
        this.showLoanForm = false;
        this.selectedUserId = null;
        this.selectedEjemplarId = null;
        this.fetchLoans();
        this.loadEjemplares();
        Swal.fire('¡Éxito!', 'Préstamo registrado correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error al registrar préstamo:', err);
        this.creatingLoan = false;
        Swal.fire('Error', 'No se pudo registrar el préstamo.', 'error');
      }
    });
  }

  markAsReturned(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Confirmar devolución?',
      text: `¿El ejemplar ${prestamo.ejemplarCodigo} fue devuelto?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.returningLoanId = prestamo.id;
        this.loanService.returnLoan(prestamo.id).subscribe({
          next: () => {
            this.returningLoanId = null;
            this.fetchLoans();
            this.loadEjemplares();
            Swal.fire('¡Devuelto!', 'El libro ha sido marcado como devuelto.', 'success');
          },
          error: (err) => {
            console.error('Error al devolver libro:', err);
            this.returningLoanId = null;
            Swal.fire('Error', 'No se pudo procesar la devolución.', 'error');
          }
        });
      }
    });
  }

  deleteLoan(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loanService.delete(prestamo.id).subscribe({
          next: () => {
            this.selectedLoanIds.delete(prestamo.id);
            this.fetchLoans();
            Swal.fire('Eliminado', 'El préstamo ha sido eliminado.', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar préstamo:', err);
            Swal.fire('Error', 'No se pudo eliminar el préstamo.', 'error');
          }
        });
      }
    });
  }

  toggleSelection(id: string) {
    if (this.selectedLoanIds.has(id)) {
      this.selectedLoanIds.delete(id);
    } else {
      this.selectedLoanIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.prestamos.forEach(p => this.selectedLoanIds.add(p.id));
    } else {
      this.selectedLoanIds.clear();
    }
  }

  isAllSelected(): boolean {
    return this.prestamos.length > 0 && this.prestamos.every(p => this.selectedLoanIds.has(p.id));
  }

  deleteSelectedLoans() {
    const count = this.selectedLoanIds.size;
    if (count === 0) return;

    Swal.fire({
      title: '¿Eliminar seleccionados?',
      text: `Se eliminarán ${count} préstamo(s) seleccionado(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingLoans = true;
        const requests = Array.from(this.selectedLoanIds).map(id => this.loanService.delete(id));
        forkJoin(requests).pipe(finalize(() => this.loadingLoans = false)).subscribe({
          next: () => {
            this.selectedLoanIds.clear();
            this.fetchLoans();
            Swal.fire('¡Eliminados!', `${count} préstamo(s) eliminado(s) correctamente.`, 'success');
          },
          error: (err) => {
            console.error('Error deleting loans:', err);
            this.selectedLoanIds.clear();
            this.fetchLoans();
            Swal.fire('Error', 'Ocurrió un problema al eliminar algunos préstamos.', 'error');
          }
        });
      }
    });
  }

  acceptLoan(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Aceptar solicitud?',
      text: '¿Deseas aceptar esta solicitud de préstamo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loanService.acceptLoan(prestamo.id).subscribe({
          next: () => {
            this.fetchLoans();
            Swal.fire('¡Aceptado!', 'La solicitud ha sido aceptada.', 'success');
          },
          error: (err) => {
            console.error('Error al aceptar solicitud:', err);
            Swal.fire('Error', 'No se pudo aceptar la solicitud.', 'error');
          }
        });
      }
    });
  }

  rejectLoan(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Rechazar solicitud?',
      text: '¿Deseas rechazar esta solicitud de préstamo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loanService.rejectLoan(prestamo.id).subscribe({
          next: () => {
            this.fetchLoans();
            Swal.fire('Rechazado', 'La solicitud ha sido rechazada.', 'success');
          },
          error: (err) => {
            console.error('Error al rechazar solicitud:', err);
            Swal.fire('Error', 'No se pudo rechazar la solicitud.', 'error');
          }
        });
      }
    });
  }

  payFine(prestamo: Prestamo) {
    Swal.fire({
      title: '¿Registrar cobro de multa?',
      text: '¿Deseas registrar el pago de la multa de este préstamo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, pagar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loanService.payFine(prestamo).subscribe({
          next: () => {
            this.fetchLoans();
            Swal.fire('¡Pagado!', 'La multa ha sido registrada como pagada.', 'success');
          },
          error: (err) => {
            console.error('Error al registrar cobro de multa:', err);
            Swal.fire('Error', 'No se pudo registrar el pago.', 'error');
          }
        });
      }
    });
  }

  calculateDaysRemaining(fechaDevolucion: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dev = new Date(fechaDevolucion); dev.setHours(0, 0, 0, 0);
    return Math.ceil((dev.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysRemaining(p: Prestamo): number {
    return p.devuelto ? 0 : this.calculateDaysRemaining(p.fechaDevolucion);
  }

  getFine(p: Prestamo): number {
    if (p.multa) {
      return p.multa.pagada ? 0 : p.multa.total;
    }
    if (!p.devuelto) {
      const dias = this.calculateDaysRemaining(p.fechaDevolucion);
      return dias < 0 ? Math.abs(dias) * 2000 : 0;
    }
    return 0;
  }

  hasOverdue(p: Prestamo): boolean {
    return !p.devuelto && this.calculateDaysRemaining(p.fechaDevolucion) < 0;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
