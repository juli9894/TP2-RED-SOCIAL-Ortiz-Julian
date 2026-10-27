import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login').then((m) => m.Login),
    },
    {
        path: 'registro',
        loadComponent: () => import('./features/registro/registro').then((m) => m.Registro),
    },
    {
        path: 'publicaciones',
        loadComponent: () =>
            import('./features/publicaciones/publicaciones').then((m) => m.Publicaciones),
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
    },
];