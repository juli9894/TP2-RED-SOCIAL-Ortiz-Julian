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
        FileInterceptor('imagenPerfil', { limits: { fileSize: 2 * 1024 * 1024 } }),//busca imagen y separa texto, usa multer para manejar multipart/form-data, limita el tamaño del archivo a 2 MB
    )//pasa al request, en req.file, el archivo subido, y en req.body, los datos del formulario
    registro(
        @Body() datos: CrearUsuarioDto, //lee req.body
        @UploadedFile() archivo?: ArchivoSubido, //lee req.file
    ) {
        return this.authService.registro(datos, archivo);//devuelve el usuario creado sin la contraseña, a auth.ts registro()
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() datos: LoginDto) {
        return this.authService.login(datos);
    }
}