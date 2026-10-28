import { Routes } from '@angular/router';
import { invitadoGuard, sesionGuard } from './core/sesion.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        canActivate: [invitadoGuard],
        loadComponent: () => import('./features/login/login').then((m) => m.Login),
    },
    {
        path: 'registro',
        canActivate: [invitadoGuard],
        loadComponent: () => import('./features/registro/registro').then((m) => m.Registro),
    },
    {
        path: 'publicaciones',
        canActivate: [sesionGuard],
        loadComponent: () =>
            import('./features/publicaciones/publicaciones').then((m) => m.Publicaciones),
    },
    {
        path: 'mi-perfil',
        canActivate: [sesionGuard],
        loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
    },
];