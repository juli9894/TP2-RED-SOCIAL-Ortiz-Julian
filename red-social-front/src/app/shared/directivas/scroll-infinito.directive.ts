import { Directive, ElementRef, inject, OnDestroy, OnInit, output } from '@angular/core';

@Directive({ selector: '[appScrollInfinito]' })
export class ScrollInfinitoDirective implements OnInit, OnDestroy {
    private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly llegoAlFinal = output<void>();

    private observador?: IntersectionObserver;
    private visible = false;
    private huboScroll = false; 

    private alHacerScroll = () => {
        this.huboScroll = true;
        window.removeEventListener('scroll', this.alHacerScroll);
        if (this.visible) {
            this.llegoAlFinal.emit();
        }
    };

    ngOnInit() {
        window.addEventListener('scroll', this.alHacerScroll, { passive: true });

        this.observador = new IntersectionObserver(
            (entradas) => {
                this.visible = entradas.some((entrada) => entrada.isIntersecting);//div a la vista Llego al final!
                if (this.visible && (this.huboScroll || !this.paginaConScroll())) {
                    this.llegoAlFinal.emit();
                }
            },
            { rootMargin: '300px' },//un toque antes
        );
        this.observador.observe(this.elemento.nativeElement);
    }

    ngOnDestroy() {
        this.observador?.disconnect();
        window.removeEventListener('scroll', this.alHacerScroll);
    }

    private paginaConScroll() {
        return document.documentElement.scrollHeight > window.innerHeight + 1;
    }
}
