import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { PedidoAutenticado } from '../auth/interfaces/payload-token.interface.js';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { LIMITE_IMAGEN_PERFIL_BYTES } from '../common/constantes.js';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto.js';
import { UsuariosService } from './usuarios.service.js';

// [CICLO ADMIN USUARIOS] Todas las rutas pasan por AuthGuard (¿logueado?) y AdminGuard (¿administrador?)
@UseGuards(AuthGuard, AdminGuard)
@Controller('usuarios')
export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    // GET /usuarios → listado
    @Get()
    listar() {
        return this.usuariosService.listar();
    }

    // POST /usuarios (multipart/form-data) → alta de un usuario con el perfil elegido
    @Post()
    @UseInterceptors(
        FileInterceptor('imagenPerfil', { limits: { fileSize: LIMITE_IMAGEN_PERFIL_BYTES } }),
    )
    crear(
        @Body() datos: CrearUsuarioAdminDto,
        @UploadedFile() archivo?: ArchivoSubido,
    ) {
        return this.usuariosService.crearComoAdmin(datos, archivo);
    }

    // DELETE /usuarios/:id → deshabilitar (baja lógica)
    @Delete(':id')
    deshabilitar(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.usuariosService.cambiarHabilitado(id, false, pedido.usuario!.id);
    }

    // POST /usuarios/:id/habilitar → volver a habilitar (alta lógica)
    @HttpCode(HttpStatus.OK)
    @Post(':id/habilitar')
    habilitar(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.usuariosService.cambiarHabilitado(id, true, pedido.usuario!.id);
    }
}