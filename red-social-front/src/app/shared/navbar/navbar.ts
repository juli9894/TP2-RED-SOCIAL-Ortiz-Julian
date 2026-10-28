import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink],
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