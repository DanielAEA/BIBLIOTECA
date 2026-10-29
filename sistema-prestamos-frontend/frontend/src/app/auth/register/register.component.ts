import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SocialAuthService } from '../../services/social-auth.service';
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
  socialLoading: boolean = false;
  socialProvider: 'google' | 'microsoft' | null = null;
  error: string | null = null;
  success: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
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

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Error al registrar usuario. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    if (this.loading || this.socialLoading) return;
    this.socialLoading = true;
    this.socialProvider = 'google';
    this.error = null;

    try {
      const idToken = await this.socialAuthService.loginWithGoogle();
      this.authService.loginGoogle(idToken).subscribe({
        next: () => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.handleSocialSuccess();
        },
        error: (err) => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.error = err.error?.error || 'No se pudo registrar/iniciar sesión con Google.';
        }
      });
    } catch (err: any) {
      this.socialLoading = false;
      this.socialProvider = null;
      this.error = err.message || 'Error al conectar con Google.';
    }
  }

  async signInWithMicrosoft(): Promise<void> {
    if (this.loading || this.socialLoading) return;
    this.socialLoading = true;
    this.socialProvider = 'microsoft';
    this.error = null;

    try {
      const idToken = await this.socialAuthService.loginWithMicrosoft();
      this.authService.loginMicrosoft(idToken).subscribe({
        next: () => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.handleSocialSuccess();
        },
        error: (err) => {
          this.socialLoading = false;
          this.socialProvider = null;
          this.error = err.error?.error || 'No se pudo registrar/iniciar sesión con Microsoft.';
        }
      });
    } catch (err: any) {
      this.socialLoading = false;
      this.socialProvider = null;
      this.error = err.message || 'Error al conectar con Microsoft.';
    }
  }

  private handleSocialSuccess(): void {
    const payload = this.authService.getPayload();
    if (!payload) return;

    const roles = payload.roles ?? payload.authorities ?? [];
    const role = roles[0];

    if (role === 'ADMIN') {
      this.router.navigateByUrl('/admin');
    } else {
      this.router.navigateByUrl('/cliente');
    }
  }
}
