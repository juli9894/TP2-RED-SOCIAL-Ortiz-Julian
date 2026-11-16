import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from '../comentarios/schemas/comentario.schema.js';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';

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

    // [CICLO ESTADÍSTICAS]
    publicacionesPorUsuario(dto: RangoFechasDto) {
        return this.publicacionModel.aggregate([
            { $match: { eliminada: false, createdAt: this.rango(dto) } },
            { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
            {
                $lookup: {
                    from: this.usuarioModel.collection.name,
                    localField: '_id',
                    foreignField: '_id',//contra cada id de la coleccion
                    as: 'autor',
                },
            },
            { $unwind: '$autor' },
            // lo que necesita el gráfico
            { $project: { _id: 0, usuario: '$autor.usuario', cantidad: 1 } },
            { $sort: { cantidad: -1 } },
        ]);
    }

    // [CICLO ESTADÍSTICAS]
    comentariosPorDia(dto: RangoFechasDto) {
        return this.comentarioModel.aggregate([
            { $match: { createdAt: this.rango(dto) } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
                    cantidad: { $sum: 1 },
                },
            },
            { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
            { $sort: { fecha: 1 } }, 
        ]);
    }

    // [CICLO ESTADÍSTICAS]
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