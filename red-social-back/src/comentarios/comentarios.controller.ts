import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import type { PedidoAutenticado } from '../auth/interfaces/payload-token.interface.js';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';


// Todas las rutas llevan @UseGuards(AuthGuard): sin token válido responde 401.
@Controller()
export class ComentariosController {
    constructor(private comentariosService: ComentariosService) {}

    // [CICLO COMENTAR] POST /publicaciones/:id/comentarios
    @UseGuards(AuthGuard)
    @Post('publicaciones/:id/comentarios')
    crear(
        @Param('id') id: string,
        @Body() datos: CrearComentarioDto,
        @Req() pedido: PedidoAutenticado,
    ) {
        return this.comentariosService.crear(id, datos, pedido.usuario!.id);
    }

    // [CICLO LISTAR COMENTARIOS] GET /publicaciones/:id/comentarios?offset=0&limit=10
    @UseGuards(AuthGuard)
    @Get('publicaciones/:id/comentarios')
    listar(@Param('id') id: string, @Query() filtros: ListarComentariosDto) {
        return this.comentariosService.listar(id, filtros);
    }

        // [CICLO EDITAR COMENTARIO] PUT /comentarios/:id
    @UseGuards(AuthGuard)
    @Put('comentarios/:id')
    editar(
        @Param('id') id: string,
        @Body() datos: CrearComentarioDto,
        @Req() pedido: PedidoAutenticado,
    ) {
        return this.comentariosService.editar(id, datos, pedido.usuario!.id);
    }
}