// Revisa que el archivo elegido sea una imagen y no pese más de maxMB.
// Devuelve el texto del error, o null si está todo bien.
// Lo usan registro.ts (foto de perfil) y nueva-publicacion.ts (imagen de publicación).
export function validarImagen(archivo: File, maxMB: number): string | null {
    if (!archivo.type.startsWith('image/')) {
        return 'El archivo debe ser una imagen.';
    }
    if (archivo.size > maxMB * 1024 * 1024) {
        return `La imagen no puede pesar más de ${maxMB} MB.`;
    }
    return null;
}
