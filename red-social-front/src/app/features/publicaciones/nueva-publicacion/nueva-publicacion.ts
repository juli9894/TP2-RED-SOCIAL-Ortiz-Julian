import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LIMITE_IMAGEN_PUBLICACION_MB, MAX_MENSAJE_PUBLICACION, MAX_TITULO } from '../../../core/constantes';
import { mensajeDeError } from '../../../core/errores';
import { PublicacionesApi } from '../../../core/publicaciones-api';
import { validarImagen } from '../../../core/validar-imagen';


@Component({
    selector: 'app-nueva-publicacion',
    imports: [ReactiveFormsModule],
    templateUrl: './nueva-publicacion.html',
    styleUrl: './nueva-publicacion.css',
})
export class NuevaPublicacion {
    private fb = inject(FormBuilder);
    private api = inject(PublicacionesApi);

    // Acceso al <input type="file" #entradaArchivo> del HTML
    private entradaArchivo = viewChild<ElementRef<HTMLInputElement>>('entradaArchivo');

    readonly publicada = output<void>();

    // true = el formulario está desplegado; false = solo se ve la barra "Contá tu problema"
    readonly abierto = signal(false);

    protected readonly maxTitulo = MAX_TITULO;
    protected readonly maxMensaje = MAX_MENSAJE_PUBLICACION;

    readonly formulario = this.fb.nonNullable.group({
        titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_TITULO)]],
        mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_MENSAJE_PUBLICACION)]],
    });

    private archivo: File | null = null;
    readonly vistaPrevia = signal<string | null>(null);
    readonly errorArchivo = signal('');
    readonly enviando = signal(false);
    readonly error = signal('');

    // Lo llaman la barra de arriba y el botón Cancelar de nueva-publicacion.html
    alternar() {
        this.abierto.update((valor) => !valor);
    }

    seleccionarArchivo(evento: Event) {
        const entrada = evento.target as HTMLInputElement;
        const elegido = entrada.files?.[0];

        this.limpiarArchivo();
        if (!elegido) return;
        // que sea una imagen y no pese más del límite (core/validar-imagen.ts)
        const errorImagen = validarImagen(elegido, LIMITE_IMAGEN_PUBLICACION_MB);
        if (errorImagen) {
            this.errorArchivo.set(errorImagen);
            entrada.value = '';
            return;
        }

        this.archivo = elegido;
        this.vistaPrevia.set(URL.createObjectURL(elegido));
    }

    limpiarArchivo() {
        const vista = this.vistaPrevia();
        if (vista) URL.revokeObjectURL(vista);
        this.archivo = null;
        this.vistaPrevia.set(null);
        this.errorArchivo.set('');
        const entrada = this.entradaArchivo();
        if (entrada) entrada.nativeElement.value = '';
    }

    // [CICLO PUBLICAR · paso 1/7] Lo llama el (ngSubmit) del formulario de nueva-publicacion.html
    enviar() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }
        this.enviando.set(true);
        this.error.set('');

        // El paquete: texto + archivo. 'imagen' es el nombre que espera el back (FileInterceptor)
        const datos = new FormData();
        datos.append('titulo', this.formulario.controls.titulo.value.trim());
        datos.append('mensaje', this.formulario.controls.mensaje.value.trim());
        if (this.archivo) {
            datos.append('imagen', this.archivo);
        }

        // Paso 2: this.api.crear() 
        this.api.crear(datos).subscribe({
            // [paso 6/7] El back guardó la publicación: limpio el formulario y aviso al padre,
            // que ejecuta irAPagina(0) y vuelve a cargar la lista [paso 7/7]
            next: () => {
                this.formulario.reset();
                this.limpiarArchivo();
                this.enviando.set(false);
                this.abierto.set(false); // al publicar, el formulario se pliega solo
                this.publicada.emit();//dispara el output, que el padre escucha con (publicada)
            },
            error: (err: HttpErrorResponse) => {
                this.error.set(mensajeDeError(err, 'No pudimos publicar'));
                this.enviando.set(false);
            },
        });
    }
}
