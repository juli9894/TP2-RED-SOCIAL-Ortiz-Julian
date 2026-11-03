# TeResuelvo — Red social (TP2 Programación IV)

Red social fullstack. Trabajo individual de Julián Ortiz.

- **Front:** Angular (`red-social-front/`)
- **Back:** NestJS (`red-social-back/`)
- **Base de datos:** MongoDB Atlas (Mongoose)
- **Imágenes:** Cloudinary
- **Deploy:** Vercel (front y back desde este mismo repositorio)

## Cómo correrlo en local

**Back** (puerto 3000):

```bash
cd red-social-back
npm install
# crear el archivo .env copiando .env.example y completando los valores
npm run start:dev
```

**Front** (puerto 4200):

```bash
cd red-social-front
npm install
ng serve
```

En desarrollo el front le habla a `http://localhost:3000`; en producción, al back de Vercel (ver `red-social-front/src/app/core/api.ts`).

## Variables de entorno del back

Están descriptas en `red-social-back/.env.example`: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` y `PORT` (opcional).

## Estructura

```
red-social-front/src/app/
  core/        sesión (auth), llamadas HTTP, interceptor, guards, modelos, constantes, helpers
  features/    pantallas: login, registro, publicaciones (+ nueva-publicacion), mi-perfil
  shared/      componentes reutilizables: navbar, sidebar, tarjeta-publicacion, modal-confirmacion

red-social-back/src/
  auth/            registro, login y AuthGuard (verifica el token)
  usuarios/        servicio, schema y DTOs de usuarios
  publicaciones/   crear, listar, me gusta, eliminar (baja lógica)
  cloudinary/      subida de imágenes
  common/          constantes compartidas
```

## Documentación

- `Mapa del codigo - Sprint 2.md`: dónde está cada cosa y el recorrido paso a paso de cada ciclo (registro, login, sesión, publicar, listar, me gusta, eliminar, Mi perfil).
- `Decisiones Tecnicas - TP2 Red Social.md`: decisiones técnicas y por qué se tomaron.
- `Documento de Requerimientos - TP2 Red Social.docx`: requerimientos y estado por sprint.

En el código, cada paso de un ciclo está marcado con un comentario `[CICLO X · paso N/T]`; se pueden buscar con Ctrl + Shift + F.
