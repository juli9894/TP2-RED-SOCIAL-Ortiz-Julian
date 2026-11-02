import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../core/auth';
import { PublicacionesApi, type Publicacion } from '../../core/publicaciones-api';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion/tarjeta-publicacion';

@Component({
    imports: [DatePipe, TarjetaPublicacion],
    selector: 'app-mi-perfil',
    styleUrl: './mi-perfil.css',
    templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
    private api = inject(PublicacionesApi);

    // 1. Mis datos: salen de la sesión guardada, no hace falta pedirlos al back
    readonly usuario = inject(Auth).usuarioActual;

    // 2. Estado de la lista de mis publicaciones
    readonly publicaciones = signal<Publicacion[]>([]);
    readonly cargando = signal(true);
    readonly error = signal('');

    // 3. Angular lo ejecuta una vez, al crear la pantalla
    ngOnInit() {
        const yo = this.usuario();
        if (!yo) {
            this.cargando.set(false);
            return;
        }

        // 4. Mis últimas 3 (el orden por defecto ya es "más recientes primero")
        this.api.listar({ usuario: yo._id, limit: 3 }).subscribe({
            next: (lista) => {
                this.publicaciones.set(lista);
                this.cargando.set(false);
            },
            error: () => {
                this.error.set('No pudimos cargar tus publicaciones');
                this.cargando.set(false);
            },
        });
    }
}