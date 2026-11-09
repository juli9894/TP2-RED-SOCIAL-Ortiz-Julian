import { Routes } from '@angular/router';
import { invitadoGuard, sesionGuard } from './core/sesion.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'cargando', pathMatch: 'full' },
    {
        path: 'cargando',
        loadComponent: () => import('./features/cargando/cargando').then((m) => m.Cargando),
    },
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
        path: 'publicaciones/:id',
        canActivate: [sesionGuard],
        loadComponent: () =>
            import('./features/detalle-publicacion/detalle-publicacion').then((m) => m.DetallePublicacion),
    },
    {
        path: 'mi-perfil',
        canActivate: [sesionGuard],
        loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
    },
    {
        path: 'dashboard/usuarios',
        canActivate: [sesionGuard, adminGuard],
        loadComponent: () => import('./features/dashboard-usuarios/dashboard-usuarios').then((m) => m.DashboardUsuarios),
    },
    {
        path: 'dashboard/estadisticas',
        canActivate: [sesionGuard, adminGuard],
        loadComponent: () =>
            import('./features/dashboard-estadisticas/dashboard-estadisticas').then(
                (m) => m.DashboardEstadisticas,
            ),
    },
];