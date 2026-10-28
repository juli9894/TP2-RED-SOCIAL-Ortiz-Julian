import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import type { ArchivoSubido } from '../cloudinary/cloudinary.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private usuariosService: UsuariosService,
        private cloudinaryService: CloudinaryService,
        private configService: ConfigService,
    ) {}

    async registro(datos: CrearUsuarioDto, archivo?: ArchivoSubido) {
        let imagenPerfil: string | undefined;

        if (archivo) {
            if (!archivo.mimetype.startsWith('image/')) {
                throw new BadRequestException('El archivo debe ser una imagen');
            }
            imagenPerfil = await this.cloudinaryService.subirImagen(archivo);
        }

        const usuario = await this.usuariosService.crear({ ...datos, imagenPerfil });
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