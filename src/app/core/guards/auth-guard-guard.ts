import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Token } from '../auth/token';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(Token);
  let podeAcessar = true;
  tokenService.isAuthenticated().then((isAuth) => {
    if (!isAuth)
      podeAcessar = false;
  })  
  return podeAcessar;
};
