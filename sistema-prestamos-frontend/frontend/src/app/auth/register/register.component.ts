import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit {

  @ViewChild('nombreInput') nombreInput?: ElementRef<HTMLInputElement>;

  registerForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  success: boolean = false;
  showPassword: boolean = false;
  isPrestamoRedirect: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    const redirectUrl = localStorage.getItem('redirectUrl');
    this.isPrestamoRedirect = !!(redirectUrl && redirectUrl.includes('solicitar-ejemplar'));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nombreInput?.nativeElement?.focus();
    }, 150);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const correo = this.registerForm.value.correo;
    const password = this.registerForm.value.password;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        
        // Si viene desde un préstamo QR, auto-iniciar sesión y volver directamente al libro
        if (this.isPrestamoRedirect) {
          this.authService.login(correo, password).subscribe({
            next: () => {
              const redirectUrl = localStorage.getItem('redirectUrl');
              if (redirectUrl) {
                localStorage.removeItem('redirectUrl');
                this.router.navigateByUrl(redirectUrl);
              } else {
                this.router.navigate(['/cliente/prestamos']);
              }
            },
            error: () => {
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1800);
            }
          });
        } else {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Error al registrar usuario. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}
