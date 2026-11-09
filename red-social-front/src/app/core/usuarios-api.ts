import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import type { UsuarioListado } from './models/usuario.model';

// Peticiones al back para administrar usuarios (solo administrador).
// El token lo agrega solo token.interceptor.ts.
@Injectable({ providedIn: 'root' })
export class UsuariosApi {
    private http = inject(HttpClient);

    // [CICLO ADMIN USUARIOS] GET /usuarios
    listar() {
        return this.http.get<UsuarioListado[]>(`${API_URL}/usuarios`);
    }

    // DELETE /usuarios/:id (baja lógica)
    deshabilitar(id: string) {
        return this.http.delete<UsuarioListado>(`${API_URL}/usuarios/${id}`);
    }

    // POST /usuarios/:id/habilitar (alta lógica)
    habilitar(id: string) {
        return this.http.post<UsuarioListado>(`${API_URL}/usuarios/${id}/habilitar`, {});
    }

    // [CICLO ADMIN ALTA] POST /usuarios (multipart: textos + imagenPerfil opcional)
    crear(datos: FormData) {
        return this.http.post<UsuarioListado>(`${API_URL}/usuarios`, datos);
    }
}