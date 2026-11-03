import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type { PayloadToken, PedidoAutenticado } from './interfaces/payload-token.interface.js';

// [CICLO SESIÓN] Se aplica con @UseGuards(AuthGuard) en las rutas protegidas.
// Lee la cabecera "Authorization: Bearer <token>", verifica el token y,
// si es válido, deja los datos del usuario en pedido.usuario. Si no, responde 401.
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const pedido = context.switchToHttp().getRequest<PedidoAutenticado>();

        const cabecera = pedido.headers['authorization'];
        const [tipo, token] = cabecera?.split(' ') ?? [];

        if (tipo !== 'Bearer' || !token) {
            throw new UnauthorizedException('Falta el token');
        }

        try {
            const payload = jwt.verify(
                token,
                this.configService.getOrThrow<string>('JWT_SECRET'),
            );
            if (typeof payload === 'string') {
                throw new Error('Token inválido');
            }
            pedido.usuario = payload as PayloadToken;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }

        return true;
    }
}
