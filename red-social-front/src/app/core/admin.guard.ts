import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// [CICLO ADMIN] 
export const adminGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return auth.usuarioActual()?.perfil === 'administrador'
        ? true
        : router.createUrlTree(['/publicaciones']);
};