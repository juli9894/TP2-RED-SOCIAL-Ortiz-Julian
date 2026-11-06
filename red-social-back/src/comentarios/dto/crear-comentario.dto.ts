import { IsNotEmpty, IsString } from 'class-validator';

export class CrearComentarioDto {
    @IsString()
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    mensaje: string;
}

