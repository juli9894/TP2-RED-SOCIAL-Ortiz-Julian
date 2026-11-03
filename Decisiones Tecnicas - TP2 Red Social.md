# Decisiones técnicas — TP2 Red Social

**Julián Ortiz · Programación IV**
Creado el 22 de octubre de 2026. Última actualización: 2 de noviembre de 2026 (cierre del Sprint 2). Se actualiza al cerrar cada sprint.

Cada decisión tiene su estado:

- ✅ **Decidido**: ya lo acordamos.
- 🟡 **Propuesto**: es mi recomendación, falta tu OK.
- ⏳ **Pendiente**: se decide al llegar a ese punto del sprint.

Cada una trae el **por qué** y una **frase para defenderla** en la oral.

---

## 1. Forma general del proyecto

### 1.1 Stack ✅
Angular (front) + NestJS (back) + MongoDB (base de datos). Lo exige la consigna.

### 1.2 Dos proyectos separados ✅
Dos carpetas dentro de un único repositorio (ver 6.4): `red-social-front` y `red-social-back`. El front le habla al back por HTTP, enviando y recibiendo JSON. Solo el back toca la base de datos.

- **Por qué:** la consigna pide "dos proyectos", y además se despliegan por separado en Vercel.
- **Analogía:** el front es el mozo, el back es la cocina y MongoDB es la heladera. El mozo nunca abre la heladera.
- **Defensa:** *"El front nunca accede a la base de datos. Todo pasa por la API, que es donde se validan los datos y los permisos."*

### 1.3 Mongoose como forma de hablar con MongoDB ✅
Se usa `@nestjs/mongoose` con Mongoose, igual que en las clases y en los repos de los dos profesores.

- **Por qué:** es lo que muestra la cátedra y lo que se puede defender con los ejemplos de clase.
- **Defensa:** *"Cada colección tiene un Schema que define sus campos y reglas, y el servicio usa el Model para consultar."*

### 1.4 Estilo de Angular ✅
Componentes standalone, signals, `@if` y `@for`, `input()` y `output()`, guards funcionales. Es lo que se vio en clase.

### 1.5 Bootstrap para el diseño ✅
Se usa Bootstrap, como los repos de los profesores.

- **Modales ✅ (decidido en el Sprint 2):** la consigna prohíbe `alert()`, así que los avisos y confirmaciones se muestran en un componente propio (`ModalConfirmacion`) armado con las clases de Bootstrap (`modal`, `modal-backdrop`) y controlado por Angular con `@if`. No se usa `ng-bootstrap`, para no sumar una librería y poder explicar cada línea. Ver 10.8.

---

## 2. Estructura de carpetas

### 2.1 Backend ✅
Una carpeta por módulo, con el mismo molde que genera `nest g resource`:

```
src/
├── auth/            (login, registro y el AuthGuard que valida el token)
├── cloudinary/      (servicio que sube las imágenes a Cloudinary)
├── usuarios/        (módulo Usuarios)
│   ├── dto/
│   ├── schemas/
│   ├── usuarios.controller.ts
│   ├── usuarios.service.ts
│   └── usuarios.module.ts
├── publicaciones/   (módulo Publicaciones: controller, service, dto/ y schemas/)
├── app.module.ts
└── main.ts
```

La consigna pidió los tres módulos en el sprint 1: Publicaciones, Autenticación y Usuarios. En el sprint 2 el módulo Publicaciones se completó (alta, listado, baja lógica y me gusta).

- **Defensa:** *"Cada módulo agrupa lo de una funcionalidad: el controller recibe pedidos, el service tiene la lógica y el schema define los datos."*

### 2.2 Frontend ✅
Se organiza por responsabilidad y solo se crean las carpetas cuando hacen falta:

```
src/app/
├── core/       (servicios compartidos: `auth`, `publicaciones-api`, el interceptor del token y el guard de sesión)
├── shared/     (piezas reutilizables: barra superior, menú lateral, tarjeta de publicación y ventana de confirmación)
└── features/   (una carpeta por pantalla: login, registro, publicaciones y mi-perfil)
```

