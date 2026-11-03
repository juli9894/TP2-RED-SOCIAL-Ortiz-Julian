import { Component, inject, OnInit, signal } from '@angular/core';
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

    // Cuántas publicaciones se muestran por página
    private readonly porPagina = 6;

    // ESTADO de la pantalla
    readonly publicaciones = signal<Publicacion[]>([]);
    readonly cargando = signal(true);
    readonly error = signal('');
    readonly aviso = signal('');
    readonly idPorEliminar = signal<string | null>(null); // id esperando confirmación en el modal

    // ORDEN elegido, PÁGINA actual (empieza en 0) y si existe una página siguiente
    readonly orden = signal<'fecha' | 'meGusta'>('fecha');
    readonly pagina = signal(0);
    readonly hayMas = signal(false);

    // Angular lo ejecuta una vez, al crear la pantalla
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
                // offset = cuántas saltear. Página 0 → 0, página 1 → 6, página 2 → 12...
                offset: this.pagina() * this.porPagina,
                // Pedimos UNA DE MÁS para saber si hay página siguiente
                limit: this.porPagina + 1,
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
            ? this.api.darMeGusta(cambio.id)
            : this.api.quitarMeGusta(cambio.id);

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
                              }
                            : p,
                    ),
                );
            },
            error: () => this.aviso.set('No pudimos actualizar el me gusta'),
        });
    }

    // ─── CICLO ELIMINAR ─────────────────────────────────────────────

    // [CICLO ELIMINAR · paso 2/8] Lo llama la tarjeta al tocar el tacho: guarda el id y abre el modal
    pedirEliminar(id: string) {
        this.idPorEliminar.set(id);
    }

    // "Cancelar" del modal: cierra la ventana sin hacer nada
    cancelarEliminar() {
        this.idPorEliminar.set(null);
    }

    // [paso 3/8] "Eliminar" del modal: cierra la ventana y recién ahora borra
    confirmarEliminar() {
        const id = this.idPorEliminar();
        if (!id) return;
        this.idPorEliminar.set(null);
        this.eliminarPublicacion(id);
    }

    // [paso 4/8] Envía el DELETE al back
    eliminarPublicacion(id: string) {
        this.aviso.set('');

        this.api.eliminar(id).subscribe({
            // [paso 8/8] Salió bien: volver a pedir la lista de la página actual
            next: () => this.cargar(),
            // Si falló (por ejemplo 403), mostrar el aviso
            error: () => this.aviso.set('No pudimos eliminar la publicación'),
        });
    }
}
