import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SocialAuthService } from '../../services/social-auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {

  @ViewChild('emailInput') emailInput?: ElementRef<HTMLInputElement>;

  loginForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;
  loading: boolean = false;
  socialLoading: boolean = false;
  socialProvider: 'google' | 'microsoft' | null = null;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.emailInput?.nativeElement?.focus();
    }, 150);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.showError = false;

    const { username, password } = this.loginForm.value;

    this.authService.login(username.trim(), password).subscribe({
      next: () => {
        this.loading = false;
        this.handleLoginSuccess();
      },
      error: (err) => {
        this.loading = false;
        let mensaje = 'Correo o contraseña incorrectos';
        if (err.error?.error) {
          mensaje = err.error.error;
        } else if (err.status === 0) {
          mensaje = 'No se pudo conectar al servidor';
        } else if (err.status === 404) {
          mensaje = 'Servicio no disponible';
        } else if (err.status >= 500) {
          mensaje = 'Error del servidor. Intenta más tarde';
        }
        this.errorMessage = mensaje;
        this.showError = true;
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    if (this.loading || this.socialLoading) return;
    this.socialLoading = true;
    this.socialProvider = 'google';
    this.errorMessage = '';
    this.showError = false;

    try {
      const idToken = await this.socialAuthService.loginWithGoogle();
      this.authService.loginGoogle(idToken).subscribe({
        next: () => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.handleLoginSuccess();
        },
        error: (err) => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.errorMessage = err.error?.error || 'No se pudo iniciar sesión con Google.';
          this.showError = true;
        }
      });
    } catch (err: any) {
      this.socialLoading = false;
      this.socialProvider = null;
      this.errorMessage = err.message || 'Error al conectar con Google.';
      this.showError = true;
    }
  }

  async signInWithMicrosoft(): Promise<void> {
    if (this.loading || this.socialLoading) return;
    this.socialLoading = true;
    this.socialProvider = 'microsoft';
    this.errorMessage = '';
    this.showError = false;

    try {
      const idToken = await this.socialAuthService.loginWithMicrosoft();
      this.authService.loginMicrosoft(idToken).subscribe({
        next: () => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.handleLoginSuccess();
        },
        error: (err) => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.errorMessage = err.error?.error || 'No se pudo iniciar sesión con Microsoft.';
          this.showError = true;
        }
      });
    } catch (err: any) {
      this.socialLoading = false;
      this.socialProvider = null;
      this.errorMessage = err.message || 'Error al conectar con Microsoft.';
      this.showError = true;
    }
  }

  private handleLoginSuccess(): void {
    const payload = this.authService.getPayload();
    if (!payload) return;

    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigateByUrl(redirectUrl);
      return;
    }

    const roles = payload.roles ?? payload.authorities ?? [];
    const role = roles[0];

    if (role === 'ADMIN') {
      this.router.navigateByUrl('/admin');
    } else {
      this.router.navigateByUrl('/cliente');
    }
  }
}