### 2.3 La tarjeta de publicación es un componente propio ✅ (pauta del profesor, Sprint 2)
El profesor lo pidió explícitamente: el feed muestra una **tarjeta por publicación**, y esa tarjeta es un componente que **recibe todo el detalle por `input()`** y lo muestra. Si hay que modificar, eliminar o ir a ver la publicación, la tarjeta emite un **`output()`** y es el feed quien reacciona. Advirtió que no se acepta un único componente "monolito" que dibuje todas las publicaciones directamente.

Reparto de responsabilidades:

| Componente | Qué hace | Qué NO hace |
|---|---|---|
| **Tarjeta de publicación** (hijo) | Recibe la publicación por `input()`. La muestra. Emite `output()` cuando el usuario pide una acción (eliminar, me gusta, ver detalle). | No llama al servicio, no navega, no modifica la lista. |
| **Feed** (padre) | Obtiene la lista del servicio. Dibuja una tarjeta por publicación con `@for`. Escucha los `output()` y ejecuta la acción (llamar al servicio, actualizar la lista, navegar). | No dibuja el detalle de cada publicación: eso lo hace la tarjeta. |

- **Dónde vive la tarjeta ✅:** en `shared/`, porque Mi Perfil también muestra publicaciones (las últimas 3) y puede reutilizarla.
- **Outputs concretos ✅ (definidos en el Sprint 2):** `alternarMeGusta` (emite `{ id, dar }`) y `eliminar` (emite el `id`). El "ver detalle" recién tiene sentido desde el Sprint 3, cuando exista la página de la publicación. Además la tarjeta recibe `soloLectura` por `input()` para usarse en Mi perfil sin me gusta ni eliminar (ver 10.9).
- **Por qué:** cada componente tiene una sola responsabilidad, la tarjeta se reutiliza y el feed no se vuelve gigante.
- **Defensa:** *"La tarjeta recibe los datos por input y avisa por output lo que el usuario quiere hacer. No sabe nada de servicios ni de rutas: quien decide es el feed."*

---

## 3. Autenticación y seguridad

### 3.1 Contraseñas con bcrypt ✅
La consigna dice "encriptar", pero lo correcto es **hashear**: la contraseña se transforma de una forma que no se puede revertir. En el login se hashea la contraseña recibida y se compara (`bcrypt.compare`).

- **Analogía:** es una licuadora. Si metés una fruta sale un licuado, pero del licuado no podés recuperar la fruta. Para saber si dos licuados vienen de la misma fruta, hacés el licuado de nuevo y los comparás.
- **Defensa:** *"Nunca se guarda la contraseña real. Si se filtra la base de datos, no se pueden leer las contraseñas."*

### 3.2 Rol de administrador ✅
El rol nunca lo decide el cliente, lo decide el servidor.

- El registro público **siempre** crea usuarios con perfil `"usuario"`. El back ignora cualquier `perfil` que llegue en la petición.
- El primer administrador se cambia a mano en MongoDB Atlas.
- Desde el sprint 4, un administrador puede crear otros administradores, y el back verifica que quien lo pide sea administrador.
- **Por qué:** si el registro dejara elegir el perfil, cualquiera podría hacerse administrador con una simple petición (escalada de privilegios).
- **Defensa:** *"El rol nunca lo decide el cliente, lo decide el servidor."*

### 3.3 JWT con `jsonwebtoken` y guard propio ✅
Se firma el token con la librería `jsonwebtoken` y se protege con un guard propio, sin Passport. Es lo que muestra el repo de afriadenrich en `clase-14-jwt`.

