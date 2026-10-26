import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(private usuariosService: UsuariosService) {}

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
        return sinContrasena;
    }

    
}
