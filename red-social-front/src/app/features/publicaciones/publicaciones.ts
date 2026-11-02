import { Component, inject, OnInit, signal } from '@angular/core';
import { PublicacionesApi, type Publicacion } from '../../core/publicaciones-api';
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

    // Cuántas publicaciones se muestran por página (después lo subimos a 5 o 10)
    private readonly porPagina = 6;

    // 1. Estado de la pantalla
    readonly publicaciones = signal<Publicacion[]>([]);
    readonly cargando = signal(true);
    readonly error = signal('');
    readonly aviso = signal('');
    readonly idPorEliminar = signal<string | null>(null);

    // 2. Orden elegido, página actual (empieza en 0) y si existe una página siguiente
    readonly orden = signal<'fecha' | 'meGusta'>('fecha');
    readonly pagina = signal(0);
    readonly hayMas = signal(false);

    ngOnInit() {
        this.cargar();
    }

    cargar() {
        this.cargando.set(true);
        this.error.set('');

        this.api
            .listar({
                orden: this.orden(),
                // 3. offset = cuántas saltear. Página 0 → 0, página 1 → 3, página 2 → 6...
                offset: this.pagina() * this.porPagina,
                // 4. Pedimos UNA DE MÁS para saber si hay página siguiente
                limit: this.porPagina + 1,
            })
            .subscribe({
                next: (lista) => {
                    this.hayMas.set(lista.length > this.porPagina);
                    // 5. Mostramos solo las primeras porPagina
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

    // Lo llaman Anterior, Siguiente y el formulario al publicar
    irAPagina(pagina: number) {
        this.pagina.set(pagina);
        this.cargar();
    }

    // Lo llama la tarjeta cuando tocan el corazón
    alternarMeGusta(cambio: { id: string; dar: boolean }) {
        this.aviso.set('');

        const pedido = cambio.dar
            ? this.api.darMeGusta(cambio.id)
            : this.api.quitarMeGusta(cambio.id);

        pedido.subscribe({
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

        // 1. Lo llama la tarjeta al tocar el tacho: solo guarda el id y abre la ventana
    pedirEliminar(id: string) {
        this.idPorEliminar.set(id);
    }

    // 2. "Cancelar": cierra la ventana sin hacer nada
    cancelarEliminar() {
        this.idPorEliminar.set(null);
    }

    // 3. "Eliminar": cierra la ventana y recién ahora borra
    confirmarEliminar() {
        const id = this.idPorEliminar();
        if (!id) return;
        this.idPorEliminar.set(null);
        this.eliminarPublicacion(id);
    }
        // Lo llama la tarjeta cuando tocan el tacho (recibe el id)
    eliminarPublicacion(id: string) {
        this.aviso.set('');

        // 1. Enviar el DELETE al back
        this.api.eliminar(id).subscribe({
            // 2. Si salió bien, volver a pedir la lista de la página actual
            next: () => this.cargar(),
            // 3. Si falló (por ejemplo 403), mostrar el aviso
            error: () => this.aviso.set('No pudimos eliminar la publicación'),
        });
    }
}
