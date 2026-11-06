import {
    Body,
    Controller,
    HttpCode,
    Post,
    UploadedFile,
    UseInterceptors,
    Req,
    UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { LIMITE_IMAGEN_PERFIL_BYTES } from '../common/constantes.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import type { PedidoAutenticado } from './interfaces/payload-token.interface.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // [CICLO REGISTRO · paso 3/6] POST /auth/registro (multipart/form-data)
    @Post('registro')
    @UseInterceptors(
        // FileInterceptor usa multer: separa el archivo ('imagenPerfil', máx. 2 MB) del texto.
        // El archivo queda en req.file y los campos de texto en req.body
        FileInterceptor('imagenPerfil', { limits: { fileSize: LIMITE_IMAGEN_PERFIL_BYTES } }),
    )
    registro(
        @Body() datos: CrearUsuarioDto, // lee req.body (validado por el ValidationPipe de main.ts)
        @UploadedFile() archivo?: ArchivoSubido, // lee req.file
    ) {
        // Usuario creado (sin contraseña) a auth.ts → registro.ts
        return this.authService.registro(datos, archivo);
    }

    // [CICLO LOGIN · paso 3/6] POST /auth/login
    @Post('login')
    @HttpCode(200)
    login(@Body() datos: LoginDto) {
        return this.authService.login(datos);
    }

    // [CICLO SESIÓN] POST /auth/autorizar: responde 200 si el token es válido (el AuthGuard ya lo verificó)
    @Post('autorizar')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    autorizar(@Req() pedido: PedidoAutenticado) {
        return pedido.usuario; // datos del token: id, usuario, perfil
    }

    // [CICLO SESIÓN] POST /auth/refrescar: devuelve un token nuevo (el AuthGuard ya validó el actual)
    @Post('refrescar')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    refrescar(@Req() pedido: PedidoAutenticado) {
        return this.authService.refrescar(pedido.usuario!);
    }
}
