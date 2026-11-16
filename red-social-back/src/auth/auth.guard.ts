import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type { PayloadToken, PedidoAutenticado } from './interfaces/payload-token.interface.js';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const pedido = context.switchToHttp().getRequest<PedidoAutenticado>();//obtiene req de express tipo HTTP

        const cabecera = pedido.headers['authorization'];
        const [tipo, token] = cabecera?.split(' ') ?? [];

        if (tipo !== 'Bearer' || !token) {
            throw new UnauthorizedException('Falta el token');
        }

        try {
            const payload = jwt.verify( 
                token,
                this.configService.getOrThrow<string>('JWT_SECRET'),
            );//corta en encabezado, cuerpo, firma. Recalcula firma contra la que trae el token y lee exp
            if (typeof payload === 'string') {
                throw new Error('Token inválido');
            }
            pedido.usuario = payload as PayloadToken;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }

        return true;//abre la puerta del controlador y pedido.usuario ya tiene los datos del usuario autenticado
    }
}
