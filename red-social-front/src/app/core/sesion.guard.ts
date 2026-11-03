import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// [CICLO SESIÓN] Guards de ruta (se usan en app.routes.ts)

// Deja pasar solo si hay alguien logueado; si no, manda a /login
export const sesionGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return auth.usuarioActual() ? true : router.createUrlTree(['/login']);
};

// Deja pasar solo si NO hay sesión (login y registro); si ya hay, manda a /publicaciones
export const invitadoGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return auth.usuarioActual() ? router.createUrlTree(['/publicaciones']) : true;
};
