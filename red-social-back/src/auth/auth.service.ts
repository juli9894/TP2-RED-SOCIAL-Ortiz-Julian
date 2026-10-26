import { Injectable } from '@nestjs/common';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class AuthService {
    constructor(private usuariosService: UsuariosService) {}

    async registro(datos: CrearUsuarioDto) {
        const usuario = await this.usuariosService.crear(datos);
        const { contrasena, ...sinContrasena } = usuario.toObject();
        return sinContrasena;
    }
}