- **Analogía:** el token es la pulsera de un recital. Te la dan al entrar (login) y la mostrás en cada puerta (cada petición).
- **Excepción acordada al "solo lo del sprint":** el JWT se pide recién en el sprint 3, pero se adelanta en versión básica en el sprint 1 (el login devuelve un token) para no rehacer el login. El vencimiento de 15 minutos, `autorizar`, `refrescar` y el guardado en el navegador quedan para el sprint 3.
- **Secreto del token:** va en una variable de entorno, nunca escrito en el código.
- **Avance en el Sprint 2 ✅:** el front guarda el token y el usuario en `localStorage` al hacer login, y un interceptor funcional agrega `Authorization: Bearer <token>` a cada pedido a nuestra API. El back protege las rutas de publicaciones con un `AuthGuard` propio que verifica el token y deja `id`, `usuario` y `perfil` en el pedido (ver 10.6).
- **Sigue pendiente (Sprint 3):** vencimiento a los 15 minutos, rutas `autorizar` y `refrescar`, aviso de sesión y redirección al login ante un 401.

### 3.4 Validación en dos capas ✅
- **En el back:** DTOs con `class-validator` y `ValidationPipe` global. Es la validación que realmente protege.
- **En el front:** formularios con validaciones y mensajes, para que el usuario sepa qué corregir sin esperar al servidor.
- La regla de la contraseña (8 caracteres, una mayúscula, un número) se aplica en las dos capas.
- **Defensa:** *"La validación del front es comodidad; la del back es seguridad. Un usuario puede saltearse el front, pero no el back."*

### 3.5 Correo y usuario únicos ✅
Los dos campos llevan índice `unique` en el schema, y el correo se guarda en minúsculas. Si se repite alguno, el back responde 409 en vez de dejar pasar el error de Mongo.

---

## 4. Respuestas de la API (status HTTP) ✅

La consigna exige status correctos. Esta es la tabla que seguimos:

| Situación | Status |
|---|---|
| Registro exitoso | 201 Created |
| Login exitoso | 200 OK |
| Datos inválidos (por ejemplo contraseña débil) | 400 Bad Request |
| Usuario o contraseña incorrectos | 401 Unauthorized |
| Correo o usuario ya existente | 409 Conflict |
| Recurso que no existe | 404 Not Found |
| Sin permiso para esa acción (por ejemplo un usuario común en una ruta de administrador, o eliminar una publicación ajena) | 403 Forbidden |
| Publicación creada | 201 Created |
| Dar me gusta a una publicación que ya tiene mi me gusta, o quitarlo cuando no lo di | 409 Conflict |
| Token ausente o inválido | 401 Unauthorized |

Nest responde 201 por defecto en los `POST`. Como el login no crea nada, le ponemos 200 explícitamente.

---

## 5. Imágenes de perfil

### 5.1 Envío como `multipart/form-data` con `FileInterceptor` ✅
El registro lleva un archivo, así que el front envía el formulario como `multipart/form-data` y el back lo recibe con `FileInterceptor` (Multer, que ya viene con Nest).

### 5.2 Dónde se guarda el archivo ✅
No se puede guardar en una carpeta del servidor: en Vercel el back corre de forma temporal y esos archivos desaparecen. Se usa **Cloudinary**: el back sube la imagen con un servicio propio (`CloudinaryService`) y en la base se guarda solo la URL, como pide la consigna. Lo usan el registro (foto de perfil, máximo 2 MB) y las publicaciones (imagen opcional, máximo 5 MB).

### 5.3 La imagen de perfil es opcional, con avatar por defecto en el front ✅
La imagen no es obligatoria en el registro, pero debe poder cargarse si la persona quiere (confirmado por el profesor).

- **En la base de datos:** si la persona no sube foto, `imagenPerfil` queda sin valor. No se guarda ninguna URL de "imagen por defecto".
- **En el front:** si el usuario no tiene `imagenPerfil`, se muestra un ícono de persona vacía (`bi-person-circle`, de Bootstrap Icons).
- **Por qué:** si más adelante se cambia el avatar por defecto, no hay que tocar datos ya guardados. Además es el comportamiento habitual en una red social.
- **Orden de trabajo:** es lo último que se implementa del sprint 1. Si el tiempo aprieta, el registro funciona igual sin imagen.
- **Defensa:** *"La imagen es opcional. Si no hay, la base no guarda nada y el front muestra un avatar genérico."*

