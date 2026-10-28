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

    protected enviar() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.error.set('');
        this.cargando.set(true);

        const { repetirContrasena, ...datos } = this.formulario.getRawValue();

        this.auth.registro(datos).subscribe({
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