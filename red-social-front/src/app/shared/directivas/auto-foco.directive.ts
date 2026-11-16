import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: 'input[appAutoFoco], textarea[appAutoFoco]' })
export class AutoFocoDirective implements AfterViewInit {
    private elemento = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

    ngAfterViewInit() {
        const campo = this.elemento.nativeElement;
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
    }
}