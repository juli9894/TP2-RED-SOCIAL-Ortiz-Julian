import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

const COLOR_POR_DEFECTO = 'rgba(249, 115, 22, 0.12)';

// Pinta el fondo del elemento mientras el mouse está encima.
// Uso: <article appResaltar>   o con otro color: <article appResaltar="rgba(0, 200, 0, 0.2)">
@Directive({ selector: '[appResaltar]' })
export class ResaltarDirective {
    private elemento = inject<ElementRef<HTMLElement>>(ElementRef);
    private renderer = inject(Renderer2);

    // El texto que se escribe después del "=" (opcional): el color a usar
    readonly appResaltar = input('');

    // El mouse entró al elemento: le pongo el color de fondo
    @HostListener('mouseenter')
    alEntrar() {
        this.renderer.setStyle(
            this.elemento.nativeElement,
            'background-color',
            this.appResaltar() || COLOR_POR_DEFECTO,
        );
    }

    // El mouse salió: saco el color que puse y vuelve el fondo original
    @HostListener('mouseleave')
    alSalir() {
        this.renderer.removeStyle(this.elemento.nativeElement, 'background-color');
    }
}