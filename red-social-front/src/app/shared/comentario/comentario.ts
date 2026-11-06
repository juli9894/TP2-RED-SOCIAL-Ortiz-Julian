import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../core/auth';
import { ComentariosApi } from '../../core/comentarios-api';
import { mensajeDeError } from '../../core/errores';
import type { Comentario as ComentarioModelo } from '../../core/models/comentario.model';

// Dibuja un comentario: autor, fecha, "(editado)" si fue modificado y el mensaje.
// Si el comentario es del usuario logueado, permite editarlo.
@Component({
    selector: 'app-comentario',
    imports: [DatePipe, ReactiveFormsModule],
    templateUrl: './comentario.html',
    styleUrl: './comentario.css',
})
export class Comentario {
    private auth = inject(Auth);
    private api = inject(ComentariosApi);

    // Dato que RECIBE del padre
    readonly comentario = input.required<ComentarioModelo>();
    // Aviso que ENVÍA al padre cuando el back guardó el cambio
    readonly editado = output<ComentarioModelo>();

    // ¿Es mío? Compara el autor del comentario con el usuario logueado
    protected readonly esMio = computed(
        () => this.comentario().autor._id === this.auth.usuarioActual()?._id,
    );

    protected readonly editando = signal(false);
    protected readonly guardando = signal(false);
    protected readonly error = signal('');
    protected readonly texto = new FormControl('', { nonNullable: true });

    // [CICLO EDITAR COMENTARIO · paso 1] Abre la caja con el texto actual
    protected empezarEdicion() {
        this.texto.setValue(this.comentario().mensaje);
        this.error.set('');
        this.editando.set(true);
    }

    protected cancelar() {
        this.editando.set(false);
    }

    // [paso 2] Botón "Guardar": valida y llama al back
    protected guardar() {
        const mensaje = this.texto.value.trim();
        if (!mensaje) {
            this.error.set('El comentario no puede estar vacío');
            return;
        }
        // Si no cambió nada, no molestamos al back
        if (mensaje === this.comentario().mensaje) {
            this.editando.set(false);
            return;
        }

        this.guardando.set(true);
        this.error.set('');

        this.api.editar(this.comentario()._id, mensaje).subscribe({
            // [paso 3] El back guardó: avisamos al padre con el comentario actualizado.
            // Conservamos el autor que ya teníamos (la respuesta puede no traerlo completo).
            next: (respuesta) => {
                this.editado.emit({
                    ...this.comentario(),
                    mensaje: respuesta.mensaje,
                    modificado: respuesta.modificado,
                });
                this.guardando.set(false);
                this.editando.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.error.set(mensajeDeError(err));
                this.guardando.set(false);
            },
        });
    }
}