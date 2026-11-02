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
import { AuthGuard, type PedidoAutenticado } from '../auth/auth.guard.js';
import type { ArchivoSubido } from '../cloudinary/cloudinary.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { PublicacionesService } from './publicaciones.service.js';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private publicacionesService: PublicacionesService) {}

    // POST /publicaciones → crear (con imagen opcional)
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

    // GET /publicaciones → listado (orden, usuario, offset, limit)
    @UseGuards(AuthGuard)
    @Get()
    listar(@Query() filtros: ListarPublicacionesDto) {
        return this.publicacionesService.listar(filtros);
    }

    // DELETE /publicaciones/:id → baja lógica (autor o administrador)
    @UseGuards(AuthGuard)
    @Delete(':id')
    eliminar(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.publicacionesService.eliminar(id, pedido.usuario!);
    }

    // POST /publicaciones/:id/me-gusta → dar me gusta
    @UseGuards(AuthGuard)
    @Post(':id/me-gusta')
    darMeGusta(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.publicacionesService.darMeGusta(id, pedido.usuario!.id);
    }

    // DELETE /publicaciones/:id/me-gusta → quitar me gusta
    @UseGuards(AuthGuard)
    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') id: string, @Req() pedido: PedidoAutenticado) {
        return this.publicacionesService.quitarMeGusta(id, pedido.usuario!.id);
    }
}