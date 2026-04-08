import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        const payload = this.authService.getPayload();
        if (!payload) {
          return;
        }

        const roles = payload.roles ?? payload.authorities ?? [];
        const role = roles[0];

        if (role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/cliente');
        }
      },
      error: (err) => {
        let mensaje = 'Credenciales incorrectas';
        if (err.status === 0) {
          mensaje = 'No se pudo conectar al servidor';
        } else if (err.status === 401) {
          mensaje = 'Usuario o contraseña incorrectos';
        } else if (err.status === 404) {
          mensaje = 'Servicio no disponible';
        } else if (err.status >= 500) {
          mensaje = 'Error del servidor. Intenta más tarde';
        }
        this.errorMessage = mensaje;
        this.showError = true;

        setTimeout(() => {
          this.showError = false;
          setTimeout(() => this.errorMessage = '', 400);
        }, 5000);
      }
    });
  }
}
