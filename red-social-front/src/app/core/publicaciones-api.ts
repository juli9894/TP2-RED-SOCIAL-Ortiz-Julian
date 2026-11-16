import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import type {
    FiltrosPublicaciones,
    Publicacion,
    RespuestaMeGusta,
} from './models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
    private http = inject(HttpClient);

    // [CICLO LISTAR · paso 2/7] 
    listar(filtros: FiltrosPublicaciones = {}) {

        let params = new HttpParams();
        for (const [clave, valor] of Object.entries(filtros)) {
            if (valor !== undefined) {
                params = params.set(clave, String(valor));
            }
        }

        return this.http.get<Publicacion[]>(`${API_URL}/publicaciones`, { params });
    }

    // [CICLO DETALLE] 
    obtener(id: string) {
        return this.http.get<Publicacion>(`${API_URL}/publicaciones/${id}`);
    }

    // [CICLO ME GUSTA]
    darMeGusta(id: string) {
        return this.http.post<RespuestaMeGusta>(
            `${API_URL}/publicaciones/${id}/me-gusta`,
            {},
        );
    }

    // [CICLO ME GUSTA]
    quitarMeGusta(id: string) {
        return this.http.delete<RespuestaMeGusta>(
            `${API_URL}/publicaciones/${id}/me-gusta`,
        );
    }

    // [CICLO PUBLICAR]
    crear(datos: FormData) {
        return this.http.post<{ _id: string }>(`${API_URL}/publicaciones`, datos);
    }

    // [CICLO ELIMINAR]
    eliminar(id: string) {
        return this.http.delete<{ mensaje: string }>(`${API_URL}/publicaciones/${id}`);
    }
}
