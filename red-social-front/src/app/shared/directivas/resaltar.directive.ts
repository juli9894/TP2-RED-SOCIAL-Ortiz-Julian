import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

const COLOR_POR_DEFECTO = 'rgba(249, 115, 22, 0.12)';//naranja 12% de opacidad

@Directive({ selector: '[appResaltar]' })
export class ResaltarDirective {
    private elemento = inject<ElementRef<HTMLElement>>(ElementRef);
    private renderer = inject(Renderer2);//modifica estilo y atributo sin tocar el dom


    readonly appResaltar = input('');


    @HostListener('mouseenter')
    alEntrar() {
        this.renderer.setStyle(
            this.elemento.nativeElement,
            'background-color',
            this.appResaltar() || COLOR_POR_DEFECTO,
        );
    }

    @HostListener('mouseleave')
    alSalir() {
        this.renderer.removeStyle(this.elemento.nativeElement, 'background-color');//.usuario-fila
    }
}