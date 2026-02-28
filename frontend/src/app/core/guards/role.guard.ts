import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const user = tokenService.getUser();
  const allowedRoles = route.data['roles'] as string[];

  if (!user) {
    router.navigate(['/events']);
    return false;
  }

  if (!allowedRoles || !allowedRoles.includes(user.role)) {
    router.navigate(['/events']);
    return false;
  }

  return true;
};