import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'Ingresá tu usuario o correo' })
    usuarioOCorreo: string;

    @IsString()
    @IsNotEmpty({ message: 'Ingresá tu contraseña' })
    contrasena: string;
}