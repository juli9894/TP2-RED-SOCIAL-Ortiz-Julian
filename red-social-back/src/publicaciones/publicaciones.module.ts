import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
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
        ]),
        CloudinaryModule,
    ],
    controllers: [PublicacionesController],
    providers: [PublicacionesService],
})
export class PublicacionesModule {}