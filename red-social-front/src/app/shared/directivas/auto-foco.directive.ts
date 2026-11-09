import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

// Pone el cursor en el campo apenas aparece en pantalla, al final del texto.
// Uso: <textarea appAutoFoco></textarea>
@Directive({ selector: 'input[appAutoFoco], textarea[appAutoFoco]' })
export class AutoFocoDirective implements AfterViewInit {
    private elemento = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

    // Se ejecuta una vez, cuando el elemento ya está dibujado
    ngAfterViewInit() {
        const campo = this.elemento.nativeElement;
        campo.focus();
        // El cursor queda al final del texto, no al principio
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
}