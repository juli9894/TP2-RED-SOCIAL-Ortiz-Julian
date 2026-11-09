import { IsIn } from 'class-validator';
import { CrearUsuarioDto } from './crear-usuario.dto.js';

// Lo usa el administrador al crear un usuario: mismos datos que el registro + el perfil elegido
export class CrearUsuarioAdminDto extends CrearUsuarioDto {
    @IsIn(['usuario', 'administrador'], {
        message: 'El perfil debe ser "usuario" o "administrador"',
    })
    perfil: string;
}