import { Component, inject, OnInit, signal } from '@angular/core';
import { delay } from 'rxjs';
import { PUBLICACIONES_POR_PAGINA, RETRASO_SCROLL_MS } from '../../core/constantes';
import { PublicacionesApi } from '../../core/publicaciones-api';
import type { Publicacion } from '../../core/models/publicacion.model';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion/tarjeta-publicacion';
import { NuevaPublicacion } from './nueva-publicacion/nueva-publicacion';
import { ModalConfirmacion } from '../../shared/modal-confirmacion/modal-confirmacion';
import { ScrollInfinitoDirective } from '../../shared/directivas/scroll-infinito.directive';

@Component({
    imports: [TarjetaPublicacion, NuevaPublicacion, ModalConfirmacion, ScrollInfinitoDirective],
    selector: 'app-publicaciones',
    styleUrl: './publicaciones.css',
    templateUrl: './publicaciones.html',
})
export class Publicaciones implements OnInit {
    private api = inject(PublicacionesApi);

    private readonly porPagina = PUBLICACIONES_POR_PAGINA;
    // ESTADO de la pantalla
    readonly publicaciones = signal<Publicacion[]>([]);
    readonly cargando = signal(true);
    readonly error = signal('');
    readonly aviso = signal('');
    readonly idPorEliminar = signal<string | null>(null); 
    // ORDEN elegido, si quedan más publicaciones por traer y si se están trayendo ahora (scroll infinito)
    readonly orden = signal<'fecha' | 'meGusta'>('fecha');
    readonly hayMas = signal(false);
    readonly cargandoMas = signal(false);

    ngOnInit() {
        this.cargar();
    }

    // ─── CICLO LISTAR ───────────────────────────────────────────────

    // [CICLO LISTAR · paso 1/7] 
    cargar() {
        this.cargando.set(true);
        this.error.set('');

        this.api
            .listar({
                orden: this.orden(),
                offset: 0, // desde el principio
                limit: this.porPagina,
            })
            .subscribe({
                // [paso 6/7] Llegó la lista
                next: (lista) => {
                    // Si vino completa (6 de 6) puede haber más; si vino con menos, ya no queda nada
                    this.hayMas.set(lista.length === this.porPagina);
                    // [paso 7/7] La guardamos (publicaciones.html las dibuja)
                    this.publicaciones.set(lista);
                    this.cargando.set(false);
                },
                error: () => {
                    this.error.set('No pudimos cargar las publicaciones');
                    this.cargando.set(false);
                },
            });
    }

    // SCROLL INFINITO: lo llama la directiva cuando el usuario llega al final de la lista.
    // Trae las 6 que siguen: offset = cuántas ya tengo en pantalla. Las agrega al final.
    cargarMas() {
        if (this.cargando() || this.cargandoMas() || !this.hayMas()) return;

        this.cargandoMas.set(true);
        this.api
            .listar({
                orden: this.orden(),
                offset: this.publicaciones().length,
                limit: this.porPagina,
            })
            .pipe(delay(RETRASO_SCROLL_MS)) // pausa corta para que se vea el circulito
            .subscribe({
                next: (lista) => {
                    this.publicaciones.update((actuales) => [...actuales, ...lista]);
                    this.hayMas.set(lista.length === this.porPagina);
                    this.cargandoMas.set(false);
                },
                error: () => {
                    this.aviso.set('No pudimos cargar más publicaciones');
                    this.cargandoMas.set(false);
                },
            });
    }

    // Lo llaman los botones de orden. Al cambiar el orden se vuelve a empezar desde el principio
    cambiarOrden(orden: 'fecha' | 'meGusta') {
        this.orden.set(orden);
        this.cargar();
    }

    // ─── CICLO ME GUSTA ─────────────────────────────────────────────

    // [CICLO ME GUSTA · paso 2/7] Lo llama la tarjeta cuando tocan el corazón
    alternarMeGusta(cambio: { id: string; dar: boolean }) {
        this.aviso.set('');

        const pedido = cambio.dar
            ? this.api.darMeGusta(cambio.id)//post
            : this.api.quitarMeGusta(cambio.id);//delete

        pedido.subscribe({
            // [paso 7/7] El back devolvió los me gusta nuevos: actualizo solo esa publicación
            next: (respuesta) => {
                this.publicaciones.update((lista) =>
                    lista.map((p) =>
                        p._id === respuesta._id
                            ? {
                                  ...p,
                                  meGusta: respuesta.meGusta,
                                  cantidadMeGusta: respuesta.cantidadMeGusta,
                              }//solo cambia meGusta y cantidadMeGusta, el resto queda igual
                            : p,
                    ),
                );
            },
            error: () => this.aviso.set('No pudimos actualizar el me gusta'),
        });
    }

    // ─── CICLO ELIMINAR ─────────────────────────────────────────────

    // [CICLO ELIMINAR · paso 2/8] 
    pedirEliminar(id: string) {
        this.idPorEliminar.set(id);
    }

    // "Cancelar" del modal: cierra la ventana sin hacer nada
    cancelarEliminar() {
        this.idPorEliminar.set(null);
    }

    // [paso 3/8] 
    confirmarEliminar() {
        const id = this.idPorEliminar();
        if (!id) return;
        this.idPorEliminar.set(null);
        this.eliminarPublicacion(id);
    }

    // [paso 4/8] 
    eliminarPublicacion(id: string) {
        this.aviso.set('');

        this.api.eliminar(id).subscribe({
            // [paso 8/8]
            // la saco de la lista en pantalla (sin recargar todo, así no se pierde el scroll)
            next: () => this.publicaciones.update((lista) => lista.filter((p) => p._id !== id)),

            error: () => this.aviso.set('No pudimos eliminar la publicación'),
        });
    }
}
