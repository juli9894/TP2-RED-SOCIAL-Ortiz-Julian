import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Model } from 'mongoose';
import type { PayloadToken } from '../auth/interfaces/payload-token.interface.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { Publicacion } from './schemas/publicacion.schema.js';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private publicacionModel: Model<Publicacion>,
        private cloudinaryService: CloudinaryService,
    ) {}

    // ─── CICLO PUBLICAR ─────────────────────────────────────────────

    // [CICLO PUBLICAR · paso 5/7]
    async crear(
        datos: CrearPublicacionDto,
        autorId: string,
        archivo?: ArchivoSubido,
    ) {
        let imagen: string | undefined;

        if (archivo) {
            // Sube la imagen a Cloudinary (valida que sea imagen) y devuelve la URL
            imagen = await this.cloudinaryService.subirImagenPublicacion(archivo);
        }

        return this.publicacionModel.create({
            ...datos,
            imagen,
            autor: new Types.ObjectId(autorId),
        });
    }

    // ─── CICLO LISTAR (y MI PERFIL) ─────────────────────────────────

    // [CICLO LISTAR · paso 5/7]
    async listar(filtros: ListarPublicacionesDto) {
        // valores por defecto si no vienen en el dto
        const { orden = 'fecha', usuario, offset = 0, limit = 10 } = filtros;

        // buscar publicaciones que no estén eliminadas
        const consulta: Record<string, unknown> = { eliminada: false };

        // filtro por usuario si viene en el dto (así lo usa Mi perfil)
        if (usuario) {
            consulta.autor = new Types.ObjectId(usuario);
        }

        // orden: -1 = de mayor a menor. En empate de likes, la más nueva primero
        const ordenamiento: Record<string, 1 | -1> =
            orden === 'meGusta'
                ? { cantidadMeGusta: -1, createdAt: -1 }
                : { createdAt: -1 };

        // populate cambia el id del autor por sus datos
        return this.publicacionModel
            .find(consulta)
            .sort(ordenamiento)
            .skip(offset)
            .limit(limit)
            .populate('autor', 'usuario imagenPerfil');
    }

    // ─── CICLO ELIMINAR ─────────────────────────────────────────────

    // [CICLO ELIMINAR · paso 7/8]
    async eliminar(id: string, usuario: PayloadToken) {
        this.validarId(id);

        const publicacion = await this.publicacionModel.findOne({
            _id: id,
            eliminada: false,
        });
        if (!publicacion) {
            throw new NotFoundException('Publicación no encontrada');
        }

        // Solo el autor o un administrador pueden eliminar (403 si no)
        const esAutor = publicacion.autor.toString() === usuario.id;
        const esAdministrador = usuario.perfil === 'administrador';

        if (!esAutor && !esAdministrador) {
            throw new ForbiddenException('No podés eliminar esta publicación');
        }

        // Baja lógica: no se borra de la base, se marca como eliminada
        publicacion.eliminada = true;
        await publicacion.save();
        return { mensaje: 'Publicación eliminada' };
    }

    // ─── CICLO ME GUSTA ─────────────────────────────────────────────

    // [CICLO ME GUSTA · paso 6/7] dar me gusta
    async darMeGusta(id: string, usuarioId: string) {
        this.validarId(id);
        const autor = new Types.ObjectId(usuarioId);

        // 1. Una sola orden: busca (que no tenga ya mi me gusta) y modifica
        const publicacion = await this.publicacionModel.findOneAndUpdate(
            { _id: id, eliminada: false, meGusta: { $ne: autor } },
            { $addToSet: { meGusta: autor }, $inc: { cantidadMeGusta: 1 } },
            { new: true }, // 2. devolver la publicación ya modificada
        );

        // 3. Si no encontró nada: 404 si no existe, 409 si ya le había dado me gusta
        if (!publicacion) {
            throw await this.errorMeGusta(id, 'Ya le diste me gusta');
        }
        return publicacion;
    }

    // [CICLO ME GUSTA · paso 6/7] quitar me gusta
    async quitarMeGusta(id: string, usuarioId: string) {
        this.validarId(id);
        const autor = new Types.ObjectId(usuarioId);

        // Igual que arriba, pero el filtro exige que SÍ tenga mi me gusta
        const publicacion = await this.publicacionModel.findOneAndUpdate(
            { _id: id, eliminada: false, meGusta: autor },
            { $pull: { meGusta: autor }, $inc: { cantidadMeGusta: -1 } },
            { new: true },
        );

        if (!publicacion) {
            throw await this.errorMeGusta(id, 'No le habías dado me gusta');
        }
        return publicacion;
    }

    // ─── AYUDANTES (los usan los métodos de arriba) ─────────────────

    // Si el id no tiene forma de id de Mongo, cortamos con 400
    private validarId(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('El id no es válido');
        }
    }

    // Se usa cuando el findOneAndUpdate no encontró nada.
    // Averigua por qué y devuelve el error que corresponde (404 o 409)
    private async errorMeGusta(id: string, mensajeConflicto: string) {
        const existe = await this.publicacionModel.exists({
            _id: id,
            eliminada: false,
        });
        return existe
            ? new ConflictException(mensajeConflicto)
            : new NotFoundException('Publicación no encontrada');
    }
}
