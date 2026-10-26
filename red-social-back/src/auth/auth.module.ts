import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Module({
    imports: [UsuariosModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}