import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import type { PedidoAutenticado } from './interfaces/payload-token.interface.js';

// [CICLO ADMIN] Se usa DESPUÉS de AuthGuard: @UseGuards(AuthGuard, AdminGuard).
// AuthGuard ya dejó los datos del token en pedido.usuario; acá solo miramos el perfil.
@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const pedido = context.switchToHttp().getRequest<PedidoAutenticado>();

        if (pedido.usuario?.perfil !== 'administrador') {
            throw new ForbiddenException('Solo los administradores pueden hacer esto');
        }

        return true;
    }
}