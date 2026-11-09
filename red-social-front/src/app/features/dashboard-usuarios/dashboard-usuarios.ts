import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';
import { LIMITE_IMAGEN_PERFIL_MB } from '../../core/constantes';
import { contrasenasIguales } from '../../core/contraseñas-iguales';
import { mensajeDeError } from '../../core/errores';
import type { UsuarioListado } from '../../core/models/usuario.model';
import { UsuariosApi } from '../../core/usuarios-api';
import { validarImagen } from '../../core/validar-imagen';
import { ModalConfirmacion } from '../../shared/modal-confirmacion/modal-confirmacion';
import { ImagenRespaldoDirective } from '../../shared/directivas/imagen-respaldo.directive';
import { ResaltarDirective } from '../../shared/directivas/resaltar.directive';

// [CICLO ADMIN USUARIOS] Pantalla de administración de usuarios (solo administrador)
@Component({
    selector: 'app-dashboard-usuarios',
    imports: [ModalConfirmacion, ReactiveFormsModule, ResaltarDirective, ImagenRespaldoDirective],
    templateUrl: './dashboard-usuarios.html',
    styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios implements OnInit {
    private api = inject(UsuariosApi);
    private auth = inject(Auth);
    private fb = inject(FormBuilder);

    protected usuarios = signal<UsuarioListado[]>([]);
    protected cargando = signal(true);
    protected error = signal('');
    protected aviso = signal(''); // errores de las acciones (habilitar / deshabilitar)
    protected usuarioPorDeshabilitar = signal<UsuarioListado | null>(null);

    // ─── Estado del formulario de alta ──────────────────────────────
    protected mostrarFormulario = signal(false);
    protected guardando = signal(false);
    protected errorAlta = signal('');
    protected errorArchivo = signal('');
    protected vistaPrevia = signal<string | null>(null);
    private archivo: File | null = null;

    // Mismos campos que el registro + 'perfil' (los dos radio buttons)
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
            perfil: ['usuario', [Validators.required]], // valor inicial: usuario
        },
        { validators: contrasenasIguales },
    );

    ngOnInit() {
        this.cargar();
    }

    // [paso 1] Trae todos los usuarios del back
    protected cargar() {
        this.cargando.set(true);
        this.error.set('');

        this.api.listar().subscribe({
            next: (lista) => {
                this.usuarios.set(lista);
                this.cargando.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.error.set(mensajeDeError(err));
                this.cargando.set(false);
            },
        });
    }

    // ¿Es el usuario que está logueado? (a uno mismo no se le muestra el botón)
    protected esYo(usuario: UsuarioListado) {
        return usuario._id === this.auth.usuarioActual()?._id;
    }

    // Los usuarios viejos no tienen el campo: cuentan como habilitados
    protected estaHabilitado(usuario: UsuarioListado) {
        return usuario.habilitado !== false;
    }

    // ─── DESHABILITAR (con confirmación) ────────────────────────────

    protected pedirDeshabilitar(usuario: UsuarioListado) {
        this.usuarioPorDeshabilitar.set(usuario);
    }

    protected cancelarDeshabilitar() {
        this.usuarioPorDeshabilitar.set(null);
    }

    protected confirmarDeshabilitar() {
        const usuario = this.usuarioPorDeshabilitar();
        if (!usuario) return;
        this.usuarioPorDeshabilitar.set(null);
        this.aviso.set('');

        this.api.deshabilitar(usuario._id).subscribe({
            next: (actualizado) => this.reemplazar(actualizado),
            error: (err: HttpErrorResponse) => this.aviso.set(mensajeDeError(err)),
        });
    }

    // ─── HABILITAR ──────────────────────────────────────────────────

    protected habilitar(usuario: UsuarioListado) {
        this.aviso.set('');

        this.api.habilitar(usuario._id).subscribe({
            next: (actualizado) => this.reemplazar(actualizado),
            error: (err: HttpErrorResponse) => this.aviso.set(mensajeDeError(err)),
        });
    }

    // El back devuelve el usuario actualizado: lo cambio en la lista y dejo los demás igual
    private reemplazar(actualizado: UsuarioListado) {
        this.usuarios.update((lista) =>
            lista.map((u) => (u._id === actualizado._id ? actualizado : u)),
        );
    }

    // ─── ALTA DE USUARIO (formulario) ───────────────────────────────

    protected alternarFormulario() {
        this.mostrarFormulario.update((abierto) => !abierto);
    }

    // Para mostrar el campo en rojo solo si está mal y ya fue tocado
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

    // Igual que en el registro: valida la imagen y arma la vista previa
    protected seleccionarArchivo(evento: Event) {
        const input = evento.target as HTMLInputElement;
        const archivo = input.files?.[0] ?? null;

        this.archivo = null;
        this.errorArchivo.set('');
        this.vistaPrevia.set(null);

        if (!archivo) return;

        const errorImagen = validarImagen(archivo, LIMITE_IMAGEN_PERFIL_MB);
        if (errorImagen) {
            this.errorArchivo.set(errorImagen);
            input.value = '';
            return;
        }

        this.archivo = archivo;
        this.vistaPrevia.set(URL.createObjectURL(archivo));
    }

    // [CICLO ADMIN ALTA · paso 1] Lo llama el (ngSubmit) del formulario
    protected crearUsuario() {
        if (this.formulario.invalid || this.errorArchivo()) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.errorAlta.set('');
        this.guardando.set(true);

        // repetirContrasena no se manda al back
        const { repetirContrasena, ...datos } = this.formulario.getRawValue();

        const formData = new FormData();
        Object.entries(datos).forEach(([clave, valor]) => formData.append(clave, valor));
        if (this.archivo) {
            formData.append('imagenPerfil', this.archivo);
        }

        // [paso 2] POST /usuarios (el interceptor agrega el token del admin)
        this.api.crear(formData).subscribe({
            // [paso final] el back devolvió el usuario creado: lo pongo primero en la lista
            next: (nuevo) => {
                this.usuarios.update((lista) => [nuevo, ...lista]);
                this.limpiarFormulario();
                this.guardando.set(false);
                this.mostrarFormulario.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.guardando.set(false);
                this.errorAlta.set(mensajeDeError(err));
            },
        });
    }

    private limpiarFormulario() {
        this.formulario.reset({ perfil: 'usuario' }); // vuelve a los valores iniciales
        this.archivo = null;
        this.vistaPrevia.set(null);
        this.errorArchivo.set('');
        this.errorAlta.set('');
    }
}