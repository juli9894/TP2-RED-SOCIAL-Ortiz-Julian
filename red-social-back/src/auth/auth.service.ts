import { Injectable, UnauthorizedException , ForbiddenException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { DURACION_TOKEN_SEGUNDOS } from '../common/constantes.js';
import { PayloadToken } from './interfaces/payload-token.interface.js';

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

        return { token: this.crearToken(sinContrasena), usuario: sinContrasena };    
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

        if (usuario.habilitado === false) {
            throw new ForbiddenException(
                'Tu cuenta está deshabilitada. Contactá a un administrador.',
            );
        }

        const { contrasena, ...sinContrasena } = usuario.toObject();

        // El token lleva id, usuario y perfil, con firma jwt
        const token = this.crearToken(sinContrasena);
        
        return { token, usuario: sinContrasena }; // auth.ts login() front
    }

    private crearToken(usuario: { _id: { toString(): string }; usuario: string; perfil: string }): string {
        return jwt.sign(
            { id: usuario._id.toString(), usuario: usuario.usuario, perfil: usuario.perfil },
            this.configService.getOrThrow<string>('JWT_SECRET'),
            { expiresIn: DURACION_TOKEN_SEGUNDOS }
        );
    }

    // [CICLO SESIÓN] Devuelve un token nuevo con los mismos datos del token que llegó
    refrescar(payload: PayloadToken) {
        const token = this.crearToken({
            _id: payload.id,
            usuario: payload.usuario,
            perfil: payload.perfil,
        });
        return { token };
    }
}
