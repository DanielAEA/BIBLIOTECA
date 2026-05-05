import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  
  const isFormData = req.body instanceof FormData;
  const headers: any = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const cloned = req.clone({ setHeaders: headers });

  
  console.log(`🌐 ${req.method} ${req.url}`, token ? '🔐 Con token' : '⚠️ Sin token');

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 404 && (error.url?.endsWith('/') && !error.url?.includes('/api/'))) {
        console.warn('⚠️ El backend no tiene un endpoint para la ruta raíz. Esto es normal.');
        return throwError(() => error);
      }

      
      if (error.status === 0) {
        console.error('❌ Error de conexión: No se pudo conectar al backend');
        console.error('💡 Verifica que el backend esté corriendo y accesible');
      } else if (error.status >= 500) {
        console.error(`❌ Error del servidor (${error.status}):`, error.message);
      } else if (error.status === 401 || error.status === 403) {
        console.warn(`🔒 Error de autenticación/autorización (${error.status})`);
      }

      return throwError(() => error);
    })
  );
};
