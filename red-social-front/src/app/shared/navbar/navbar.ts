import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { ImagenRespaldoDirective } from '../directivas/imagen-respaldo.directive';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, ImagenRespaldoDirective],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar {
    protected auth = inject(Auth);
    private router = inject(Router);

    protected salir() {
        this.auth.cerrarSesion();
        this.router.navigate(['/login']);
    }
}