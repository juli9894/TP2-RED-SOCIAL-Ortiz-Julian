// Convierte una fecha a "AAAA-MM-DD" (el formato del <input type="date"> y del back)
function aTexto(fecha: Date) {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function fechaHoy() {
    return aTexto(new Date());
}

export function fechaHaceDias(dias: number) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return aTexto(fecha);
}