import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService, Usuario, UsuarioCreatePayload, UsuarioUpdatePayload } from '../../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  users: Usuario[] = [];
  loading = true;
  error: string | null = null;
  editingUser: Usuario | null = null;
  showUserForm = false;
  submittingUser = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
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
      id: 0,
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

    if (this.editingUser.id === 0) {
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
    return user.rol?.nombre || 'Sin rol';
  }
}
