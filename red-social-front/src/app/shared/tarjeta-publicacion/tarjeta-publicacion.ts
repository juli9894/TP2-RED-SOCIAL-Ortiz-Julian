import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Auth } from '../../core/auth';
import type { Publicacion } from '../../core/publicaciones-api';

@Component({
    selector: 'app-tarjeta-publicacion',
    imports: [DatePipe],
    templateUrl: './tarjeta-publicacion.html',
    styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion {
    private auth = inject(Auth);
    // 1. Dato que RECIBE del padre
    readonly publicacion = input.required<Publicacion>();
    readonly soloLectura = input(false); // si es true, no se puede tocar el corazón ni eliminar
    // 2. Aviso que ENVÍA al padre: "toqué el corazón de esta publicación"
    // dar = true → quiero darle me gusta; false → quiero quitarlo
    readonly alternarMeGusta = output<{ id: string; dar: boolean }>();
    // 3. ¿Yo ya le di me gusta? Se recalcula solo si cambia la publicación o la sesión
    readonly yaMeGusta = computed(() => {
        const yo = this.auth.usuarioActual();
        return yo ? this.publicacion().meGusta.includes(yo._id) : false;
    });
    // 3b. Aviso que ENVÍA al padre: "quiero eliminar esta publicación" (manda el id)
    readonly eliminar = output<string>();

    // 3c. ¿Puedo eliminarla? Solo si soy el autor o administrador (igual que el back)
    readonly puedeEliminar = computed(() => {
        if (this.soloLectura()) return false;
        const yo = this.auth.usuarioActual();
        if (!yo) return false;
        return yo._id === this.publicacion().autor._id || yo.perfil === 'administrador';
    });
    // 4. Lo llama el click del corazón
    tocarCorazon() {
        this.alternarMeGusta.emit({
            id: this.publicacion()._id,
            dar: !this.yaMeGusta(),
        });
    }

    // 5. Lo llama el click del tacho
    tocarEliminar() {
        this.eliminar.emit(this.publicacion()._id);
    }
}