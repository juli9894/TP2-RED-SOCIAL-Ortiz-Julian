import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const sesionGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return auth.usuarioActual() ? true : router.createUrlTree(['/login']);
};

export const invitadoGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return auth.usuarioActual() ? router.createUrlTree(['/publicaciones']) : true;
};