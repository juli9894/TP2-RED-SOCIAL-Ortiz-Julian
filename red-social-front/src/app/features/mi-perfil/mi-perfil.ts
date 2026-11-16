import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';
import { delay } from 'rxjs';
import {
    LIMITE_IMAGEN_PERFIL_MB,
    PUBLICACIONES_EN_MI_PERFIL,
    PUBLICACIONES_POR_PAGINA,
    RETRASO_SCROLL_MS,
} from '../../core/constantes';
import { mensajeDeError } from '../../core/errores';
import { validarImagen } from '../../core/validar-imagen';
import { PublicacionesApi } from '../../core/publicaciones-api';
import type { Publicacion } from '../../core/models/publicacion.model';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion/tarjeta-publicacion';
import { EdadPipe } from '../../shared/pipes/edad.pipe';
import { ScrollInfinitoDirective } from '../../shared/directivas/scroll-infinito.directive';

@Component({
    imports: [DatePipe, ReactiveFormsModule, TarjetaPublicacion, EdadPipe, ScrollInfinitoDirective],
    selector: 'app-mi-perfil',
    styleUrl: './mi-perfil.css',
    templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
    private api = inject(PublicacionesApi);
    private auth = inject(Auth);
    private fb = inject(FormBuilder);

    readonly usuario = this.auth.usuarioActual;

    readonly publicaciones = signal<Publicacion[]>([]);
    readonly cargando = signal(true);
    readonly error = signal('');

    readonly hayMas = signal(false);
    readonly cargandoMas = signal(false);

    // ─── EDITAR PERFIL: estado del formulario ───────────────────────
    readonly editando = signal(false);
    readonly guardando = signal(false);
    readonly errorEdicion = signal('');
    readonly errorArchivo = signal('');
    readonly vistaPrevia = signal<string | null>(null);
    readonly quitarFoto = signal(false);
    readonly limiteFotoMb = LIMITE_IMAGEN_PERFIL_MB;
    private archivo: File | null = null;

    // Mismos campos y validaciones que el registro, menos la contraseña
    readonly formulario = this.fb.nonNullable.group({
        nombre: ['', [Validators.required]],
        apellido: ['', [Validators.required]],
        correo: ['', [Validators.required, Validators.email]],
        usuario: ['', [Validators.required]],
        fechaNacimiento: ['', [Validators.required]],
        descripcion: ['', [Validators.required]],
    });

    // [CICLO MI PERFIL · paso 1/6] 
    ngOnInit() {
        this.cargarPublicaciones();
    }

    private cargarPublicaciones() {
        const yo = this.usuario();
        if (!yo) {
            this.cargando.set(false);
            return;
        }

        this.cargando.set(true);
        this.error.set('');

        this.api.listar({ usuario: yo._id, limit: PUBLICACIONES_EN_MI_PERFIL }).subscribe({

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

    cargarMas() {
        const yo = this.usuario();
        if (!yo || this.cargandoMas() || !this.hayMas()) return;

        this.cargandoMas.set(true);
        this.api
            .listar({
                usuario: yo._id,
                offset: this.publicaciones().length,
                limit: PUBLICACIONES_POR_PAGINA,
            })
            .pipe(delay(RETRASO_SCROLL_MS)) 
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

    // ─── [CICLO EDITAR PERFIL] ──────────────────────────────────────

    abrirEdicion() {
        const yo = this.usuario();
        if (!yo) return;

        this.formulario.reset({
            nombre: yo.nombre,
            apellido: yo.apellido,
            correo: yo.correo,
            usuario: yo.usuario,
            fechaNacimiento: yo.fechaNacimiento.slice(0, 10), // "1995-03-20T00:00..." → "1995-03-20" (lo que entiende <input type="date">)
            descripcion: yo.descripcion,
        });
        this.reiniciarFoto();
        this.errorEdicion.set('');
        this.editando.set(true);
    }

    cancelarEdicion() {
        this.editando.set(false);
    }

    invalido(campo: string) {
        const control = this.formulario.get(campo);
        return !!control && control.invalid && control.touched;
    }

    fotoMostrada(): string | null {
        if (this.vistaPrevia()) return this.vistaPrevia();
        if (this.quitarFoto()) return null;
        return this.usuario()?.imagenPerfil ?? null;
    }

    seleccionarArchivo(evento: Event) {
        const input = evento.target as HTMLInputElement;
        const archivo = input.files?.[0] ?? null;
        if (!archivo) return;

        const errorImagen = validarImagen(archivo, LIMITE_IMAGEN_PERFIL_MB);
        if (errorImagen) {
            this.errorArchivo.set(errorImagen);
            input.value = '';
            return;
        }

        this.errorArchivo.set('');
        this.archivo = archivo;
        this.quitarFoto.set(false);
        this.vistaPrevia.set(URL.createObjectURL(archivo));
    }

    pedirQuitarFoto(input: HTMLInputElement) {
        input.value = '';
        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);
        this.quitarFoto.set(true);
    }

    private reiniciarFoto() {
        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);
        this.quitarFoto.set(false);
    }

    // [paso 2/6]
    guardar() {
        if (this.formulario.invalid || this.errorArchivo()) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.errorEdicion.set('');
        this.guardando.set(true);

        const formData = new FormData();
        Object.entries(this.formulario.getRawValue()).forEach(([clave, valor]) =>
            formData.append(clave, valor),
        );
        if (this.archivo) {
            formData.append('imagenPerfil', this.archivo); // foto nueva
        } else if (this.quitarFoto()) {
            formData.append('quitarImagen', 'true'); 
        }

        this.auth.actualizarPerfil(formData).subscribe({
            // [paso 6/6]
            next: () => {
                this.guardando.set(false);
                this.editando.set(false);
                this.cargarPublicaciones(); 
            },
            error: (err: HttpErrorResponse) => {
                this.guardando.set(false);
                this.errorEdicion.set(mensajeDeError(err));
            },
        });
    }
}
