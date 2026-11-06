import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import type { Comentario } from './models/comentario.model';

// Peticiones al back relacionadas con comentarios. El token lo agrega solo token.interceptor.ts.
@Injectable({ providedIn: 'root' })
export class ComentariosApi {
    private http = inject(HttpClient);

    // [CICLO LISTAR COMENTARIOS] GET /publicaciones/:id/comentarios?offset=0&limit=5 (más nuevos primero)
    listar(publicacionId: string, offset = 0, limit = 5) {
        const params = new HttpParams().set('offset', offset).set('limit', limit);
        return this.http.get<Comentario[]>(`${API_URL}/publicaciones/${publicacionId}/comentarios`, {
            params,
        });
    }

    // [CICLO COMENTAR] POST /publicaciones/:id/comentarios
    crear(publicacionId: string, mensaje: string) {
        return this.http.post<Comentario>(`${API_URL}/publicaciones/${publicacionId}/comentarios`, {
            mensaje,
        });
    }

    // [CICLO EDITAR COMENTARIO] PUT /comentarios/:id
    editar(id: string, mensaje: string) {
        return this.http.put<Comentario>(`${API_URL}/comentarios/${id}`, { mensaje });
    }
}