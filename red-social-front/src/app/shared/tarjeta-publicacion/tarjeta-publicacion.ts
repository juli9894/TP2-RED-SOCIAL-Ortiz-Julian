import { DatePipe } from '@angular/common';
import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import type { Publicacion } from '../../core/models/publicacion.model';

const ZOOM_MAXIMO = 4;

@Component({
    selector: 'app-tarjeta-publicacion',
    imports: [DatePipe, RouterLink],
    templateUrl: './tarjeta-publicacion.html',
    styleUrl: './tarjeta-publicacion.css',
})
export class TarjetaPublicacion {
    private auth = inject(Auth);
    private router = inject(Router);

    readonly publicacion = input.required<Publicacion>();
    readonly soloLectura = input(false); // si es true, no se puede tocar el corazón ni eliminar
    readonly enlaceDetalle = input(true); // si es false, la tarjeta no abre el detalle (lo usa la propia pantalla de detalle)

    readonly alternarMeGusta = output<{ id: string; dar: boolean }>();
    readonly eliminar = output<string>();

    // ─── Visor de imagen ────────────────────────────────────────────
    readonly imagenAmpliada = signal(false);
    readonly zoom = signal(1); // 1 = imagen entera en pantalla
    private readonly desplazamiento = signal({ x: 0, y: 0 }); // cuánto se arrastró la imagen
    private arrastrando = false;
    private origenArrastre = { x: 0, y: 0 };

    readonly porcentajeZoom = computed(() => Math.round(this.zoom() * 100));
    // Combina el desplazamiento y el zoom en una sola transformación CSS
    // Combina el desplazamiento y el zoom en una sola transformación CSS.
    // Sin zoom no se aplica ninguna: el navegador repinta la imagen normal
    readonly transformacion = computed(() => {
        if (this.zoom() === 1) {
            return 'none';
        }
        const { x, y } = this.desplazamiento();
        return `translate(${x}px, ${y}px) scale(${this.zoom()})`;
    });

    readonly yaMeGusta = computed(() => {
        const yo = this.auth.usuarioActual();
        return yo ? this.publicacion().meGusta.includes(yo._id) : false;
    });

    readonly puedeEliminar = computed(() => {
        if (this.soloLectura()) return false;
        const yo = this.auth.usuarioActual();
        if (!yo) return false;
        return yo._id === this.publicacion().autor._id || yo.perfil === 'administrador';
    });

    // [CICLO DETALLE] Click en cualquier parte de la tarjeta: abre /publicaciones/:id
    // No abre si el click fue sobre un botón, un enlace o la imagen, ni si se está seleccionando texto
    abrirDetalle(evento: MouseEvent) {
        if (!this.enlaceDetalle()) return;

        const destino = evento.target as HTMLElement;
        if (destino.closest('button, a, .tarjeta-imagen')) return;
        if (window.getSelection()?.toString()) return;

        this.router.navigate(['/publicaciones', this.publicacion()._id]);
    }

    ampliarImagen() {
        this.reiniciarZoom();
        this.imagenAmpliada.set(true);
    }

    // Se cierra con la X, tocando el fondo oscuro o con la tecla Esc
    @HostListener('document:keydown.escape')
    cerrarImagen() {
        this.imagenAmpliada.set(false);
    }

    // Cierra solo si el click fue en el fondo (no en los botones ni en la imagen)
    cerrarSiEsFondo(evento: MouseEvent) {
        if (evento.target === evento.currentTarget) {
            this.cerrarImagen();
        }
    }

    // Suma o resta zoom entre 1 (imagen entera) y ZOOM_MAXIMO
    cambiarZoom(variacion: number) {
        const nuevo = Math.min(ZOOM_MAXIMO, Math.max(1, this.zoom() + variacion));
        this.zoom.set(nuevo);
        if (nuevo === 1) {
            this.desplazamiento.set({ x: 0, y: 0 }); // sin zoom la imagen vuelve al centro
        }
    }

    reiniciarZoom() {
        this.zoom.set(1);
        this.desplazamiento.set({ x: 0, y: 0 });
    }

    // Rueda del mouse sobre la imagen: hacia arriba acerca, hacia abajo aleja
    ruedaSobreImagen(evento: WheelEvent) {
        evento.preventDefault();
        this.cambiarZoom(evento.deltaY < 0 ? 0.25 : -0.25);
    }

    // Doble clic: acerca; otro doble clic vuelve al tamaño original
    dobleClickImagen() {
        if (this.zoom() === 1) {
            this.cambiarZoom(1.5);
        } else {
            this.reiniciarZoom();
        }
    }

    // Arrastrar la imagen (solo cuando está acercada)
    iniciarArrastre(evento: PointerEvent) {
        if (this.zoom() === 1) return;
        this.arrastrando = true;
        const { x, y } = this.desplazamiento();
        this.origenArrastre = { x: evento.clientX - x, y: evento.clientY - y };
        (evento.target as HTMLElement).setPointerCapture(evento.pointerId);
    }

    arrastrar(evento: PointerEvent) {
        if (!this.arrastrando) return;
        this.desplazamiento.set({
            x: evento.clientX - this.origenArrastre.x,
            y: evento.clientY - this.origenArrastre.y,
        });
    }

    terminarArrastre() {
        this.arrastrando = false;
    }

    // [CICLO ME GUSTA · paso 1/7] Lo llama el click del corazón
    tocarCorazon() {
        this.alternarMeGusta.emit({
            id: this.publicacion()._id,
            dar: !this.yaMeGusta(),
        });
    }

    // [CICLO ELIMINAR · paso 1/8]
    tocarEliminar() {
        this.eliminar.emit(this.publicacion()._id);
    }
}