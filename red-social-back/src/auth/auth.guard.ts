import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

//estructura del payload que se espera en el token
export interface PayloadToken {
    id: string;
    usuario: string;
    perfil: string;
}

//req.ususario -> req.usuario.id, req.usuario.usuario, req.usuario.perfil
export interface PedidoAutenticado {
    headers: Record<string, string | undefined>;
    usuario?: PayloadToken;
}

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