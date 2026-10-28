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

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);

    login(datos: { usuarioOCorreo: string; contrasena: string }) {
        return this.http.post<RespuestaLogin>(`${API_URL}/auth/login`, datos); //observable<RespuestaLogin>
    }
}