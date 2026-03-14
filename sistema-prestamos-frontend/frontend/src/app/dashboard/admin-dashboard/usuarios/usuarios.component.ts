import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, Usuario } from '../../../services/user.service';
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
  showEditForm = false;

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
        this.error = 'No se pudieron cargar los usuarios. Verifica que el backend esté corriendo.';
        this.loading = false;
      }
    });
  }

  editUser(user: Usuario) {
    this.editingUser = { ...user };
    this.showEditForm = true;
  }

  cancelEdit() {
    this.editingUser = null;
    this.showEditForm = false;
  }

  saveUser() {
    if (!this.editingUser) return;

    this.userService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: () => {
        this.loadUsers();
        this.cancelEdit();
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Usuario actualizado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
      }
    });
  }

  deleteUser(user: Usuario) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar al usuario ${user.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }

  getRoleName(user: Usuario): string {
    return user.rol?.nombre || 'Sin rol';
  }

}
