import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
    imports: [
        // Lee el archivo .env (MONGODB_URI, JWT_SECRET, CLOUDINARY_*) en toda la app
        ConfigModule.forRoot({ isGlobal: true }),
        // Conexión con MongoDB
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI'),
            }),
        }),
        UsuariosModule,
        AuthModule,
        PublicacionesModule,
    ],
})
export class AppModule {}
