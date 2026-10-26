import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private usuariosService: UsuariosService,
        private configService: ConfigService,
    ) {}

    async registro(datos: CrearUsuarioDto) {
        const usuario = await this.usuariosService.crear(datos);
        const { contrasena, ...sinContrasena } = usuario.toObject();
        return sinContrasena;
    }

    async login(datos: LoginDto) {
        const usuario = await this.usuariosService.buscarPorUsuarioOCorreo(
            datos.usuarioOCorreo,
        );

        const contrasenaValida = usuario
            ? await bcrypt.compare(datos.contrasena, usuario.contrasena)
            : false;

        if (!usuario || !contrasenaValida) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const { contrasena, ...sinContrasena } = usuario.toObject();

        const token = jwt.sign(
            {
                id: usuario._id.toString(),
                usuario: usuario.usuario,
                perfil: usuario.perfil,
            },
            this.configService.getOrThrow<string>('JWT_SECRET'),
        );

        return { token, usuario: sinContrasena };
    }
}