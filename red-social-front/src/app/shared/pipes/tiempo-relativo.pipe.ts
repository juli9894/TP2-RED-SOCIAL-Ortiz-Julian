import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

// Convierte una fecha en un texto como "hace 5 minutos".
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
    transform(valor: string | Date | null | undefined): string {
        if (!valor) return '';

        const fecha = new Date(valor);
        if (isNaN(fecha.getTime())) return '';

        const segundos = Math.floor((Date.now() - fecha.getTime()) / 1000);
        if (segundos < 60) return 'hace un momento';

        const minutos = Math.floor(segundos / 60);
        if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

        const horas = Math.floor(minutos / 60);
        if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

        const dias = Math.floor(horas / 24);
        if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

        // Pasada una semana, "hace 20 días" no ayuda: mostramos la fecha completa
        return formatDate(fecha, 'dd/MM/yyyy', 'en-US');
    }
}