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
        fechaNacimiento: string; // llega como texto ISO: "1995-03-20T00:00:00.000Z"
        descripcion: string;
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
    private readonly claveToken = 'token';

    // null = invitado; con valor = hay alguien logueado
    readonly usuarioActual = signal<UsuarioSesion | null>(this.leerGuardado());

    login(datos: { usuarioOCorreo: string; contrasena: string }) {
        return this.http.post<RespuestaLogin>(`${API_URL}/auth/login`, datos).pipe(
            tap((respuesta) => {
                this.usuarioActual.set(respuesta.usuario);
                try {
                    localStorage.setItem(this.clave, JSON.stringify(respuesta.usuario));
                    localStorage.setItem(this.claveToken, respuesta.token);
                } catch {}
            }),
        );
    }


    registro(datos: FormData) {
        return this.http.post(`${API_URL}/auth/registro`, datos);
        //Prepara la petición POST, no la envia aun, 
        //url: API_URL/auth/registro, body: datos, headers: { 'Content-Type': 'multipart/form-data' } metod: post
        //retorna a features/registro/registro.ts registro() que se suscribe y envia la petición
    } 

    cerrarSesion() {
        this.usuarioActual.set(null);
        try {
            localStorage.removeItem(this.clave);
            localStorage.removeItem(this.claveToken);
        } catch {}
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
}