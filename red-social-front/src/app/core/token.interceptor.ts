import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api';
import { Auth } from './auth';

// [CICLO SESIÓN] Se ejecuta antes de CADA petición HTTP (registrado en app.config.ts).
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
    const auth = inject(Auth);
    const router = inject(Router);
    const token = auth.obtenerToken();

    // 2.Registro y Login, o peticiones a otros dominios, no necesitan el token
    if (!token || !peticion.url.startsWith(API_URL)) {
        return siguiente(peticion);
    }

    // 3. Copia de la petición con el token, para que el back (AuthGuard) pueda autenticar al usuario
    const conToken = peticion.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
    });

    // 4. Viaja hacia la red. Si la respuesta vuelve con 401 (token vencido o inválido),
    // se cierra la sesión y se va al login. Las rutas /auth/ manejan su propio error
    return siguiente(conToken).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !peticion.url.includes('/auth/')) {
                auth.cerrarSesion();
                router.navigate(['/login']);
            }
            return throwError(() => error); // el error sigue su camino hacia quien hizo el pedido
        }),
    );
};