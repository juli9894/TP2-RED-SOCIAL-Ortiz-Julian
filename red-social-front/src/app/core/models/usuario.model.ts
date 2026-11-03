// MODELOS DE USUARIO Y SESIÓN
// Solo describen la forma de los datos que llegan del back. No tienen lógica.

// Datos que se mandan al hacer login (los escribe el usuario en el formulario)
export interface DatosLogin {
    usuarioOCorreo: string;
    contrasena: string;
}

// Usuario tal como lo devuelve el back (sin contraseña). Es lo que guardamos en la sesión
export interface UsuarioSesion {
    _id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    correo: string;
    perfil: string;
    fechaNacimiento: string; // llega como texto ISO: "1995-03-20T00:00:00.000Z"
    descripcion: string;
    imagenPerfil?: string;
}

// Respuesta completa de POST /auth/login
export interface RespuestaLogin {
    token: string;
    usuario: UsuarioSesion;
}
