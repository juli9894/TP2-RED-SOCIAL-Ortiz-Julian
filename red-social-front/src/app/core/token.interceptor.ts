import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from './api';
import { Auth } from './auth';

export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
    //obtengo el token del localStorage
    const token = inject(Auth).obtenerToken();

    //se lo envio al backend, si hay token y la url es del backend, sino lo dejo pasar
    if (!token || !peticion.url.startsWith(API_URL)) {
        return siguiente(peticion);
    }

    //se hace copia con el token en la cabecera Authorization, para que el backend pueda verificarlo y autenticar al usuario
    const conToken = peticion.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
    });

    //viaja hacia la red
    return siguiente(conToken);
};