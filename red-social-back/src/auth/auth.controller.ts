import {
    Body,
    Controller,
    HttpCode,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ArchivoSubido } from '../cloudinary/cloudinary.service.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('registro')
    @UseInterceptors(
        FileInterceptor('imagenPerfil', { limits: { fileSize: 2 * 1024 * 1024 } }),
    )
    registro(
        @Body() datos: CrearUsuarioDto,
        @UploadedFile() archivo?: ArchivoSubido,
    ) {
        return this.authService.registro(datos, archivo);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() datos: LoginDto) {
        return this.authService.login(datos);
    }
}