import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_MENSAJE_PUBLICACION, MAX_TITULO } from '../../common/constantes.js';

export class CrearPublicacionDto {
    @IsString()
    @IsNotEmpty({ message: 'El título es obligatorio' })
    @MaxLength(MAX_TITULO, { message: `El título no puede superar los ${MAX_TITULO} caracteres` })
    titulo: string;

    @IsString()
    @IsNotEmpty({ message: 'El mensaje es obligatorio' })
    @MaxLength(MAX_MENSAJE_PUBLICACION, {
        message: `El mensaje no puede superar los ${MAX_MENSAJE_PUBLICACION} caracteres`,
    })
    mensaje: string;
}