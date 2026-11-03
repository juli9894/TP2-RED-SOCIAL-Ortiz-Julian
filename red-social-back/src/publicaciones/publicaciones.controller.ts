import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard.js';
import type { PedidoAutenticado } from '../auth/interfaces/payload-token.interface.js';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { PublicacionesService } from './publicaciones.service.js';

// Todas las rutas llevan @UseGuards(AuthGuard): sin token válido responde 401.
// [CICLO PUBLICAR/LISTAR/ME GUSTA/ELIMINAR · paso 3] pasa por AuthGuard antes de llegar al método
@Controller('publicaciones')
export class PublicacionesController {
    constructor(private publicacionesService: PublicacionesService) {}

    // [CICLO PUBLICAR · paso 4/7] POST /publicaciones → crear (con imagen opcional)
    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(
        FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024 } }),
    )
    crear(
        @Body() datos: CrearPublicacionDto,
        @Req() pedido: PedidoAutenticado,
        @UploadedFile() archivo?: ArchivoSubido,
    ) {
        // El guard ya verificó el token, así que pedido.usuario existe
        return this.publicacionesService.crear(datos, pedido.usuario!.id, archivo);
    }

    // [CICLO LISTAR · paso 4/7] GET /publicaciones → listado (orden, usuario, offset, limit)
    @UseGuards(AuthGuard)
    @Get()
    listar(@Query() filtros: ListarPublicacionesDto) {
        return this.publicacionesService.listar(filtros);
    }

    // [CICLO ELIMINAR · paso 6/8] DELETE /publicaciones/:id → baja lógica (autor o administrador)
    @UseGuards(AuthGuard)
    @Delete(':id')
    eliminar(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.publicacionesService.eliminar(id, pedido.usuario!);
    }

    // [CICLO ME GUSTA · paso 5/7] POST /publicaciones/:id/me-gusta → dar me gusta
    @UseGuards(AuthGuard)
    @Post(':id/me-gusta')
    darMeGusta(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.publicacionesService.darMeGusta(id, pedido.usuario!.id);
    }

    // [CICLO ME GUSTA · paso 5/7] DELETE /publicaciones/:id/me-gusta → quitar me gusta
    @UseGuards(AuthGuard)
    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.publicacionesService.quitarMeGusta(id, pedido.usuario!.id);
    }
}
