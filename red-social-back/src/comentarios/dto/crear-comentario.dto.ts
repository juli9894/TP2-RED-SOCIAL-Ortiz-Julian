import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_COMENTARIO } from '../../common/constantes.js';

export class CrearComentarioDto {
    @IsString()
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    @MaxLength(MAX_COMENTARIO, {
        message: `El comentario no puede superar los ${MAX_COMENTARIO} caracteres`,
    })
    mensaje: string;
}