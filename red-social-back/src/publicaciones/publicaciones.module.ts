import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { Comentario, ComentarioSchema } from '../comentarios/schemas/comentario.schema.js';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { EstadisticasService } from './estadisticas.service.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import {
    Publicacion,
    PublicacionSchema,
} from './schemas/publicacion.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Publicacion.name, schema: PublicacionSchema },
            { name: Comentario.name, schema: ComentarioSchema },
            { name: Usuario.name, schema: UsuarioSchema },
        ]),
        CloudinaryModule,
    ],
    controllers: [PublicacionesController, EstadisticasController],
    providers: [PublicacionesService, EstadisticasService],
})
export class PublicacionesModule {}