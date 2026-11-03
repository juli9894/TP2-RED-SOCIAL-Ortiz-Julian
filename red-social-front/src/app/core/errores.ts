import type { HttpErrorResponse } from '@angular/common/http';

// Convierte un error HTTP en el texto que se le muestra al usuario.
// Lo usan login.ts, registro.ts y nueva-publicacion.ts en el `error:` de su subscribe.
export function mensajeDeError(
    err: HttpErrorResponse,
    mensajePorDefecto = 'Ocurrió un error. Probá de nuevo.',
): string {
    // status 0 = el pedido ni llegó al back (está apagado o no hay conexión)
    if (err.status === 0) {
        return 'No se pudo conectar con el servidor.';
    }

    // El back responde { message: '...' } y, si fallan varias validaciones, message es una lista
    const mensaje = err.error?.message;
    if (Array.isArray(mensaje)) {
        return mensaje.join('. ');
    }
    return mensaje ?? mensajePorDefecto;
}
