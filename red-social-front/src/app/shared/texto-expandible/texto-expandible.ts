import { Component, computed, input, signal } from '@angular/core';

// Muestra un texto recortado y, si es largo, un botón "Ver más / Ver menos".
// Se recorta por cantidad de caracteres o de líneas, lo que ocurra primero.
@Component({
    selector: 'app-texto-expandible',
    templateUrl: './texto-expandible.html',
    styleUrl: './texto-expandible.css',
})
export class TextoExpandible {
    // Dato que RECIBE del padre
    readonly texto = input.required<string>();
    readonly limite = input(300); // caracteres que se ven antes de cortar
    readonly lineas = input(6); // líneas que se ven antes de cortar

    protected readonly expandido = signal(false);

    // El comienzo del texto: primero corta por líneas y después por caracteres
    private readonly recortado = computed(() => {
        const porLineas = this.texto().split('\n').slice(0, this.lineas()).join('\n');
        return porLineas.slice(0, this.limite());
    });

    // ¿Se cortó algo? Si es así, hace falta el botón
    protected readonly esLargo = computed(() => this.recortado().length < this.texto().length);

    // Lo que realmente se dibuja
    protected readonly textoVisible = computed(() =>
        this.expandido() || !this.esLargo() ? this.texto() : this.recortado().trimEnd() + '…',
    );

    protected alternar() {
        this.expandido.update((valor) => !valor);
    }
}