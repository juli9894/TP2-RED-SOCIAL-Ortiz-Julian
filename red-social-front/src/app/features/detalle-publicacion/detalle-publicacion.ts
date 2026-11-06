import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComentariosApi } from '../../core/comentarios-api';
import { COMENTARIOS_POR_PAGINA } from '../../core/constantes';
import { mensajeDeError } from '../../core/errores';
import type { Comentario as ComentarioModelo } from '../../core/models/comentario.model';
import type { Publicacion } from '../../core/models/publicacion.model';
import { PublicacionesApi } from '../../core/publicaciones-api';
import { Comentario } from '../../shared/comentario/comentario';
import { ModalConfirmacion } from '../../shared/modal-confirmacion/modal-confirmacion';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion/tarjeta-publicacion';

// [CICLO DETALLE] Pantalla de una publicación: la lee del id que viene en la dirección
@Component({
    selector: 'app-detalle-publicacion',
    imports: [RouterLink, ReactiveFormsModule, TarjetaPublicacion, Comentario, ModalConfirmacion],
    templateUrl: './detalle-publicacion.html',
    styleUrl: './detalle-publicacion.css',
})
export class DetallePublicacion implements OnInit {
    private ruta = inject(ActivatedRoute);
    private router = inject(Router);
    private api = inject(PublicacionesApi);
    private comentariosApi = inject(ComentariosApi);
    private id = '';

    protected publicacion = signal<Publicacion | null>(null);
    protected cargando = signal(true);
    protected error = signal('');
    protected aviso = signal(''); // errores de las acciones (me gusta, eliminar)
    protected confirmandoEliminar = signal(false);

    protected comentarios = signal<ComentarioModelo[]>([]);
    protected hayMas = signal(false); // true mientras el back siga devolviendo páginas completas
    protected cargandoComentarios = signal(false);
    protected errorComentarios = signal('');

    // Caja para escribir un comentario nuevo
    protected textoComentario = new FormControl('', { nonNullable: true });
    protected enviandoComentario = signal(false);
    protected errorEnvio = signal('');

    ngOnInit() {
        // El :id de la dirección /publicaciones/:id
        this.id = this.ruta.snapshot.paramMap.get('id') ?? '';

        this.api.obtener(this.id).subscribe({
            next: (publicacion) => {
                this.publicacion.set(publicacion);
                this.cargando.set(false);
                this.cargarComentarios();
            },
            error: (err: HttpErrorResponse) => {
                this.error.set(mensajeDeError(err));
                this.cargando.set(false);
            },
        });
    }

    // ─── ME GUSTA ───────────────────────────────────────────────────

    // [CICLO ME GUSTA] Igual que en el feed: llama al back y actualiza solo los me gusta
    protected alternarMeGusta(cambio: { id: string; dar: boolean }) {
        this.aviso.set('');

        const pedido = cambio.dar
            ? this.api.darMeGusta(cambio.id)
            : this.api.quitarMeGusta(cambio.id);

        pedido.subscribe({
            next: (respuesta) => {
                this.publicacion.update((p) =>
                    p
                        ? {
                              ...p,
                              meGusta: respuesta.meGusta,
                              cantidadMeGusta: respuesta.cantidadMeGusta,
                          }
                        : p,
                );
            },
            error: () => this.aviso.set('No pudimos actualizar el me gusta'),
        });
    }

    // ─── ELIMINAR ───────────────────────────────────────────────────

    // [CICLO ELIMINAR] Abre el modal de confirmación
    protected pedirEliminar() {
        this.confirmandoEliminar.set(true);
    }

    protected cancelarEliminar() {
        this.confirmandoEliminar.set(false);
    }

    // Si el back la elimina, la publicación ya no existe: se vuelve al feed
    protected confirmarEliminar() {
        this.confirmandoEliminar.set(false);
        this.aviso.set('');

        this.api.eliminar(this.id).subscribe({
            next: () => this.router.navigate(['/publicaciones']),
            error: () => this.aviso.set('No pudimos eliminar la publicación'),
        });
    }

    // ─── COMENTARIOS ────────────────────────────────────────────────

    // [CICLO LISTAR COMENTARIOS] Trae la siguiente tanda y la suma a las que ya están
    // El offset (cuántos saltear) es la cantidad de comentarios que ya tenemos en pantalla
    protected cargarComentarios() {
        this.cargandoComentarios.set(true);
        this.errorComentarios.set('');

        this.comentariosApi
            .listar(this.id, this.comentarios().length, COMENTARIOS_POR_PAGINA)
            .subscribe({
                next: (nuevos) => {
                    this.comentarios.update((actuales) => [...actuales, ...nuevos]);
                    // Si llegó una página incompleta, ya no quedan más
                    this.hayMas.set(nuevos.length === COMENTARIOS_POR_PAGINA);
                    this.cargandoComentarios.set(false);
                },
                error: (err: HttpErrorResponse) => {
                    this.errorComentarios.set(mensajeDeError(err));
                    this.cargandoComentarios.set(false);
                },
            });
    }

    // [CICLO COMENTAR · paso 1] Lo llama el botón "Comentar"
    protected comentar() {
        const mensaje = this.textoComentario.value.trim();
        if (!mensaje) {
            this.errorEnvio.set('Escribí algo antes de comentar');
            return;
        }

        this.enviandoComentario.set(true);
        this.errorEnvio.set('');

        this.comentariosApi.crear(this.id, mensaje).subscribe({
            next: (nuevo) => {
                // El comentario nuevo es el más reciente: va arriba de la lista
                this.comentarios.update((actuales) => [nuevo, ...actuales]);
                // Suma 1 al contador que muestra la tarjeta
                this.publicacion.update((p) =>
                    p ? { ...p, cantidadComentarios: p.cantidadComentarios + 1 } : p,
                );
                this.textoComentario.reset();
                this.enviandoComentario.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.errorEnvio.set(mensajeDeError(err));
                this.enviandoComentario.set(false);
            },
        });
    }

    // [CICLO EDITAR COMENTARIO · paso 4] El componente avisó que el back guardó el cambio:
    // reemplazo ese comentario en la lista (mismo _id) y dejo los demás como están
    protected reemplazarComentario(actualizado: ComentarioModelo) {
        this.comentarios.update((lista) =>
            lista.map((c) => (c._id === actualizado._id ? actualizado : c)),
        );
    }
}