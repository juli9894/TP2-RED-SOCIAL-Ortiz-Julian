import { Body, Controller, Post } from '@nestjs/common';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('registro')
    registro(@Body() datos: CrearUsuarioDto) {
        return this.authService.registro(datos);
    }
}