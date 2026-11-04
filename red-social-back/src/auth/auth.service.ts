import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class AuthService {
    constructor(
        private usuariosService: UsuariosService,
        private cloudinaryService: CloudinaryService,
        private configService: ConfigService,
    ) {}

    // [CICLO REGISTRO · paso 4/6]
    async registro(datos: CrearUsuarioDto, archivo?: ArchivoSubido) {
        let imagenPerfil: string | undefined;

        if (archivo) {
            imagenPerfil = await this.cloudinaryService.subirImagen(archivo);
        }

        const usuario = await this.usuariosService.crear({ ...datos, imagenPerfil });

        const { contrasena, ...sinContrasena } = usuario.toObject();
        //auth.controller.ts registro()
        return sinContrasena;
    }

    // [CICLO LOGIN · paso 4/6]
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

        // El token lleva id, usuario y perfil, con firma jwt
        const token = jwt.sign(
            {
                id: usuario._id.toString(),
                usuario: usuario.usuario,
                perfil: usuario.perfil,
            },
            this.configService.getOrThrow<string>('JWT_SECRET')
        );

        return { token, usuario: sinContrasena }; // auth.ts login() front
    }
}
