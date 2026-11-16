import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

// Silueta gris de usuario, dibujada como imagen incrustada
const IMAGEN_RESPALDO =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
            '<circle cx="20" cy="20" r="20" fill="#4a4a46"/>' +
            '<circle cx="20" cy="16" r="7" fill="#b9b8b2"/>' +
            '<path d="M6 36c2-8 8-11 14-11s12 3 14 11z" fill="#b9b8b2"/>' +
            '</svg>',
    );

@Directive({ selector: 'img[appImagenRespaldo]' })
export class ImagenRespaldoDirective {
    private elemento = inject<ElementRef<HTMLImageElement>>(ElementRef);
    private renderer = inject(Renderer2);

    @HostListener('error')
    alFallar() {

        if (this.elemento.nativeElement.getAttribute('src') === IMAGEN_RESPALDO) return;
        this.renderer.setAttribute(this.elemento.nativeElement, 'src', IMAGEN_RESPALDO);
    }
}