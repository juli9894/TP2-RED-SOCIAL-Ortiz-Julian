import { Component, inject, OnInit, signal } from '@angular/core';
import { PUBLICACIONES_POR_PAGINA } from '../../core/constantes';
import { PublicacionesApi } from '../../core/publicaciones-api';
import type { Publicacion } from '../../core/models/publicacion.model';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion/tarjeta-publicacion';
import { NuevaPublicacion } from './nueva-publicacion/nueva-publicacion';
import { ModalConfirmacion } from '../../shared/modal-confirmacion/modal-confirmacion';

@Component({
    imports: [TarjetaPublicacion, NuevaPublicacion, ModalConfirmacion],
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
    // ORDEN elegido, PÁGINA actual (empieza en 0) y si existe una página siguiente
    readonly orden = signal<'fecha' | 'meGusta'>('fecha');
    readonly pagina = signal(0);
    readonly hayMas = signal(false);

    ngOnInit() {
        this.cargar();
    }

    // ─── CICLO LISTAR ───────────────────────────────────────────────

    // [CICLO LISTAR · paso 1/7] Pide al back la página actual
    cargar() {
        this.cargando.set(true);
        this.error.set('');

        this.api
            .listar({
                orden: this.orden(),
                offset: this.pagina() * this.porPagina, //cuantas saltar
                limit: this.porPagina + 1,//Para saber si hay una mas
            })
            .subscribe({
                // [paso 6/7] Llegó la lista
                next: (lista) => {
                    this.hayMas.set(lista.length > this.porPagina);
                    // [paso 7/7] Mostramos solo las primeras porPagina (publicaciones.html las dibuja)
                    this.publicaciones.set(lista.slice(0, this.porPagina));
                    this.cargando.set(false);
                },
                error: () => {
                    this.error.set('No pudimos cargar las publicaciones');
                    this.cargando.set(false);
                },
            });
    }

    // Lo llaman los botones de orden. Al cambiar el orden se vuelve a la página 0
    cambiarOrden(orden: 'fecha' | 'meGusta') {
        this.orden.set(orden);
        this.irAPagina(0);
    }

    // Lo llaman Anterior, Siguiente y el formulario al publicar [CICLO PUBLICAR · paso 7/7]
    irAPagina(pagina: number) {
        this.pagina.set(pagina);
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
            next: () => this.cargar(),

            error: () => this.aviso.set('No pudimos eliminar la publicación'),
        });
    }
}
