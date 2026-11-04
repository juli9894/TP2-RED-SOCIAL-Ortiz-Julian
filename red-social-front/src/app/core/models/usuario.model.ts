// Datos que manda usuario en login
export interface DatosLogin {
    usuarioOCorreo: string;
    contrasena: string;
}

// Usuario como lo devuelve el back (sin contraseña)
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

export interface RespuestaLogin {
    token: string;
    usuario: UsuarioSesion;
}
