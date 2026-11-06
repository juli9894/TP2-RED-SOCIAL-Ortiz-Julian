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

    // null = invitado; con valor = hay alguien logueado
    readonly usuarioActual = signal<UsuarioSesion | null>(this.leerGuardado());

    // true cuando faltan pocos minutos para que venza el token (lo muestra shared/aviso-sesion)
    readonly avisoSesion = signal(false);

    private temporizadorAviso: ReturnType<typeof setTimeout> | undefined;
    private temporizadorVencimiento: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        // Si la app se abre (o se recarga) con una sesión guardada, rearma las alarmas
        this.programarAvisos();
    }

    // [CICLO LOGIN · paso 2/6] prepara el POST a /auth/login y le agrega el pipe tap() para guardar la sesión (usuario + token) en localStorage.
    login(datos: DatosLogin) {
        return this.http
            .post<RespuestaLogin>(`${API_URL}/auth/login`, datos)
            .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
    }

    // [CICLO REGISTRO · paso 2/6] Prepara el POST a /auth/registro con el FormData (texto + foto).
    // No se envía hasta el subscribe de registro.ts. No ponemos Content-Type: el navegador lo arma solo para FormData
    // El back responde con token + usuario, igual que el login: guardamos la sesión
    registro(datos: FormData) {
        return this.http
            .post<RespuestaLogin>(`${API_URL}/auth/registro`, datos)
            .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
    }

    // [CICLO SESIÓN] Pregunta al back si el token guardado sigue valiendo (200 = sí, 401 = no).
    // El token viaja en la cabecera porque token.interceptor.ts lo agrega solo
    autorizar() {
        return this.http.post(`${API_URL}/auth/autorizar`, {});
    }

    // [CICLO SESIÓN] Pide un token nuevo (el actual todavía tiene que ser válido) y rearma las alarmas
    refrescar() {
        return this.http.post<{ token: string }>(`${API_URL}/auth/refrescar`, {}).pipe(
            tap((respuesta) => {
                try {
                    localStorage.setItem(this.claveToken, respuesta.token);
                } catch {
                    // si localStorage no está disponible, la sesión dura solo hasta recargar
                }
                this.avisoSesion.set(false);
                this.programarAvisos();
            }),
        );
    }

    cerrarSesion() {
        this.cancelarTemporizadores();
        this.avisoSesion.set(false);
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

    // Lo usan login() y registro(): deja la sesión en el signal y en localStorage
    private guardarSesion(respuesta: RespuestaLogin) {
        this.usuarioActual.set(respuesta.usuario);
        try {
            localStorage.setItem(this.clave, JSON.stringify(respuesta.usuario));
            localStorage.setItem(this.claveToken, respuesta.token);
        } catch {
            // si localStorage no está disponible, la sesión dura solo hasta recargar
        }
        this.programarAvisos();
    }

    // Lee la hora de vencimiento (exp, en segundos) que el back puso dentro del token y la pasa a milisegundos
    private leerVencimiento(): number | null {
        const token = this.obtenerToken();
        if (!token) {
            return null;
        }
        try {
            const cuerpo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(cuerpo));
            return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
        } catch {
            return null;
        }
    }

    // Arma las dos alarmas: el aviso (faltan 5 min) y el cierre de sesión (venció)
    private programarAvisos() {
        this.cancelarTemporizadores();

        const vence = this.leerVencimiento();
        if (!vence) {
            return;
        }

        const restante = vence - Date.now();
        if (restante <= 0) {
            return; // ya venció: lo resuelve el 401 / la pantalla cargando
        }

        const hastaElAviso = restante - AVISO_SESION_ANTES_MS;
        if (hastaElAviso <= 0) {
            this.avisoSesion.set(true); // ya faltan menos de 5 min: avisa enseguida
        } else {
            this.temporizadorAviso = setTimeout(() => this.avisoSesion.set(true), hastaElAviso);
        }

        this.temporizadorVencimiento = setTimeout(() => {
            this.cerrarSesion();
            this.router.navigate(['/login']);
        }, restante);
    }

    private cancelarTemporizadores() {
        clearTimeout(this.temporizadorAviso);
        clearTimeout(this.temporizadorVencimiento);
    }
}