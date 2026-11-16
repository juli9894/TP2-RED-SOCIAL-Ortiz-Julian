import {
    Body,
    Controller,
    HttpCode,
    Post,
    Put,
    UploadedFile,
    UseInterceptors,
    Req,
    UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { LIMITE_IMAGEN_PERFIL_BYTES } from '../common/constantes.js';
import { ActualizarPerfilDto } from '../usuarios/dto/actualizar-perfil.dto.js';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import type { PedidoAutenticado } from './interfaces/payload-token.interface.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // [CICLO REGISTRO · paso 3/6]
    @Post('registro')
    @UseInterceptors(
        // FileInterceptor usa Multer y lee multipart/form-data 
        FileInterceptor('imagenPerfil', { limits: { fileSize: LIMITE_IMAGEN_PERFIL_BYTES } }),
    )
    registro(
        @Body() datos: CrearUsuarioDto,
        @UploadedFile() archivo?: ArchivoSubido,
    ) {
        return this.authService.registro(datos, archivo);//auth.ts registro al pipe
    }

    // [CICLO LOGIN · paso 3/6] POST /auth/login
    @Post('login')
    @HttpCode(200)
    login(
        @Body() datos: LoginDto
    ) {
        return this.authService.login(datos);
    }

    // [CICLO SESIÓN]
    @Post('autorizar')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    autorizar(@Req() pedido: PedidoAutenticado) {
        return pedido.usuario; 
        //payload del token verificado: id, usuario, perfil, iat, exp
    }

    // [CICLO SESIÓN]
    @Post('refrescar')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    refrescar(@Req() pedido: PedidoAutenticado) {
        return this.authService.refrescar(pedido.usuario!);
    }

    // [CICLO EDITAR PERFIL · paso 3/6] 
    @Put('perfil')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('imagenPerfil', { limits: { fileSize: LIMITE_IMAGEN_PERFIL_BYTES } }),
    )
    actualizarPerfil(
        @Body() datos: ActualizarPerfilDto,
        @Req() pedido: PedidoAutenticado,
        @UploadedFile() archivo?: ArchivoSubido,
    ) {
        return this.authService.actualizarPerfil(pedido.usuario!.id, datos, archivo);
    }
}
