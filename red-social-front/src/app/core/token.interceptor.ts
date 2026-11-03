import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from './api';
import { Auth } from './auth';

// [CICLO SESIÓN] Se ejecuta antes de CADA petición HTTP (registrado en app.config.ts).
// Si hay token y la URL es del back, agrega la cabecera Authorization: Bearer <token>
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
    // 1. Obtengo el token del localStorage
    const token = inject(Auth).obtenerToken();

    // 2. Si no hay token o la URL no es de nuestro back, la dejo pasar sin tocarla
    if (!token || !peticion.url.startsWith(API_URL)) {
        return siguiente(peticion);
    }

    // 3. Copia de la petición con el token, para que el back (AuthGuard) pueda autenticar al usuario
    const conToken = peticion.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
    });

    // 4. Viaja hacia la red
    return siguiente(conToken);
};