---

## 6. Deploy y entorno

### 6.1 Front y back en Vercel ✅
Lo pide el profesor.

### 6.2 Base de datos en MongoDB Atlas 🟡
Vercel no aloja bases de datos, así que se usa Atlas con su plan gratuito.

- **Detalle a tener en cuenta:** Vercel no usa IPs fijas, por lo que en Atlas hay que permitir acceso desde cualquier IP (`0.0.0.0/0`). Es una configuración habitual en este tipo de deploy, y la seguridad queda en el usuario y la contraseña de la base.
- **Detalle resuelto ✅:** el back de NestJS ya corre en Vercel y se redespliega con cada `git push` (ver 10.11).

### 6.3 Variables de entorno ✅
La cadena de conexión a Mongo, el secreto del JWT y las credenciales del servicio de imágenes van en variables de entorno y en un `.gitignore`. Nunca se suben al repositorio.

- **Defensa:** *"Los secretos no viven en el código: así no quedan expuestos en GitHub."*

### 6.4 Git y GitHub ✅
Un **único repositorio** en la raíz (`TP2-RED-SOCIAL-Ortiz-Julian`) con dos carpetas: `red-social-back` y `red-social-front`. Esta decisión reemplaza la idea inicial de un repositorio por proyecto. Se hacen commits chicos, uno por paso, y un commit de cierre por sprint. Así se puede mostrar el estado exacto de cada entrega.

- **Vercel:** cada proyecto se despliega eligiendo su carpeta como *Root Directory* (`red-social-back` o `red-social-front`).
- **Defensa:** *"Un solo repositorio facilita la corrección: el profesor ve ambos proyectos y todo el historial en un único lugar."*

---

## 7. Alcance y método

### 7.1 Un sprint, lo que pide ese sprint ✅
Se simula un cliente que pide cosas nuevas cada semana, así que no se adelanta trabajo de sprints posteriores. La única excepción es el JWT básico (ver 3.3).

### 7.2 Sin tests automatizados ✅
La consigna no los pide. Si el profesor los exige, la cátedra usa Vitest (no Jest).


### 7.3 Editar el perfil: fuera de los sprints 1 y 2 ⏳
La consigna general dice que el usuario puede editar su perfil, pero ningún sprint lo pide. Hipótesis (no confirmada): como mínimo cambiar la foto y la descripción. No se implementa hasta que un sprint lo pida; si no aparece, queda como mejora antes del final.
---

## 8. Decisiones que se toman más adelante ⏳

Se anotan para no olvidarlas, pero no se deciden hasta llegar a cada sprint.

| Sprint | Tema a decidir |
|---|---|
| 2 | ✅ Resuelto: ver la sección 10. |
| 3 | ~~Dónde se guarda el token~~ (resuelto en el Sprint 2: `localStorage`, ver 10.6). Cómo se manejan los 401 en un solo lugar (el interceptor ya existe: es el lugar natural para agregar ese manejo). Cómo se implementa el contador de sesión. |
| 4 | Librería de gráficos. Cómo se valida que el token sea de un administrador. Cómo se arman la PWA, las 3 pipes y las 3 directivas. |

---

## 9. Preguntas abiertas para el profesor

1. La consigna general dice que el usuario puede **editar** su perfil, pero ningún sprint lo detalla. ¿Se pide en alguno? *(Pendiente de confirmar; hipótesis: al menos cambiar foto y descripción. Ver 7.3.)*
2. ~~¿La imagen de perfil del registro es obligatoria u opcional?~~ **Resuelta:** es opcional, con avatar por defecto (ver 5.3).
3. ¿Hay un límite de caracteres para la "descripción breve"?
4. En el sprint 2 el back pide crear publicaciones, pero el front no lista una pantalla para hacerlo. Se implementó un formulario simple arriba del listado. ¿Está bien así? *(Pendiente de confirmar.)*
5. Mi Perfil debe mostrar "sus comentarios", pero los comentarios se piden recién en el sprint 3. ¿Alcanza con que aparezcan a partir de ese sprint? *(Pendiente de confirmar.)*

