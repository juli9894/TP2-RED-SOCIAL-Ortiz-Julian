import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api';
import { Auth } from './auth';

// [CICLO SESIÓN] 
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
    const auth = inject(Auth);
    const router = inject(Router);

    const token = auth.obtenerToken();

    if (!token || !peticion.url.startsWith(API_URL)) {
        return siguiente(peticion);//auth.controller
    }

    const conToken = peticion.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
    });

    return siguiente(conToken).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !peticion.url.includes('/auth/')) {
                auth.cerrarSesion();
                router.navigate(['/login']);
            }
            return throwError(() => error); 
        }),
    );
};