import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, timer } from 'rxjs';
import { Auth } from '../../core/auth';
import { TIEMPO_MINIMO_CARGANDO_MS } from '../../core/constantes';

// [CICLO SESIÓN] Primera pantalla al abrir la app: valida el token antes de mostrar nada
@Component({
    selector: 'app-cargando',
    templateUrl: './cargando.html',
    styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
    private auth = inject(Auth);
    private router = inject(Router);

    ngOnInit() {
        // Sin token no hay nada que validar: al login
        if (!this.auth.obtenerToken()) {
            this.router.navigate(['/login']);
            return;
        }

        // Respuesta del back convertida en true (token válido) o false (vencido o inválido)
        const validacion$ = this.auth.autorizar().pipe(
            map(() => true),
            catchError(() => of(false)),
        );

        // forkJoin espera a que terminen las dos: la validación y el tiempo mínimo del spinner
        forkJoin([validacion$, timer(TIEMPO_MINIMO_CARGANDO_MS)]).subscribe(([valido]) => {
            if (valido) {
                this.router.navigate(['/publicaciones']);
            } else {
                this.auth.cerrarSesion();
                this.router.navigate(['/login']);
            }
        });
    }
}