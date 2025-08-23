import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  // if (token) {
  //   return true;
  // }
  // router.navigate(['/']);
  // return false;
  return true;
};
