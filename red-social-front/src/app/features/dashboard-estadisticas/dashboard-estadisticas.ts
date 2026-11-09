import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { mensajeDeError } from '../../core/errores';
import { EstadisticasApi } from '../../core/estadisticas-api';
import { fechaHaceDias, fechaHoy } from '../../core/fechas';
import type {
    ComentariosPorDia,
    ComentariosPorPublicacion,
    PublicacionesPorUsuario,
} from '../../core/models/estadisticas.model';
import { Grafico } from '../../shared/grafico/grafico';

// [CICLO ESTADÍSTICAS · front] Pantalla dashboard/estadisticas (solo administrador)
@Component({
    selector: 'app-dashboard-estadisticas',
    imports: [ReactiveFormsModule, Grafico],
    templateUrl: './dashboard-estadisticas.html',
    styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
    private api = inject(EstadisticasApi);

    // El lapso elegido: por defecto, los últimos 30 días
    protected desde = new FormControl(fechaHaceDias(30), { nonNullable: true });
    protected hasta = new FormControl(fechaHoy(), { nonNullable: true });

    protected cargando = signal(false);
    protected error = signal('');

    protected publicacionesPorUsuario = signal<PublicacionesPorUsuario[]>([]);
    protected comentariosPorDia = signal<ComentariosPorDia[]>([]);
    protected comentariosPorPublicacion = signal<ComentariosPorPublicacion[]>([]);

    // Listas que necesita el gráfico: se recalculan solas cuando llegan datos nuevos.
    // Tienen que ser computed (y no funciones en el HTML) para que el array solo cambie
    // cuando cambian los datos; si no, el gráfico se redibujaría todo el tiempo.
    protected usuariosEtiquetas = computed(() => this.publicacionesPorUsuario().map((d) => d.usuario));
    protected usuariosValores = computed(() => this.publicacionesPorUsuario().map((d) => d.cantidad));
    protected diasEtiquetas = computed(() => this.comentariosPorDia().map((d) => d.fecha));
    protected diasValores = computed(() => this.comentariosPorDia().map((d) => d.cantidad));
    protected publicacionesEtiquetas = computed(() => this.comentariosPorPublicacion().map((d) => d.titulo));
    protected publicacionesValores = computed(() => this.comentariosPorPublicacion().map((d) => d.cantidad));

    ngOnInit() {
        this.cargar();
    }

    // [paso 1] Lo llama el botón "Ver estadísticas" (y una vez al abrir la pantalla)
    protected cargar() {
        const rango = { desde: this.desde.value, hasta: this.hasta.value };

        if (!rango.desde || !rango.hasta) {
            this.error.set('Elegí las dos fechas.');
            return;
        }
        // Las fechas "AAAA-MM-DD" se pueden comparar como texto
        if (rango.desde > rango.hasta) {
            this.error.set('La fecha "desde" no puede ser posterior a "hasta".');
            return;
        }

        this.error.set('');
        this.cargando.set(true);

        // [paso 2] Pido las 3 estadísticas juntas; forkJoin espera a que lleguen todas
        forkJoin({
            publicaciones: this.api.publicacionesPorUsuario(rango),
            dias: this.api.comentariosPorDia(rango),
            porPublicacion: this.api.comentariosPorPublicacion(rango),
        }).subscribe({
            // [paso 3] Llegaron las 3: las guardo en sus signals (los gráficos se actualizan solos)
            next: (resultado) => {
                this.publicacionesPorUsuario.set(resultado.publicaciones);
                this.comentariosPorDia.set(resultado.dias);
                this.comentariosPorPublicacion.set(resultado.porPublicacion);
                this.cargando.set(false);
            },
            error: (err: HttpErrorResponse) => {
                this.error.set(mensajeDeError(err));
                this.cargando.set(false);
            },
        });
    }
}