# Decisiones técnicas — TP2 Red Social

**Julián Ortiz · Programación IV**
Creado el 22 de octubre de 2026. Se actualiza al cerrar cada sprint.

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
Dos carpetas y dos repositorios: `red-social-front` y `red-social-back`. El front le habla al back por HTTP, enviando y recibiendo JSON. Solo el back toca la base de datos.

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

- **Pendiente dentro de esta decisión (⏳):** para los modales (la consigna prohíbe `alert()`), elegir entre `ng-bootstrap` (modales integrados con Angular) o Bootstrap solo. Se decide cuando llegue el primer modal.

---

## 2. Estructura de carpetas

### 2.1 Backend 🟡
Una carpeta por módulo, con el mismo molde que genera `nest g resource`:

```
src/
├── auth/          (módulo Autenticación)
├── usuarios/      (módulo Usuarios)
│   ├── dto/
│   ├── schemas/
│   ├── usuarios.controller.ts
│   ├── usuarios.service.ts
│   └── usuarios.module.ts
├── publicaciones/ (módulo Publicaciones)
├── app.module.ts
└── main.ts
```

La consigna pide los tres módulos en el sprint 1: Publicaciones, Autenticación y Usuarios. En este sprint Publicaciones queda creado pero vacío.

- **Defensa:** *"Cada módulo agrupa lo de una funcionalidad: el controller recibe pedidos, el service tiene la lógica y el schema define los datos."*

### 2.2 Frontend 🟡
Se organiza por responsabilidad y solo se crean las carpetas cuando hacen falta:

```
src/app/
├── core/       (servicios que usa toda la app, por ejemplo el de autenticación)
├── shared/     (piezas reutilizables)
└── features/   (una carpeta por pantalla: login, registro, publicaciones, perfil)
```

### 2.3 La tarjeta de publicación es un componente propio ✅ (pauta del profesor, Sprint 2)
El profesor lo pidió explícitamente: el feed muestra una **tarjeta por publicación**, y esa tarjeta es un componente que **recibe todo el detalle por `input()`** y lo muestra. Si hay que modificar, eliminar o ir a ver la publicación, la tarjeta emite un **`output()`** y es el feed quien reacciona. Advirtió que no se acepta un único componente "monolito" que dibuje todas las publicaciones directamente.

Reparto de responsabilidades:

| Componente | Qué hace | Qué NO hace |
|---|---|---|
| **Tarjeta de publicación** (hijo) | Recibe la publicación por `input()`. La muestra. Emite `output()` cuando el usuario pide una acción (eliminar, me gusta, ver detalle). | No llama al servicio, no navega, no modifica la lista. |
| **Feed** (padre) | Obtiene la lista del servicio. Dibuja una tarjeta por publicación con `@for`. Escucha los `output()` y ejecuta la acción (llamar al servicio, actualizar la lista, navegar). | No dibuja el detalle de cada publicación: eso lo hace la tarjeta. |

- **Dónde vive la tarjeta 🟡:** en `shared/`, porque Mi Perfil también muestra publicaciones (las últimas 3) y puede reutilizarla.
- **Outputs concretos:** se definen en el Sprint 2 según lo que pide ese sprint (eliminar las propias, dar y quitar me gusta). El "ver detalle" recién tiene sentido desde el Sprint 3, cuando exista la página de la publicación.
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
| Sin permiso para esa acción (por ejemplo un usuario común en una ruta de administrador) | 403 Forbidden |

Nest responde 201 por defecto en los `POST`. Como el login no crea nada, le ponemos 200 explícitamente.

---

## 5. Imágenes de perfil

### 5.1 Envío como `multipart/form-data` con `FileInterceptor` ✅
El registro lleva un archivo, así que el front envía el formulario como `multipart/form-data` y el back lo recibe con `FileInterceptor` (Multer, que ya viene con Nest).

### 5.2 Dónde se guarda el archivo ⏳
No se puede guardar en una carpeta del servidor: en Vercel el back corre de forma temporal y esos archivos desaparecen. Se usará un servicio de almacenamiento externo (opciones: Cloudinary o Vercel Blob) y en la base se guarda solo la URL, como pide la consigna. Se decide al llegar a esa parte del sprint 1.

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
- **Detalle a confirmar (⏳):** cómo se configura NestJS para correr en Vercel. La forma cambia con el tiempo, así que se confirma con la documentación vigente cuando hagamos el deploy del back.

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


### 7.3 Editar el perfil: fuera del sprint 1 ⏳
La consigna general dice que el usuario puede editar su perfil, pero ningún sprint lo pide. Hipótesis (no confirmada): como mínimo cambiar la foto y la descripción. No se implementa hasta que un sprint lo pida; si no aparece, queda como mejora antes del final.
---

## 8. Decisiones que se toman más adelante ⏳

Se anotan para no olvidarlas, pero no se deciden hasta llegar a cada sprint.

| Sprint | Tema a decidir |
|---|---|
| 2 | Cómo guardar los me gusta y cómo se hace la baja lógica de publicaciones. Cómo se resuelve la paginación con `offset` y `limit`. Qué `output()` emite exactamente la tarjeta de publicación (ver 2.3). |
| 3 | Dónde se guarda el token en el navegador. Cómo se manejan los 401 en un solo lugar. Cómo se implementa el contador de sesión. |
| 4 | Librería de gráficos. Cómo se valida que el token sea de un administrador. Cómo se arman la PWA, las 3 pipes y las 3 directivas. |

---

## 9. Preguntas abiertas para el profesor

1. La consigna general dice que el usuario puede **editar** su perfil, pero ningún sprint lo detalla. ¿Se pide en alguno? *(Pendiente de confirmar; hipótesis: al menos cambiar foto y descripción. Ver 7.3.)*
2. ~~¿La imagen de perfil del registro es obligatoria u opcional?~~ **Resuelta:** es opcional, con avatar por defecto (ver 5.3).
3. ¿Hay un límite de caracteres para la "descripción breve"?
4. En el sprint 2 el back pide crear publicaciones, pero el front no lista una pantalla para hacerlo. ¿Alcanza con un formulario simple?
