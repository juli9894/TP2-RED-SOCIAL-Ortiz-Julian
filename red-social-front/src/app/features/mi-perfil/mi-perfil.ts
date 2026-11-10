import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/auth';
import { PUBLICACIONES_EN_MI_PERFIL, PUBLICACIONES_POR_PAGINA } from '../../core/constantes';
import { PublicacionesApi } from '../../core/publicaciones-api';
import type { Publicacion } from '../../core/models/publicacion.model';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion/tarjeta-publicacion';
import { EdadPipe } from '../../shared/pipes/edad.pipe';

@Component({
    imports: [DatePipe, TarjetaPublicacion, EdadPipe],
    selector: 'app-mi-perfil',
    styleUrl: './mi-perfil.css',
    templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
    private api = inject(PublicacionesApi);

    // Mis datos: salen de la sesión guardada, no hace falta pedirlos al back
    readonly usuario = inject(Auth).usuarioActual;

    // Estado de la lista de mis publicaciones
    readonly publicaciones = signal<Publicacion[]>([]);
    readonly cargando = signal(true);
    readonly error = signal('');

    // "Ver más": si la última tanda vino completa, puede haber más para traer
    readonly hayMas = signal(false);
    readonly cargandoMas = signal(false);

    // [CICLO MI PERFIL · paso 1/6] Angular lo ejecuta una vez, al crear la pantalla
    ngOnInit() {
        const yo = this.usuario();
        if (!yo) {
            this.cargando.set(false);
            return;
        }

        // Paso 2: mismo GET /publicaciones del CICLO LISTAR, pero filtrado por mi _id.
        this.api.listar({ usuario: yo._id, limit: PUBLICACIONES_EN_MI_PERFIL }).subscribe({
            // [paso 6/6] Llegaron mis publicaciones (mi-perfil.html las dibuja en modo solo lectura)
            next: (lista) => {
                this.publicaciones.set(lista);
                this.hayMas.set(lista.length === PUBLICACIONES_EN_MI_PERFIL);
                this.cargando.set(false);
            },
            error: () => {
                this.error.set('No pudimos cargar tus publicaciones');
                this.cargando.set(false);
            },
        });
    }

    // Trae las que siguen: offset = cuántas ya tengo en pantalla
    verMas() {
        const yo = this.usuario();
        if (!yo || this.cargandoMas()) return;

        this.cargandoMas.set(true);
        this.api
            .listar({
                usuario: yo._id,
                offset: this.publicaciones().length,
                limit: PUBLICACIONES_POR_PAGINA,
            })
            .subscribe({
                next: (lista) => {
                    // Agrego al final, sin borrar las que ya estaban
                    this.publicaciones.update((actuales) => [...actuales, ...lista]);
                    this.hayMas.set(lista.length === PUBLICACIONES_POR_PAGINA);
                    this.cargandoMas.set(false);
                },
                error: () => {
                    this.error.set('No pudimos cargar más publicaciones');
                    this.cargandoMas.set(false);
                },
            });
    }
}