import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from './api';

export interface RespuestaLogin {
    token: string;
    usuario: {
        _id: string;
        nombre: string;
        apellido: string;
        usuario: string;
        correo: string;
        perfil: string;
        imagenPerfil?: string;
    };
}

export type UsuarioSesion = RespuestaLogin['usuario'];

export interface DatosRegistro {
    nombre: string;
    apellido: string;
    correo: string;
    usuario: string;
    contrasena: string;
    fechaNacimiento: string;
    descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);
    private readonly clave = 'usuario';

    // null = invitado; con valor = hay alguien logueado
    readonly usuarioActual = signal<UsuarioSesion | null>(this.leerGuardado());

    login(datos: { usuarioOCorreo: string; contrasena: string }) {
        return this.http.post<RespuestaLogin>(`${API_URL}/auth/login`, datos).pipe(
            tap((respuesta) => {
                this.usuarioActual.set(respuesta.usuario);
                try {
                    localStorage.setItem(this.clave, JSON.stringify(respuesta.usuario));
                } catch {}
            }),
        );
    }

    registro(datos: FormData) {
        return this.http.post(`${API_URL}/auth/registro`, datos);
    }

    cerrarSesion() {
        this.usuarioActual.set(null);
        try {
            localStorage.removeItem(this.clave);
        } catch {}
    }

    private leerGuardado(): UsuarioSesion | null {
        try {
            const guardado = localStorage.getItem(this.clave);
            return guardado ? JSON.parse(guardado) : null;
        } catch {
            return null;
        }
    }
}