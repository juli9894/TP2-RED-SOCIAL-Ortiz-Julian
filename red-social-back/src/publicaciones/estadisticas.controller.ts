import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RangoFechasDto } from './dto/rango-fechas.dts.js';
import { EstadisticasService } from './estadisticas.service.js';

// Solo administradores: primero AuthGuard (401 sin token), después AdminGuard (403 si no es admin)
@UseGuards(AuthGuard, AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
    constructor(private estadisticasService: EstadisticasService) {}

    @Get('publicaciones-por-usuario')
    publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
        return this.estadisticasService.publicacionesPorUsuario(rango);
    }

    @Get('comentarios-por-dia')
    comentariosPorDia(@Query() rango: RangoFechasDto) {
        return this.estadisticasService.comentariosPorDia(rango);
    }

    @Get('comentarios-por-publicacion')
    comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
        return this.estadisticasService.comentariosPorPublicacion(rango);
    }
}