import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';

// Cómo viene el autor dentro de cada publicación (el back hace populate)
export interface AutorPublicacion {
    _id: string;
    usuario: string;
    imagenPerfil?: string;
}

// Cómo viene una publicación desde el back
export interface Publicacion {
    _id: string;
    titulo: string;
    mensaje: string;
    imagen?: string;
    autor: AutorPublicacion;
    meGusta: string[]; // ids de los usuarios que le dieron me gusta
    cantidadMeGusta: number;
    createdAt: string;
}

// Los filtros que acepta el back (todos opcionales)
export interface FiltrosPublicaciones {
    orden?: 'fecha' | 'meGusta';
    usuario?: string;
    offset?: number;
    limit?: number;
}

// Lo que devuelve el back al dar o quitar me gusta
export interface RespuestaMeGusta {
    _id: string;
    meGusta: string[];
    cantidadMeGusta: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
    private http = inject(HttpClient);

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

    darMeGusta(id: string) {
        return this.http.post<RespuestaMeGusta>(
            `${API_URL}/publicaciones/${id}/me-gusta`,
            {},
        );
    }

    quitarMeGusta(id: string) {
        return this.http.delete<RespuestaMeGusta>(
            `${API_URL}/publicaciones/${id}/me-gusta`,
        );
    }

    crear(datos: FormData) {
        // Prepara el POST con el paquete (texto + imagen). No envía hasta el subscribe
        return this.http.post<{ _id: string }>(`${API_URL}/publicaciones`, datos);
    }

    eliminar(id: string) {
        // Prepara el DELETE. No envía hasta el subscribe
        return this.http.delete<{ mensaje: string }>(`${API_URL}/publicaciones/${id}`);
    }
}