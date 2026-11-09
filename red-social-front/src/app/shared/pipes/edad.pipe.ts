import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
    transform(nacimiento: string | Date | null | undefined): string {
        if (!nacimiento) return '';

        const fecha = new Date(nacimiento);
        if (isNaN(fecha.getTime())) return '';

        const hoy = new Date();
        let edad = hoy.getFullYear() - fecha.getUTCFullYear();

        // Si este año todavía no llegó su cumpleaños, tiene un año menos
        const cumpleTodaviaNoLlego =
            hoy.getMonth() < fecha.getUTCMonth() ||
            (hoy.getMonth() === fecha.getUTCMonth() && hoy.getDate() < fecha.getUTCDate());
        if (cumpleTodaviaNoLlego) {
            edad--;
        }

        return `${edad} ${edad === 1 ? 'año' : 'años'}`;
    }
}