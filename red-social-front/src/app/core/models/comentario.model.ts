import type { AutorPublicacion } from './publicacion.model';

// Cómo viene un comentario desde el back (el autor ya viene con sus datos por el populate)
export interface Comentario {
    _id: string;
    mensaje: string;
    publicacion: string; // id de la publicación a la que pertenece
    autor: AutorPublicacion;
    modificado: boolean; // true si el autor lo editó: el front muestra "editado"
    createdAt: string;
}