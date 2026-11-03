# Mapa del código — Sprint 2 (TeResuelvo)

Cómo usarlo: en el código, cada método clave tiene un comentario `[CICLO X · paso N/T]`.
Buscá en VS Code (Ctrl + Shift + F) `CICLO LOGIN` y aparecen todos los pasos, en orden.

Rutas: `FRONT` = `red-social-front/src/app/` · `BACK` = `red-social-back/src/`

---

## Dónde está cada tipo de cosa

| Qué busco | Dónde está |
|---|---|
| URL del back (local / producción) | FRONT `core/api.ts` |
| Forma de los datos (interfaces) | FRONT `core/models/usuario.model.ts`, `core/models/publicacion.model.ts` |
| Sesión (login, logout, token, usuario guardado) | FRONT `core/auth.ts` |
| Llamadas HTTP de publicaciones | FRONT `core/publicaciones-api.ts` |
| Agrega el token a cada pedido | FRONT `core/token.interceptor.ts` |
| Protege rutas del front | FRONT `core/sesion.guard.ts` + `app.routes.ts` |
| Registra interceptor y router | FRONT `app.config.ts` |
| Protege rutas del back (401) | BACK `auth/auth.guard.ts` |
| Forma del token / del pedido autenticado | BACK `auth/interfaces/payload-token.interface.ts` |
| Forma del archivo subido | BACK `cloudinary/interfaces/archivo-subido.interface.ts` |
| Subida a Cloudinary + validación "es imagen" | BACK `cloudinary/cloudinary.service.ts` |
| Validación de datos de entrada (DTOs) | BACK `usuarios/dto/`, `publicaciones/dto/` |
| Estructura de las colecciones (schemas) | BACK `usuarios/schemas/`, `publicaciones/schemas/` |
| Conexión a MongoDB y variables .env | BACK `app.module.ts` |
| ValidationPipe y CORS | BACK `main.ts` |

---

## CICLO REGISTRO (6 pasos)

1. FRONT `features/registro/registro.ts` → `enviar()` arma el `FormData` (texto + foto).
2. FRONT `core/auth.ts` → `registro()` prepara el POST a `/auth/registro`; el `subscribe` de `registro.ts` lo envía.
3. BACK `auth/auth.controller.ts` → `registro()`. `FileInterceptor('imagenPerfil')` separa archivo y texto.
4. BACK `auth/auth.service.ts` → `registro()`. Si hay archivo llama a `CloudinaryService.subirImagen()` (valida que sea imagen y devuelve la URL).
5. BACK `usuarios/usuarios.service.ts` → `crear()`. Revisa correo y usuario repetidos (409), hashea la contraseña con bcrypt y guarda.
6. Vuelve: `auth.service.ts` quita la contraseña → `registro.ts` (`next`) navega a `/login`.

## CICLO LOGIN (6 pasos)

1. FRONT `features/login/login.ts` → `enviar()`.
2. FRONT `core/auth.ts` → `login()` prepara el POST a `/auth/login`.
3. BACK `auth/auth.controller.ts` → `login()`.
4. BACK `auth/auth.service.ts` → `login()`. Compara contraseña con bcrypt (401 si falla) y firma el JWT con `id`, `usuario`, `perfil`.
5. BACK `usuarios/usuarios.service.ts` → `buscarPorUsuarioOCorreo()`.
6. Vuelve `{ token, usuario }`: `auth.ts` (`tap`) guarda en el signal y en localStorage → `login.ts` (`next`) navega a `/publicaciones`.

## CICLO SESIÓN (en todos los pedidos protegidos)

- FRONT `core/token.interceptor.ts`: antes de enviar cualquier pedido a nuestro back agrega `Authorization: Bearer <token>`.
- BACK `auth/auth.guard.ts`: lee esa cabecera, verifica el JWT con `JWT_SECRET`, deja `pedido.usuario`. Sin token o inválido → 401.
- FRONT `core/sesion.guard.ts`: `sesionGuard` (sin sesión → `/login`) e `invitadoGuard` (con sesión → `/publicaciones`).
- F5 mantiene la sesión porque `Auth.leerGuardado()` relee el usuario de localStorage.

## CICLO PUBLICAR (7 pasos)

