import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as string[];

  
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  
  const hasRole = expectedRoles.some(role => auth.hasRole(role));

  return hasRole ? true : router.createUrlTree(['/not-authorized']);
};
