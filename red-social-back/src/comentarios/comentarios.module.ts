import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from '../publicaciones/schemas/publicacion.schema.js';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comentario.name, schema: ComentarioSchema },
            { name: Publicacion.name, schema: PublicacionSchema }, // para chequear que la publicación exista
        ]),
    ],
    controllers: [ComentariosController],
    providers: [ComentariosService],
})
export class ComentariosModule {}