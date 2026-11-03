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
            // Sube la foto a Cloudinary (valida que sea imagen) y devuelve la URL
            imagenPerfil = await this.cloudinaryService.subirImagen(archivo);
        }

        // Paso 5: crea el usuario en la base con los datos del formulario + la URL de la foto
        const usuario = await this.usuariosService.crear({ ...datos, imagenPerfil });

        // Documento de mongoose → objeto plano, sin la contraseña (no se la mandamos al front)
        const { contrasena, ...sinContrasena } = usuario.toObject();
        return sinContrasena; // vuelve a auth.controller.ts registro()
    }

    // [CICLO LOGIN · paso 4/6]
    async login(datos: LoginDto) {
        // Paso 5: busca por nombre de usuario o por correo
        const usuario = await this.usuariosService.buscarPorUsuarioOCorreo(
            datos.usuarioOCorreo,
        );

        // Compara la contraseña escrita con el hash guardado
        const contrasenaValida = usuario
            ? await bcrypt.compare(datos.contrasena, usuario.contrasena)
            : false;

        // Mismo mensaje si falla el usuario o la contraseña (no revela cuál de los dos)
        if (!usuario || !contrasenaValida) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const { contrasena, ...sinContrasena } = usuario.toObject();

        // El token lleva id, usuario y perfil (ver PayloadToken)
        const token = jwt.sign(
            {
                id: usuario._id.toString(),
                usuario: usuario.usuario,
                perfil: usuario.perfil,
            },
            this.configService.getOrThrow<string>('JWT_SECRET'),
        );

        return { token, usuario: sinContrasena }; // vuelve a auth.ts login() en el front
    }
}
