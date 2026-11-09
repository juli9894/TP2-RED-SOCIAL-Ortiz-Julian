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
import { contrasenasIguales } from '../../core/contraseñas-iguales';


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
        { validators: contrasenasIguales },
    );

    // Para mostrar el campo en rojo solo si está mal y el usuario ya lo tocó
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

    // Lo llama el (change) del campo de la foto: valida y arma la vista previa
    protected seleccionarArchivo(evento: Event) {
        // evento.target es el input donde pasó el cambio; lo casteo para acceder a .files
        const input = evento.target as HTMLInputElement;
        const archivo = input.files?.[0] ?? null; // File o null si no hay nada seleccionado

        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);

        if (!archivo) {
            return;
        }

        // que sea una imagen y no pese más del límite (core/validar-imagen.ts)
        const errorImagen = validarImagen(archivo, LIMITE_IMAGEN_PERFIL_MB);
        if (errorImagen) {
            this.errorArchivo.set(errorImagen);
            input.value = '';
            return;
        }

        this.archivo = archivo;
        // URL temporal con la imagen para mostrarla en la vista previa
        this.vistaPrevia.set(URL.createObjectURL(archivo));
    }

    // [CICLO REGISTRO · paso 1/6] Lo llama el (ngSubmit) del formulario de registro.html
    protected enviar() {
        if (this.formulario.invalid || this.errorArchivo()) {
            this.formulario.markAllAsTouched(); // marca en rojo
            return; // frena el envío
        }

        this.error.set('');
        this.cargando.set(true);

        // repetirContrasena no hace falta mandarla al back: la descartamos
        const { repetirContrasena, ...datos } = this.formulario.getRawValue();

        // El paquete: cada campo de texto + (si hay) la foto con la clave 'imagenPerfil'
        const formData = new FormData();
        Object.entries(datos).forEach(([clave, valor]) => formData.append(clave, valor));
        if (this.archivo) {
            formData.append('imagenPerfil', this.archivo);
        }

        // Paso 2: this.auth.registro() (core/auth.ts) prepara el POST; el subscribe lo envía
        // al back (puerto 3000 en local), endpoint /auth/registro
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
