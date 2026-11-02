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
        const input = evento.target as HTMLInputElement;//evento.target es el input donde paso el cambio, lo casteo a HTMLInputElement para poder acceder a sus propiedades
        const archivo = input.files?.[0] ?? null;//File o null, si no hay nada seleccionado

        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);

        if (!archivo) {
            return;
        }

        //que sea una imagen
        if (!archivo.type.startsWith('image/')) {
            this.errorArchivo.set('El archivo debe ser una imagen.');
            input.value = '';
            return;
        }

        //que pese menos de 2 MB
        if (archivo.size > 2 * 1024 * 1024) {
            this.errorArchivo.set('La imagen no puede pesar más de 2 MB.');
            input.value = '';
            return;
        }

        this.archivo = archivo;
        //URL con la imagen para mostrarla en el preview
        this.vistaPrevia.set(URL.createObjectURL(archivo));
    }

    
    protected enviar() {
        
        if (this.formulario.invalid || this.errorArchivo()) { 
            this.formulario.markAllAsTouched(); //marca en rojo
            return;//frena el envio
        }

        this.error.set('');
        this.cargando.set(true);

    const { repetirContrasena, ...datos } = this.formulario.getRawValue(); //descarta el campo repetirContrasena, que no es necesario enviar al backend

    const formData = new FormData();
    

    Object.entries(datos).forEach(([clave, valor]) => formData.append(clave, valor));//arreglo de pares 
    if (this.archivo) {
        formData.append('imagenPerfil', this.archivo);//si se seleccionó un archivo, lo agrego al formData con la clave 'imagenPerfil'
    }

    this.auth.registro(formData).subscribe({//viaja al puerto de escucha del backend, que es el 3000, y se dirige al endpoint /auth/registro.
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