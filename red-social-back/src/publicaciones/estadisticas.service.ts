import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from '../comentarios/schemas/comentario.schema.js';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { RangoFechasDto } from './dto/rango-fechas.dts.js';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';

// Argentina no cambia la hora en verano, así que el desfase es siempre -03:00
const DESFASE = '-03:00';
const ZONA = 'America/Argentina/Buenos_Aires';

@Injectable()
export class EstadisticasService {
    constructor(
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
        @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
        @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    ) {}

    // Convierte "2026-11-01" y "2026-11-08" en el inicio del primer día y el final del último
    private rango({ desde, hasta }: RangoFechasDto) {
        const inicio = new Date(`${desde}T00:00:00.000${DESFASE}`);
        const fin = new Date(`${hasta}T23:59:59.999${DESFASE}`);

        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            throw new BadRequestException('Las fechas no son válidas');
        }
        if (inicio > fin) {
            throw new BadRequestException('"desde" no puede ser posterior a "hasta"');
        }
        return { $gte: inicio, $lte: fin };
    }

    // [CICLO ESTADÍSTICAS · 1] Publicaciones hechas por cada usuario en el lapso
    publicacionesPorUsuario(dto: RangoFechasDto) {
        return this.publicacionModel.aggregate([
            // 1) solo las publicaciones del lapso que no fueron dadas de baja
            { $match: { eliminada: false, createdAt: this.rango(dto) } },
            // 2) una fila por autor, sumando 1 por cada publicación
            { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
            // 3) traigo los datos del autor desde la colección de usuarios
            {
                $lookup: {
                    from: this.usuarioModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'autor',
                },
            },
            { $unwind: '$autor' },
            // 4) me quedo solo con lo que necesita el gráfico
            { $project: { _id: 0, usuario: '$autor.usuario', cantidad: 1 } },
            { $sort: { cantidad: -1 } },
        ]);
    }

    // [CICLO ESTADÍSTICAS · 2] Comentarios hechos por día en el lapso
    comentariosPorDia(dto: RangoFechasDto) {
        return this.comentarioModel.aggregate([
            { $match: { createdAt: this.rango(dto) } },
            // una fila por día ("2026-11-05"), contando los comentarios de ese día
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
                    cantidad: { $sum: 1 },
                },
            },
            { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
            { $sort: { fecha: 1 } }, // de la fecha más vieja a la más nueva
        ]);
    }

    // [CICLO ESTADÍSTICAS · 3] Comentarios recibidos por cada publicación en el lapso (top 10)
    comentariosPorPublicacion(dto: RangoFechasDto) {
        return this.comentarioModel.aggregate([
            { $match: { createdAt: this.rango(dto) } },
            { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
            {
                $lookup: {
                    from: this.publicacionModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'publicacion',
                },
            },
            { $unwind: '$publicacion' },
            // las publicaciones dadas de baja no se cuentan
            { $match: { 'publicacion.eliminada': false } },
            { $project: { _id: 0, titulo: '$publicacion.titulo', cantidad: 1 } },
            { $sort: { cantidad: -1 } },
            { $limit: 10 },
        ]);
    }
}