import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// [CICLO ADMIN] Solo deja entrar si hay sesión y el perfil es administrador.
// Es una comodidad de la pantalla: la protección real está en el back (AdminGuard → 403)
export const adminGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return auth.usuarioActual()?.perfil === 'administrador'
        ? true
        : router.createUrlTree(['/publicaciones']);
};