// Lo que devuelve cada ruta de /estadisticas del back
export interface PublicacionesPorUsuario {
    usuario: string;
    cantidad: number;
}

export interface ComentariosPorDia {
    fecha: string; // "2026-11-05"
    cantidad: number;
}

export interface ComentariosPorPublicacion {
    titulo: string;
    cantidad: number;
}

// El lapso que elige el administrador (formato AAAA-MM-DD)
export interface RangoFechas {
    desde: string;
    hasta: string;
}