import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { UserService, Usuario, UsuarioCreatePayload, UsuarioUpdatePayload } from '../../../services/user.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, OnDestroy {

  users: Usuario[] = [];
  loading = true;
  error: string | null = null;
  editingUser: Usuario | null = null;
  showUserForm = false;
  submittingUser = false;

  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  searchTerm: string = '';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const qPage = params['page'] !== undefined ? Math.max(0, parseInt(params['page'], 10) || 0) : 0;
      const qSize = params['size'] !== undefined ? Math.max(1, parseInt(params['size'], 10) || 10) : 10;
      const qSearch = params['search'] || '';

      this.page = qPage;
      this.size = qSize;
      this.searchTerm = qSearch;

      this.loadUsers();
    });

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.page = 0;
      this.searchTerm = term;
      this.updateQueryParams();
    });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  onSearchInput(value: string) {
    this.searchSubject.next(value);
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
        search: this.searchTerm ? this.searchTerm : null
      },
      queryParamsHandling: 'merge'
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    this.userService.getUsersPaginated(this.page, this.size, this.searchTerm).subscribe({
      next: (response) => {
        this.users = response.content || [];
        this.page = response.page;
        this.size = response.size;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'No se pudieron cargar los usuarios.';
        this.loading = false;
      }
    });
  }

  createUser() {
    this.editingUser = {
      id: '',
      nombre: '',
      correo: '',
      password: '',
      rol: undefined
    };
    this.showUserForm = true;
  }

  editUser(user: Usuario) {
    this.editingUser = { ...user, password: '' };
    this.showUserForm = true;
  }

  cancelUserForm() {
    this.editingUser = null;
    this.showUserForm = false;
  }

  saveUser() {
    if (!this.editingUser) return;

    if (!this.editingUser.nombre?.trim() || !this.editingUser.correo?.trim()) {
      Swal.fire('Atención', 'Nombre y correo son obligatorios.', 'warning');
      return;
    }

    this.submittingUser = true;

    if (!this.editingUser.id) {
      if (!this.editingUser.password?.trim()) {
        Swal.fire('Atención', 'La contraseña es obligatoria.', 'warning');
        this.submittingUser = false;
        return;
      }

      const payload: UsuarioCreatePayload = {
        nombre: this.editingUser.nombre.trim(),
        correo: this.editingUser.correo.trim(),
        password: this.editingUser.password.trim()
      };

      this.userService.createUser(payload)
        .pipe(finalize(() => this.submittingUser = false))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.cancelUserForm();
            Swal.fire('¡Creado!', 'Usuario creado correctamente', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err?.error?.message || 'Error al crear usuario', 'error');
          }
        });
    } else {
      const payload: UsuarioUpdatePayload = {
        nombre: this.editingUser.nombre.trim(),
        correo: this.editingUser.correo.trim()
      };
      if (this.editingUser.password?.trim()) {
        payload.password = this.editingUser.password.trim();
      }

      this.userService.updateUser(this.editingUser.id, payload)
        .pipe(finalize(() => this.submittingUser = false))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.cancelUserForm();
            Swal.fire('¡Actualizado!', 'Usuario actualizado correctamente', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err?.error?.message || 'Error al actualizar usuario', 'error');
          }
        });
    }
  }

  deleteUser(user: Usuario) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar al usuario ${user.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire('¡Eliminado!', 'Usuario eliminado.', 'success');
          }
        });
      }
    });
  }

  getRoleName(user: Usuario): string {
    return user.rol || 'Sin rol';
  }
}
