import { afterRenderEffect, Component, ElementRef, input, viewChild } from '@angular/core';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

// Colores de la app (naranja principal) y paleta para la torta
const COLOR_PRINCIPAL = '#f97316';
const COLORES_TORTA = ['#f97316', '#facc15', '#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#fb7185', '#94a3b8'];

// Ajustes globales para que se lea bien sobre el fondo oscuro
Chart.defaults.color = '#b9b8b2';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

// [CICLO ESTADÍSTICAS · gráfico] Componente reutilizable: dibuja barras, líneas o torta
@Component({
    selector: 'app-grafico',
    templateUrl: './grafico.html',
    styleUrl: './grafico.css',
})
export class Grafico {
    // Lo que el componente padre le pasa
    tipo = input.required<'bar' | 'line' | 'pie'>();
    nombre = input('Cantidad'); // el nombre de la serie (sale al pasar el mouse)
    etiquetas = input.required<string[]>();
    valores = input.required<number[]>();

    // El <canvas> de grafico.html (el que tiene #lienzo)
    private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

    constructor() {
        // Se ejecuta después de dibujar la pantalla y cada vez que cambia un input:
        // borra el gráfico anterior y crea uno nuevo con los datos nuevos
        afterRenderEffect((onCleanup) => {
            const tipo = this.tipo();
            const esTorta = tipo === 'pie';

            const config: ChartConfiguration = {
                type: tipo,
                data: {
                    labels: this.etiquetas(),
                    datasets: [
                        {
                            label: this.nombre(),
                            data: this.valores(),
                            backgroundColor: esTorta ? COLORES_TORTA : COLOR_PRINCIPAL,
                            borderColor: esTorta ? '#2f2f2c' : COLOR_PRINCIPAL,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // se adapta a la altura de la caja
                    plugins: { legend: { display: esTorta } }, // la leyenda solo sirve en la torta
                    // En barras y líneas: eje vertical desde 0 y solo números enteros
                    scales: esTorta ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } },
                },
            };

            const grafico = new Chart(this.lienzo().nativeElement, config);
            onCleanup(() => grafico.destroy());
        });
    }
}