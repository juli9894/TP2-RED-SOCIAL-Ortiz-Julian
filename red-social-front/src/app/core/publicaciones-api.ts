import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import type {
    FiltrosPublicaciones,
    Publicacion,
    RespuestaMeGusta,
} from './models/publicacion.model';

// Peticiones al back relacionadas con publicaciones (listar, dar/quitar me gusta, crear, eliminar).
// El token lo agrega solo token.interceptor.ts.
@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
    private http = inject(HttpClient);

    // [CICLO LISTAR · paso 2/7] 
    listar(filtros: FiltrosPublicaciones = {}) {

        let params = new HttpParams();//codifica los filtros en la URL: ?orden=fecha&usuario=123&offset=0&limit=10
        for (const [clave, valor] of Object.entries(filtros)) {
            if (valor !== undefined) {
                params = params.set(clave, String(valor));
            }
        }

        return this.http.get<Publicacion[]>(`${API_URL}/publicaciones`, { params });
    }

    // [CICLO ME GUSTA · paso 3/7] POST /publicaciones/:id/me-gusta
    darMeGusta(id: string) {
        return this.http.post<RespuestaMeGusta>(
            `${API_URL}/publicaciones/${id}/me-gusta`,
            {},
        );
    }

    // [CICLO ME GUSTA · paso 3/7] DELETE /publicaciones/:id/me-gusta
    quitarMeGusta(id: string) {
        return this.http.delete<RespuestaMeGusta>(
            `${API_URL}/publicaciones/${id}/me-gusta`,
        );
    }

    // [CICLO PUBLICAR · paso 2/7] 
    crear(datos: FormData) {
        return this.http.post<{ _id: string }>(`${API_URL}/publicaciones`, datos);
    }

    // [CICLO ELIMINAR · paso 4/8] DELETE /publicaciones/:id
    eliminar(id: string) {
        return this.http.delete<{ mensaje: string }>(`${API_URL}/publicaciones/${id}`);
    }
}
