// Valores fijos del back, todos juntos para encontrarlos y cambiarlos en un solo lugar.
// Si se cambia un límite de imagen, hay que cambiar también el del front (red-social-front/src/app/core/constantes.ts)

// Tamaño máximo de las imágenes (en bytes). Lo usa FileInterceptor en los controllers
export const LIMITE_IMAGEN_PERFIL_BYTES = 2 * 1024 * 1024; // 2 MB
export const LIMITE_IMAGEN_PUBLICACION_BYTES = 5 * 1024 * 1024; // 5 MB
