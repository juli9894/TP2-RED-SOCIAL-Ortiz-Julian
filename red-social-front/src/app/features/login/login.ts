import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private fb = inject(FormBuilder);

    protected formulario = this.fb.nonNullable.group({
        usuarioOCorreo: ['', [Validators.required]],
        contrasena: ['',[Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
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
        console.log(this.formulario.getRawValue());
    }
}