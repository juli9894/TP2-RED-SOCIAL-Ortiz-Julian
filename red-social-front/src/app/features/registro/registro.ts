import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { LIMITE_IMAGEN_PERFIL_MB } from '../../core/constantes';
import { mensajeDeError } from '../../core/errores';
import { validarImagen } from '../../core/validar-imagen';
import { contrasenasIguales } from '../../core/contrasenas-iguales';


@Component({
    selector: 'app-registro',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './registro.html',
    styleUrl: './registro.css',
})
export class Registro {
    private fb = inject(FormBuilder);
    private auth = inject(Auth);
    private router = inject(Router);

    protected error = signal('');
    protected cargando = signal(false);
    protected errorArchivo = signal('');
    protected vistaPrevia = signal<string | null>(null);
    private archivo: File | null = null;

    protected formulario = this.fb.nonNullable.group(
        {
            nombre: ['', [Validators.required]],
            apellido: ['', [Validators.required]],
            correo: ['', [Validators.required, Validators.email]],
            usuario: ['', [Validators.required]],
            contrasena: [
                '',
                [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
            ],
            repetirContrasena: ['', [Validators.required]],
            fechaNacimiento: ['', [Validators.required]],
            descripcion: ['', [Validators.required]],
        },
        { validators: contrasenasIguales },//validador personalizado
    );

    protected invalido(campo: string) {
        const control = this.formulario.get(campo);
        return !!control && control.invalid && control.touched;
    }

    protected noCoinciden() {
        return (
            this.formulario.controls.repetirContrasena.touched &&
            this.formulario.hasError('noCoinciden')
        );
    }

    protected seleccionarArchivo(evento: Event) {
        const input = evento.target as HTMLInputElement;
        const archivo = input.files?.[0] ?? null; // File o null si no hay nada seleccionado

        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);

        if (!archivo) {
            return;
        }

        const errorImagen = validarImagen(archivo, LIMITE_IMAGEN_PERFIL_MB);
        if (errorImagen) {
            this.errorArchivo.set(errorImagen);
            input.value = '';
            return;
        }

        this.archivo = archivo;
        // URL temporal de la imagen para vista previa
        this.vistaPrevia.set(URL.createObjectURL(archivo));
    }

    // [CICLO REGISTRO · paso 1/6]
    protected enviar() {
        if (this.formulario.invalid || this.errorArchivo()) {
            this.formulario.markAllAsTouched(); 
            return; // marca en rojo y frena envio
        }

        this.error.set('');
        this.cargando.set(true);

        const { repetirContrasena, ...datos } = this.formulario.getRawValue();

        const formData = new FormData();
        Object.entries(datos).forEach(([clave, valor]) => formData.append(clave, valor));
        if (this.archivo) {
            formData.append('imagenPerfil', this.archivo);
        }

        this.auth.registro(formData).subscribe({
            // [paso 6/6] El back creó el usuario y devolvió token + usuario (auth.ts ya guardó la sesión)
            next: () => {
                this.router.navigate(['/publicaciones']);
            },
            error: (err: HttpErrorResponse) => {
                this.cargando.set(false);
                this.error.set(mensajeDeError(err));
            },
        });
    }
}
