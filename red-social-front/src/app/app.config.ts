import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/token.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        // tokenInterceptor se ejecuta antes de cada petición HTTP: agrega el token
        // a la cabecera Authorization si hay token y la URL es del back
        provideHttpClient(withInterceptors([tokenInterceptor])),
    ],
};
