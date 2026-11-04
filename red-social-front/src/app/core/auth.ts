import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from './api';
import type { DatosLogin, RespuestaLogin, UsuarioSesion } from './models/usuario.model';

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);
    private readonly clave = 'usuario';
    private readonly claveToken = 'token';

    // null = invitado; con valor = hay alguien logueado
    readonly usuarioActual = signal<UsuarioSesion | null>(this.leerGuardado());

    // [CICLO LOGIN · paso 2/6] prepara el POST a /auth/login y le agrega el pipe tap() para guardar la sesión (usuario + token) en localStorage.
    login(datos: DatosLogin) {
        return this.http.post<RespuestaLogin>(`${API_URL}/auth/login`, datos).pipe(
            tap((respuesta) => {
                this.usuarioActual.set(respuesta.usuario);
                try {
                    localStorage.setItem(this.clave, JSON.stringify(respuesta.usuario));
                    localStorage.setItem(this.claveToken, respuesta.token);
                } catch {
                    // si localStorage no está disponible, la sesión dura solo hasta recargar
                }
            }),
        );
    }

    // [CICLO REGISTRO · paso 2/6] Prepara el POST a /auth/registro con el FormData (texto + foto).
    // No se envía hasta el subscribe de registro.ts. No ponemos Content-Type: el navegador lo arma solo para FormData
    registro(datos: FormData) {
        return this.http.post(`${API_URL}/auth/registro`, datos);
    }

    cerrarSesion() {
        this.usuarioActual.set(null);
        try {
            localStorage.removeItem(this.clave);
            localStorage.removeItem(this.claveToken);
        } catch {
            // si localStorage no está disponible no hay nada que borrar
        }
    }

    // Lo usa token.interceptor.ts para agregar el token a cada pedido
    obtenerToken(): string | null {
        try {
            return localStorage.getItem(this.claveToken);
        } catch {
            return null;
        }
    }

    // Al iniciar la app recupera el usuario guardado (así F5 no cierra la sesión)
    private leerGuardado(): UsuarioSesion | null {
        try {
            const guardado = localStorage.getItem(this.clave);
            return guardado ? JSON.parse(guardado) : null;
        } catch {
            return null;
        }
    }
}
