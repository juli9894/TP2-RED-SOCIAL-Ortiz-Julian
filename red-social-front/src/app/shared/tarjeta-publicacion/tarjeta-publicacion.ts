import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { Auth } from '../../core/auth';
import type { Publicacion } from '../../core/models/publicacion.model';

@Component({
    selector: 'app-tarjeta-publicacion',
    imports: [DatePipe],
    templateUrl: './tarjeta-publicacion.html',
    styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion {
    private auth = inject(Auth);

    // ENTRADAS: datos que RECIBE del padre
    readonly publicacion = input.required<Publicacion>();
    readonly soloLectura = input(false); // si es true, no se puede tocar el corazón ni eliminar

    // SALIDAS: avisos que ENVÍA al padre
    // dar = true → quiero darle me gusta; false → quiero quitarlo
    readonly alternarMeGusta = output<{ id: string; dar: boolean }>();
    // manda el id de la publicación que se quiere eliminar
    readonly eliminar = output<string>();

    // CALCULADOS: se recalculan solos si cambia la publicación o la sesión
    // ¿Yo ya le di me gusta?
    readonly yaMeGusta = computed(() => {
        const yo = this.auth.usuarioActual();
        return yo ? this.publicacion().meGusta.includes(yo._id) : false;
    });

    // ¿Puedo eliminarla? Solo si soy el autor o administrador (igual que el back)
    readonly puedeEliminar = computed(() => {
        if (this.soloLectura()) return false;
        const yo = this.auth.usuarioActual();
        if (!yo) return false;
        return yo._id === this.publicacion().autor._id || yo.perfil === 'administrador';
    });

    // [CICLO ME GUSTA · paso 1/7] Lo llama el click del corazón
    tocarCorazon() {
        this.alternarMeGusta.emit({
            id: this.publicacion()._id,
            dar: !this.yaMeGusta(),
        });
    }

    // [CICLO ELIMINAR · paso 1/8] Lo llama el click del tacho
    tocarEliminar() {
        this.eliminar.emit(this.publicacion()._id);
    }
}
