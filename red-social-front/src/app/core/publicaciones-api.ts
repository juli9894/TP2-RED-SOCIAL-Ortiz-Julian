import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import type {
    FiltrosPublicaciones,
    Publicacion,
    RespuestaMeGusta,
} from './models/publicacion.model';

// Todas las llamadas HTTP de publicaciones están acá. Cada método PREPARA el pedido
// y lo devuelve; no se envía hasta que quien lo llama hace subscribe.
// El token lo agrega solo token.interceptor.ts.
@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
    private http = inject(HttpClient);

    // [CICLO LISTAR · paso 2/7] GET /publicaciones (también lo usa CICLO MI PERFIL)
    listar(filtros: FiltrosPublicaciones = {}) {
        // 1. Armar el "?orden=...&limit=..." solo con los filtros que tengan valor
        let params = new HttpParams();
        for (const [clave, valor] of Object.entries(filtros)) {
            if (valor !== undefined) {
                params = params.set(clave, String(valor));
            }
        }
        // 2. Prepara el GET (no lo envía hasta que alguien haga subscribe)
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

    // [CICLO PUBLICAR · paso 2/7] POST /publicaciones con el paquete (texto + imagen)
    crear(datos: FormData) {
        return this.http.post<{ _id: string }>(`${API_URL}/publicaciones`, datos);
    }

    // [CICLO ELIMINAR · paso 4/8] DELETE /publicaciones/:id
    eliminar(id: string) {
        return this.http.delete<{ mensaje: string }>(`${API_URL}/publicaciones/${id}`);
    }
}
