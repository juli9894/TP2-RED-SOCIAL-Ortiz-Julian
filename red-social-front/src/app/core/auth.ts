import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
    };
}

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

    login(datos: { usuarioOCorreo: string; contrasena: string }) {
        return this.http.post<RespuestaLogin>(`${API_URL}/auth/login`, datos); //observable<RespuestaLogin>
    }

    registro(datos: FormData) {
        return this.http.post(`${API_URL}/auth/registro`, datos);
    }
}