import { Component, inject, signal } from '@angular/core';
import { AbstractControl , FormBuilder , ReactiveFormsModule , ValidationErrors , Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';

function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
    const contrasena = grupo.get('contrasena')?.value;
    const repetir = grupo.get('repetirContrasena')?.value;
    return contrasena === repetir ? null : { noCoinciden: true };
}

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
        const archivo = input.files?.[0] ?? null;

        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);

        if (!archivo) {
            return;
        }

        if (!archivo.type.startsWith('image/')) {
            this.errorArchivo.set('El archivo debe ser una imagen.');
            input.value = '';
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            this.errorArchivo.set('La imagen no puede pesar más de 2 MB.');
            input.value = '';
            return;
        }

        this.archivo = archivo;
        this.vistaPrevia.set(URL.createObjectURL(archivo));
    }


    protected enviar() {
        if (this.formulario.invalid || this.errorArchivo()) {
            this.formulario.markAllAsTouched();
            return;
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
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.cargando.set(false);
                this.error.set(
                    err.status === 0
                        ? 'No se pudo conectar con el servidor.'
                        : (err.error?.message ?? 'Ocurrió un error. Probá de nuevo.'),
                );
            },
        });
    }


}