---

## 10. Decisiones del Sprint 2 ✅

Todas se probaron en local y en producción (Vercel).

### 10.1 Me gusta: lista de ids + contador, con actualización atómica ✅
Cada publicación guarda `meGusta` (la lista de ids de los usuarios que le dieron me gusta) y `cantidadMeGusta` (un número).

- **Dar me gusta:** `findOneAndUpdate` con el filtro `{ _id, eliminada: false, meGusta: { $ne: usuario } }` y el cambio `$addToSet` + `$inc: 1`. **Quitar:** el filtro exige que el usuario ya esté en la lista y el cambio es `$pull` + `$inc: -1`.
- **Si no encuentra nada:** 404 si la publicación no existe o fue eliminada; 409 si ya le había dado me gusta (o no se lo había dado, al quitar).
- **Por qué un contador guardado:** para ordenar por cantidad de me gusta y paginar directamente en MongoDB, sin traer todo y contar en el back.
- **Por qué atómico:** la comprobación y el cambio ocurren en una sola operación. Si llegan dos pedidos a la vez, el segundo no encuentra la condición y no se duplica el me gusta.
- **Defensa:** *"Un usuario solo puede dar un me gusta por publicación porque la propia consulta a la base lo garantiza, no un if en el código."*

### 10.2 Baja lógica con `eliminada` ✅
Las publicaciones tienen un campo `eliminada` (verdadero o falso, por defecto falso). Eliminar no borra el documento: lo marca. El listado, los me gusta y las nuevas eliminaciones ignoran las marcadas.

- **Quién puede:** solo el autor o un administrador. Si la publicación no existe o ya estaba eliminada, 404; si el usuario no es el autor ni administrador, 403.
- **Por qué:** se conserva el dato (por ejemplo para auditar) y los comentarios del sprint 3 no quedan apuntando a algo borrado.
- **Defensa:** *"La baja lógica oculta el dato sin destruirlo: en Atlas la publicación sigue estando con `eliminada: true`."*

### 10.3 Listado con filtros en el GET ✅
`GET /publicaciones` recibe parámetros que se validan con un DTO (`class-validator`):

| Parámetro | Regla | Por defecto |
|---|---|---|
| `orden` | `fecha` o `meGusta` | `fecha` |
| `usuario` | id de Mongo válido (filtra las de un usuario) | todas |
| `offset` | entero, mínimo 0 | 0 |
| `limit` | entero entre 1 y 50 | 10 |

- Orden por me gusta: de más a menos, y a igual cantidad, la más reciente primero. Se usa `sort`, `skip` y `limit` de Mongoose, y `populate` para traer el usuario y la foto del autor.
- Los parámetros de la URL llegan como texto; por eso el `ValidationPipe` global lleva `transform: true`, que los convierte a número.
- Un parámetro inválido devuelve 400.
- **Defensa:** *"El orden, el salto y el límite se aplican en la base de datos; el front solo manda los parámetros."*

### 10.4 Paginación tradicional con "pido una de más" ✅
El front pide `limit = porPagina + 1` (hoy 6 por página, o sea 7). Si llegan más de 6, sabe que existe una página siguiente y muestra solo 6; si llegan 6 o menos, el botón **Siguiente** se apaga.

- **Por qué:** así no hace falta que el back calcule y devuelva el total de publicaciones.
- Al cambiar el orden o al publicar, se vuelve a la página 1.
- **El scroll infinito no se hizo:** la consigna lo pide en el sprint 5 (recuperatorio) y el sprint 2 pide paginación tradicional.
- **Defensa:** *"Pido una publicación de más solo para saber si hay otra página; esa sobrante no se muestra."*

