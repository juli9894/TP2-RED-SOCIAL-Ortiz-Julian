import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { Auth } from '../../core/auth';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private auth = inject(Auth);

    protected error = signal('');
    protected cargando = signal(false);

    protected formulario = this.fb.nonNullable.group({
        usuarioOCorreo: ['', [Validators.required]],
        contrasena: ['',[Validators.required],
        ],
    });

    protected invalido(campo: 'usuarioOCorreo' | 'contrasena') {
        const control = this.formulario.controls[campo];
        return control.invalid && control.touched;
    }

    protected enviar() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.error.set('');
        this.cargando.set(true);

        this.auth.login(this.formulario.getRawValue()).subscribe({ 
            //subscribe al observable que devuelve el método login de Auth
            next: (respuesta) => {
                console.log(respuesta);
                this.router.navigate(['/publicaciones']);
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