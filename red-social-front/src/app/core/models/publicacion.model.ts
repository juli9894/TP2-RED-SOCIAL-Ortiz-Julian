// MODELOS DE PUBLICACIÓN
// Solo describen la forma de los datos que llegan del back. No tienen lógica.

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

// Los filtros que acepta el back en GET /publicaciones (todos opcionales)
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
