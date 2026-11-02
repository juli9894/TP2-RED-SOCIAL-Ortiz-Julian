import { IsNotEmpty, IsString } from 'class-validator';

export class CrearPublicacionDto {
    @IsString()
    @IsNotEmpty({ message: 'El título es obligatorio' })
    titulo: string;

    @IsString()
    @IsNotEmpty({ message: 'El mensaje es obligatorio' })
    mensaje: string;
}