1. FRONT `features/publicaciones/nueva-publicacion/nueva-publicacion.ts` → `enviar()` arma el `FormData` (`titulo`, `mensaje`, `imagen`).
2. FRONT `core/publicaciones-api.ts` → `crear()` (el interceptor le agrega el token).
3. BACK `auth/auth.guard.ts` verifica el token.
4. BACK `publicaciones/publicaciones.controller.ts` → `crear()`. `FileInterceptor('imagen')` máx. 5 MB.
5. BACK `publicaciones/publicaciones.service.ts` → `crear()`. Si hay imagen, `CloudinaryService.subirImagenPublicacion()`; guarda con `autor` = id del token.
6. Vuelve: `nueva-publicacion.ts` (`next`) limpia el formulario y emite `publicada`.
7. FRONT `features/publicaciones/publicaciones.html` → `(publicada)="irAPagina(0)"` → `publicaciones.ts` recarga la lista.

## CICLO LISTAR (7 pasos)

1. FRONT `features/publicaciones/publicaciones.ts` → `cargar()` (pide `porPagina + 1` para saber si hay otra página).
2. FRONT `core/publicaciones-api.ts` → `listar()` arma `?orden=&offset=&limit=`.
3. BACK `auth/auth.guard.ts`.
4. BACK `publicaciones/publicaciones.controller.ts` → `listar()`. `ListarPublicacionesDto` valida los parámetros.
5. BACK `publicaciones/publicaciones.service.ts` → `listar()`: `find` (no eliminadas) + `sort` + `skip` + `limit` + `populate('autor')`.
6. Vuelve: `publicaciones.ts` (`next`) calcula `hayMas`.
7. Guarda las primeras `porPagina` en el signal y `publicaciones.html` dibuja una `app-tarjeta-publicacion` por cada una.

## CICLO ME GUSTA (7 pasos)

1. FRONT `shared/tarjeta-publicacion/tarjeta-publicacion.ts` → `tocarCorazon()` emite `{ id, dar }`.
2. FRONT `features/publicaciones/publicaciones.ts` → `alternarMeGusta()`.
3. FRONT `core/publicaciones-api.ts` → `darMeGusta()` (POST) o `quitarMeGusta()` (DELETE) a `/publicaciones/:id/me-gusta`.
4. BACK `auth/auth.guard.ts`.
5. BACK `publicaciones/publicaciones.controller.ts` → `darMeGusta()` / `quitarMeGusta()`.
6. BACK `publicaciones/publicaciones.service.ts`: `findOneAndUpdate` atómico (`$addToSet`/`$pull` + `$inc`). Si no encuentra: 404 o 409 (`errorMeGusta()`).
7. Vuelve: `publicaciones.ts` (`next`) actualiza solo esa publicación en el signal.

## CICLO ELIMINAR (8 pasos)

1. FRONT `tarjeta-publicacion.ts` → `tocarEliminar()` emite el id (el tacho solo se ve si `puedeEliminar()`).
2. FRONT `publicaciones.ts` → `pedirEliminar()` guarda `idPorEliminar` y se abre el modal.
3. FRONT `shared/modal-confirmacion/` emite `confirmar` → `publicaciones.ts` → `confirmarEliminar()`.
4. FRONT `publicaciones.ts` → `eliminarPublicacion()` llama a `core/publicaciones-api.ts` → `eliminar()` (DELETE).
5. BACK `auth/auth.guard.ts`.
6. BACK `publicaciones/publicaciones.controller.ts` → `eliminar()`.
7. BACK `publicaciones/publicaciones.service.ts` → `eliminar()`: 400 id inválido, 404 no existe, 403 si no es autor ni administrador; baja lógica (`eliminada = true`).
8. Vuelve: `publicaciones.ts` (`next`) ejecuta `cargar()` de nuevo.

## CICLO MI PERFIL (6 pasos)

1. FRONT `features/mi-perfil/mi-perfil.ts` → `ngOnInit()`. Los datos del usuario salen de `Auth.usuarioActual` (sin pedir al back).
2. FRONT `core/publicaciones-api.ts` → `listar({ usuario: _id, limit: 3 })`.
3–5. Mismo recorrido del CICLO LISTAR en el back, con el filtro `usuario`.
6. `mi-perfil.html` dibuja las tarjetas con `[soloLectura]="true"` (sin corazón ni tacho).
