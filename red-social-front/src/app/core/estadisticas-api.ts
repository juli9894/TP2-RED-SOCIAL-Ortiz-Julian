import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from './api';
import type {
    ComentariosPorDia,
    ComentariosPorPublicacion,
    PublicacionesPorUsuario,
    RangoFechas,
} from './models/estadisticas.model';

// Peticiones a las 3 rutas GET de /estadisticas (solo administrador).
// El token lo agrega solo token.interceptor.ts.
@Injectable({ providedIn: 'root' })
export class EstadisticasApi {
    private http = inject(HttpClient);

    // [CICLO ESTADÍSTICAS · front] GET /estadisticas/publicaciones-por-usuario?desde=…&hasta=…
    publicacionesPorUsuario(rango: RangoFechas) {
        return this.http.get<PublicacionesPorUsuario[]>(
            `${API_URL}/estadisticas/publicaciones-por-usuario`,
            { params: { ...rango } },
        );
    }

    comentariosPorDia(rango: RangoFechas) {
        return this.http.get<ComentariosPorDia[]>(`${API_URL}/estadisticas/comentarios-por-dia`, {
            params: { ...rango },
        });
    }

    comentariosPorPublicacion(rango: RangoFechas) {
        return this.http.get<ComentariosPorPublicacion[]>(
            `${API_URL}/estadisticas/comentarios-por-publicacion`,
            { params: { ...rango } },
        );
    }
}