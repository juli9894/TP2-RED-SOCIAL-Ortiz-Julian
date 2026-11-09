import type { AbstractControl, ValidationErrors } from '@angular/forms';

// Validador del grupo: la contraseña y su repetición tienen que ser iguales
export function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
    const contrasena = grupo.get('contrasena')?.value;
    const repetir = grupo.get('repetirContrasena')?.value;
    return contrasena === repetir ? null : { noCoinciden: true };
}