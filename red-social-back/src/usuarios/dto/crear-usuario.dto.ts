import {IsDateString, IsEmail, IsNotEmpty, IsString, Matches} from 'class-validator';

export class CrearUsuarioDto {
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

    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
    })
    contrasena: string;

    @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
    fechaNacimiento: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    descripcion: string;
}