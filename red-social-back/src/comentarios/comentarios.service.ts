import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Model } from 'mongoose';
import { Publicacion } from '../publicaciones/schemas/publicacion.schema.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { Comentario } from './schemas/comentario.schema.js';


@Injectable()
export class ComentariosService {
    constructor(
        @InjectModel(Comentario.name)
        private comentarioModel: Model<Comentario>,
        @InjectModel(Publicacion.name)
        private publicacionModel: Model<Publicacion>,
    ) {}

    // [CICLO COMENTAR] Crea un comentario en la publicación indicada
    async crear(publicacionId: string, datos: CrearComentarioDto, autorId: string) {
        await this.validarPublicacion(publicacionId);

        const comentario = await this.comentarioModel.create({
            mensaje: datos.mensaje,
            publicacion: new Types.ObjectId(publicacionId),
            autor: new Types.ObjectId(autorId),
        });

        // $inc suma 1 al contador de la publicación
        await this.publicacionModel.updateOne(
            { _id: publicacionId },
            { $inc: { cantidadComentarios: 1 } },
        );

        // populate cambia el id del autor por sus datos (para mostrarlo enseguida)
        return comentario.populate('autor', 'usuario imagenPerfil');
    }

    // [CICLO LISTAR COMENTARIOS] Los más nuevos primero, paginados con offset y limit
    async listar(publicacionId: string, filtros: ListarComentariosDto) {
        await this.validarPublicacion(publicacionId);
        const { offset = 0, limit = 10 } = filtros;

        return this.comentarioModel
            .find({ publicacion: new Types.ObjectId(publicacionId) })
            .sort({ createdAt: -1 }) // -1 = más nuevo primero
            .skip(offset)
            .limit(limit)
            .populate('autor', 'usuario imagenPerfil');
    }

        // [CICLO EDITAR COMENTARIO] Solo el autor puede editarlo; queda marcado como modificado
    async editar(id: string, datos: CrearComentarioDto, usuarioId: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('El id no es válido');
        }

        const comentario = await this.comentarioModel.findById(id);
        if (!comentario) {
            throw new NotFoundException('Comentario no encontrado');
        }

        // Si la publicación fue dada de baja, sus comentarios tampoco están disponibles
        await this.validarPublicacion(comentario.publicacion.toString());

        // Si quien pide el cambio no es el autor: 403
        if (comentario.autor.toString() !== usuarioId) {
            throw new ForbiddenException('Solo el autor puede editar su comentario');
        }

        comentario.mensaje = datos.mensaje;
        comentario.modificado = true;
        await comentario.save();

        return comentario.populate('autor', 'usuario imagenPerfil');
    }

    // ─── AYUDANTE ───────────────────────────────────────────────────

    // 400 si el id no tiene forma de id de Mongo, 404 si la publicación no existe o fue eliminada
    private async validarPublicacion(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('El id no es válido');
        }
        const existe = await this.publicacionModel.exists({ _id: id, eliminada: false });
        if (!existe) {
            throw new NotFoundException('Publicación no encontrada');
        }
    }
}