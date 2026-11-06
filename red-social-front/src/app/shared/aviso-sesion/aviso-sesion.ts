import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';
import { AVISO_SESION_ANTES_MS } from '../../core/constantes';

// [CICLO SESIÓN] Aviso "tu sesión está por vencer": renueva el token o cierra la sesión
@Component({
    selector: 'app-aviso-sesion',
    templateUrl: './aviso-sesion.html',
    styleUrl: './aviso-sesion.css',
})
export class AvisoSesion {
    protected auth = inject(Auth);
    private router = inject(Router);

    protected minutos = AVISO_SESION_ANTES_MS / 60000;
    protected renovando = signal(false);
    protected error = signal('');

    // Pide un token nuevo; si sale bien, auth.ts apaga el aviso y rearma las alarmas
    protected seguir() {
        this.renovando.set(true);
        this.error.set('');
        this.auth.refrescar().subscribe({
            next: () => this.renovando.set(false),
            error: () => {
                this.renovando.set(false);
                this.error.set('No se pudo renovar la sesión. Volvé a ingresar.');
            },
        });
    }

    protected salir() {
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
    }
}