import type { AbstractControl, ValidationErrors } from '@angular/forms';

export function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
    const contrasena = grupo.get('contrasena')?.value;
    const repetir = grupo.get('repetirContrasena')?.value;
    return contrasena === repetir ? null : { noCoinciden: true };
}