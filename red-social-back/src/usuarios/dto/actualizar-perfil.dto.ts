import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Datos que puede cambiar cada usuario de SU propio perfil (PUT /auth/perfil).
// No incluye contraseña ni perfil (usuario/administrador): eso no se edita desde acá.
export class ActualizarPerfilDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre: string;

    @IsString()
    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    apellido: string;

    @IsEmail({}, { message: 'El correo no es válido' })
    correo: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    usuario: string;

    @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
    fechaNacimiento: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    descripcion: string;

    // Como viaja en un multipart/form-data, todo llega como texto: 'true' = quitar la foto actual
    @IsOptional()
    @IsIn(['true', 'false'], { message: 'quitarImagen debe ser "true" o "false"' })
    quitarImagen?: string;
}
