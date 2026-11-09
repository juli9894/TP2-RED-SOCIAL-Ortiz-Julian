import { Matches } from 'class-validator';

// Las dos fechas llegan por la URL: ?desde=2026-11-01&hasta=2026-11-08
export class RangoFechasDto {
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '"desde" debe tener el formato AAAA-MM-DD' })
    desde: string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '"hasta" debe tener el formato AAAA-MM-DD' })
    hasta: string;
}