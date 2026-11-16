export interface PayloadToken {
    id: string;
    usuario: string;
    perfil: string;
}

// El pedido (request) después de pasar por AuthGuard:
// pedido.usuario → pedido.usuario.id, pedido.usuario.usuario, pedido.usuario.perfil
export interface PedidoAutenticado {
    headers: Record<string, string | undefined>;
    usuario?: PayloadToken;
}
