import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    ],
    providers: [UsuariosService],
    controllers: [UsuariosController],
    exports: [UsuariosService], // lo usa AuthModule
})
export class UsuariosModule {}
