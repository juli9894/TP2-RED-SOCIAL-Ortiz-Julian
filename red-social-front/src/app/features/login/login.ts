import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
        contrasena: ['', [Validators.required]],
    });

    // Para mostrar el campo en rojo solo si está mal y el usuario ya lo tocó
    protected invalido(campo: 'usuarioOCorreo' | 'contrasena') {
        const control = this.formulario.controls[campo];
        return control.invalid && control.touched;
    }

    // [CICLO LOGIN · paso 1/6] Lo llama el (ngSubmit) del formulario de login.html
    protected enviar() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.error.set('');
        this.cargando.set(true);

        // Paso 2: this.auth.login() (core/auth.ts) prepara el POST; el subscribe lo envía
        this.auth.login(this.formulario.getRawValue()).subscribe({
            // [paso 6/6] Llegó la respuesta (auth.ts ya guardó la sesión): vamos a /publicaciones
            next: () => {
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
