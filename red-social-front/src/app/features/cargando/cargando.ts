import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, timer } from 'rxjs';
import { Auth } from '../../core/auth';
import { TIEMPO_MINIMO_CARGANDO_MS } from '../../core/constantes';

// [CICLO SESIÓN] 
@Component({
    selector: 'app-cargando',
    templateUrl: './cargando.html',
    styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
    private auth = inject(Auth);
    private router = inject(Router);

    ngOnInit() {
        if (!this.auth.obtenerToken()) {
            this.router.navigate(['/login']);
            return;
        }

        const validacion$ = this.auth.autorizar().pipe(
            map(() => true),
            catchError(() => of(false)),
        );//al final solo true o false

        forkJoin([validacion$, timer(TIEMPO_MINIMO_CARGANDO_MS)]).subscribe(([valido]) => {//solo primer resultado del array $validacion true/false
            if (valido) {
                this.router.navigate(['/publicaciones']);
            } else {
                this.auth.cerrarSesion();
                this.router.navigate(['/login']);
            }
        });
    }
}