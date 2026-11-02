import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-modal-confirmacion',
    templateUrl: './modal-confirmacion.html',
    styleUrl: './modal-confirmacion.css',
    // 1. Si tocan la tecla Esc en cualquier parte de la página, avisa "cancelar"
    host: { '(document:keydown.escape)': 'cancelar.emit()' },
})
export class ModalConfirmacion {
    // 2. Datos que RECIBE del padre (el texto cambia según para qué se use)
    readonly titulo = input.required<string>();
    readonly mensaje = input.required<string>();
    readonly textoConfirmar = input('Confirmar'); // con valor por defecto

    // 3. Avisos que ENVÍA al padre
    readonly confirmar = output<void>();
    readonly cancelar = output<void>();
}