### 10.5 Imagen de la publicación ✅
Se envía como `multipart/form-data` en el campo `imagen`, con un límite de 5 MB en el back. El front valida que sea una imagen de hasta 5 MB, muestra una vista previa y deja quitarla antes de publicar. Título y mensaje son obligatorios (el mensaje no puede ser solo espacios). La imagen es opcional.

### 10.6 Sesión en el navegador y protección de rutas ✅
- El token y los datos del usuario se guardan en `localStorage`.
- Un interceptor funcional agrega `Authorization: Bearer <token>`, **solo** a los pedidos que van a nuestra API (el token no se manda a otros sitios, como Cloudinary).
- En el front, un guard de ruta no deja entrar a las pantallas sin sesión.
- En el back, un `AuthGuard` propio verifica el token con la librería `jsonwebtoken` y deja `id`, `usuario` y `perfil` en el pedido. Sin token válido responde 401.
- **Queda para el sprint 3:** vencimiento, `autorizar`, `refrescar`, contador de sesión y manejo del 401 en el interceptor.
- **Defensa:** *"El interceptor es el único lugar que arma el encabezado del token; ningún servicio lo escribe a mano."*

### 10.7 Quién ve el botón de eliminar ✅
La tarjeta muestra el tacho solo si el usuario es el autor o es administrador. Es una comodidad de la pantalla: la verificación real la hace el back (403). Es la misma idea de las dos capas de la decisión 3.4.

### 10.8 Ventana de confirmación como componente propio ✅
`ModalConfirmacion` recibe por `input()` el título, el mensaje y el texto del botón de confirmar, y avisa por `output()` `confirmar` o `cancelar`. Cancelar también se activa tocando fuera de la caja o con la tecla Esc.

- **Flujo:** la tarjeta avisa al feed que quiere eliminar; el feed guarda el id en `idPorEliminar` y muestra la ventana con `@if`; solo al confirmar llama a la API.
- **Por qué propio y no `ng-bootstrap`:** menos dependencias y se explica línea por línea. Es reutilizable (por ejemplo para el aviso de sesión del sprint 3).
- **No se usa `canDeactivate`:** eliminar no cambia de ruta, así que ese guard no se dispara. Serviría para avisar si se sale del formulario con datos sin enviar.
- **Defensa:** *"La ventana no sabe qué se está borrando: solo muestra un mensaje y avisa qué botón se tocó. Quien decide qué hacer es el feed."*

### 10.9 Mi perfil y tarjeta en solo lectura ✅
- **Datos del usuario:** salen de la sesión guardada. El login ya devuelve todos los datos (sin la contraseña), así que no hace falta otra petición.
- **Fecha de nacimiento:** se muestra con `DatePipe` en `UTC`. Se guarda a medianoche UTC y, sin eso, el navegador la mostraría un día antes por la zona horaria de Argentina.
- **Últimas 3 publicaciones:** `GET /publicaciones?usuario=<mi id>&limit=3`, con el orden por defecto (más recientes primero).
- **La tarjeta se reutiliza** con `soloLectura`: sin me gusta ni eliminar. Esas acciones quedan en la pantalla Publicaciones.
- **Comentarios:** los comentarios llegan en el sprint 3, por eso hoy no se muestran (ver pregunta 5 de la sección 9).

### 10.10 Imágenes de las tarjetas en un cuadro fijo ✅
Todas las imágenes se muestran en un cuadro de hasta 600 × 360 px con `object-fit: cover`: llenan el cuadro y recortan el sobrante. Se probó `contain` (muestra la imagen entera), pero dejaba franjas vacías y cuadros de distinto tamaño.

### 10.11 Deploy del Sprint 2 ✅
Con `git push` a `main`, Vercel construye y publica los dos proyectos. El front decide la URL del back con `isDevMode()`: en desarrollo usa `localhost:3000` y en producción la URL de Vercel. No hubo variables de entorno nuevas, y el `.env` está en `.gitignore`. Se probó todo en producción: listado, orden, paginación, publicar con y sin imagen, me gusta, eliminar con confirmación y Mi perfil.
