import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicacionesApi } from '../../../core/publicaciones-api';

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

    // Aviso hacia el padre (publicaciones.html): "ya publiqué, recargá la lista"
    readonly publicada = output<void>();

    // Formulario (el pattern evita textos que sean solo espacios)
    readonly formulario = this.fb.nonNullable.group({
        titulo: ['', [Validators.required, Validators.pattern(/\S/)]],
        mensaje: ['', [Validators.required, Validators.pattern(/\S/)]],
    });

    // El archivo elegido (File) y cosas de la pantalla
    private archivo: File | null = null;
    readonly vistaPrevia = signal<string | null>(null);
    readonly errorArchivo = signal('');
    readonly enviando = signal(false);
    readonly error = signal('');

    // Lo llama el (change) del campo de archivo: valida y arma la vista previa
    seleccionarArchivo(evento: Event) {
        const entrada = evento.target as HTMLInputElement;
        const elegido = entrada.files?.[0];

        this.limpiarArchivo();
        if (!elegido) return;

        if (!elegido.type.startsWith('image/')) {
            this.errorArchivo.set('El archivo debe ser una imagen');
            entrada.value = '';
            return;
        }
        if (elegido.size > 5 * 1024 * 1024) {
            this.errorArchivo.set('La imagen no puede superar los 5 MB');
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

        // Paso 2: this.api.crear() (core/publicaciones-api.ts) prepara el POST; el subscribe lo envía
        this.api.crear(datos).subscribe({
            // [paso 6/7] El back guardó la publicación: limpio el formulario y aviso al padre,
            // que ejecuta irAPagina(0) y vuelve a cargar la lista [paso 7/7]
            next: () => {
                this.formulario.reset();
                this.limpiarArchivo();
                this.enviando.set(false);
                this.publicada.emit();
            },
            error: (err: HttpErrorResponse) => {
                const mensaje = err.error?.message;
                this.error.set(
                    Array.isArray(mensaje)
                        ? mensaje.join('. ')
                        : (mensaje ?? 'No pudimos publicar'),
                );
                this.enviando.set(false);
            },
        });
    }
}
