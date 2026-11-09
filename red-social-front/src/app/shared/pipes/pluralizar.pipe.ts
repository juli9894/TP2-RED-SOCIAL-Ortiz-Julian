import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluralizar' })
export class PluralizarPipe implements PipeTransform {
    transform(cantidad: number, singular: string, plural: string): string {
        return `${cantidad} ${cantidad === 1 ? singular : plural}`;
    }
}