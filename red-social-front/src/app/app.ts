import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Navbar } from './shared/navbar/navbar';
import { Sidebar } from './shared/sidebar/sidebar';
import { AvisoSesion } from './shared/aviso-sesion/aviso-sesion';

@Component({
    imports: [RouterOutlet, Navbar, Sidebar, AvisoSesion],
    selector: 'app-root',
    styleUrl: './app.css',
    templateUrl: './app.html',
})
export class App {
    private router = inject(Router);

    // true cuando estamos en login, registro o cargando (pantallas sin barra ni menú)
    protected esAcceso = signal(false);

    constructor() {
        this.router.events
            .pipe(filter((evento) => evento instanceof NavigationEnd))
            .subscribe((evento) => {
                const url = evento.urlAfterRedirects;
                this.esAcceso.set(
                    url.startsWith('/login') ||
                        url.startsWith('/registro') ||
                        url.startsWith('/cargando'),
                );
            });
    }
}