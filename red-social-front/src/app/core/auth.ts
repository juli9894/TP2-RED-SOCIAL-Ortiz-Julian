import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './api';
import { AVISO_SESION_ANTES_MS } from './constantes';
import type { DatosLogin, RespuestaLogin, UsuarioSesion } from './models/usuario.model';

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly clave = 'usuario';
    private readonly claveToken = 'token';

    readonly usuarioActual = signal<UsuarioSesion | null>(this.leerGuardado());
    readonly avisoSesion = signal(false);

    private alarmaAviso: ReturnType<typeof setTimeout> | undefined;
    private alarmaCierreSesion: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        this.programarAvisos();
    }


    // [CICLO LOGIN · paso 2/6]
    login(datos: DatosLogin) {
        return this.http
            .post<RespuestaLogin>(`${API_URL}/auth/login`, datos)
            .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
    }


    // [CICLO REGISTRO · paso 2/6]
    registro(datos: FormData) {
        return this.http
            .post<RespuestaLogin>(`${API_URL}/auth/registro`, datos)
            .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
    }
    

    // [CICLO SESIÓN] 
    autorizar() {
        return this.http.post(`${API_URL}/auth/autorizar`, {});
    }
    // [CICLO EDITAR PERFIL]
    actualizarPerfil(datos: FormData) {
        return this.http
            .put<RespuestaLogin>(`${API_URL}/auth/perfil`, datos)
            .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
    }


    // [CICLO SESIÓN] 
    refrescar() {
        return this.http.post<{ token: string }>(`${API_URL}/auth/refrescar`, {}).pipe(
            tap((respuesta) => {
                try {
                    localStorage.setItem(this.claveToken, respuesta.token);
                } catch {
                }
                this.avisoSesion.set(false);
                this.programarAvisos();
            }),
        );
    }


    cerrarSesion() {
        this.cancelarAlarmas();
        this.avisoSesion.set(false);
        this.usuarioActual.set(null);
        try {
            localStorage.removeItem(this.clave);
            localStorage.removeItem(this.claveToken);
        } catch {
        }
    }


    obtenerToken(): string | null {
        try {
            return localStorage.getItem(this.claveToken);
        } catch {
            return null;
        }
    }


    private leerGuardado(): UsuarioSesion | null {
        try {
            const guardado = localStorage.getItem(this.clave);
            return guardado ? JSON.parse(guardado) : null;
        } catch {
            return null;
        }
    }

    private guardarSesion(respuesta: RespuestaLogin) {
        this.usuarioActual.set(respuesta.usuario);
        try {
            localStorage.setItem(this.clave, JSON.stringify(respuesta.usuario));
            localStorage.setItem(this.claveToken, respuesta.token);
        } catch {
        }
        this.programarAvisos();
    }

    private leerHoraVencimiento(): number | null {
        const token = this.obtenerToken();
        if (!token) {
            return null;
        }
        try {
            const cuerpo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');//Base64URL a Base64 estándar para que atob() no falle con caracteres especiales
            const payload = JSON.parse(atob(cuerpo));//atob decodifica el jwt en Base64 y traduce a json
            return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
        } catch {
            return null;
        }
    }

    private programarAvisos() {
        this.cancelarAlarmas();

        const horaVencimiento = this.leerHoraVencimiento();
        if (!horaVencimiento) {
            return; 
        }

        const msHastaVencimiento = horaVencimiento - Date.now();
        if (msHastaVencimiento <= 0) {
            return;
        }

        const msHastaAviso = msHastaVencimiento - AVISO_SESION_ANTES_MS;
        if (msHastaAviso <= 0) {
            this.avisoSesion.set(true); // menos de 5 min
        } else {
            this.alarmaAviso = setTimeout(() => this.avisoSesion.set(true), msHastaAviso); 
        }

        this.alarmaCierreSesion = setTimeout(() => {
            this.cerrarSesion();
            this.router.navigate(['/login']);
        }, msHastaVencimiento);
    }

    private cancelarAlarmas() {
        clearTimeout(this.alarmaAviso);
        clearTimeout(this.alarmaCierreSesion);
    }
}