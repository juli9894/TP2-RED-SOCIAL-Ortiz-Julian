import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class ListarPublicacionesDto {
    @IsOptional()
    //por fecha o por cantidad de me gusta
    @IsIn(['fecha', 'meGusta'])
    orden?: 'fecha' | 'meGusta';

    // solo las publicaciones de este usuario (su _id)
    @IsOptional()
    @IsMongoId()
    usuario?: string;

    //para paginar, cuantas publicaciones saltarse (offset) y cuántas traer (limit)
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}