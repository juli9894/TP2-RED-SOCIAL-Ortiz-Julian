import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('registro')
    registro(@Body() datos: CrearUsuarioDto) {
        return this.authService.registro(datos);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() datos: LoginDto) {
        return this.authService.login(datos);
    }
}