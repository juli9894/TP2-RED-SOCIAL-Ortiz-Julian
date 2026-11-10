// Tamaño máximo de las imágenes (en bytes). Lo usa FileInterceptor en los controllers
export const LIMITE_IMAGEN_PERFIL_BYTES = 2 * 1024 * 1024; // 2 MB
export const LIMITE_IMAGEN_PUBLICACION_BYTES = 5 * 1024 * 1024; // 5 MB
// El token JWT dura 15 minutos (en segundos)
export const DURACION_TOKEN_SEGUNDOS = 15 * 60;
// Largo máximo de los textos (en caracteres)
export const MAX_TITULO = 100;
export const MAX_MENSAJE_PUBLICACION = 2000;
export const MAX_COMENTARIO = 500;