import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EgresosService, HistorialEgresosSemanas, ResumenEgresoSemanal, EgresoSemanal } from '../../services/egresos.service';

@Component({
  selector: 'app-egresos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './egresos.component.html',
  styleUrls: ['./egresos.component.scss']
})
export class EgresosComponent implements OnInit {
  historial: HistorialEgresosSemanas | null = null;
  semanaSeleccionada: ResumenEgresoSemanal | null = null;
  egresosFiltrados: EgresoSemanal[] = [];
  loading = false;
  error = false;

  constructor(private egresosService: EgresosService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;

    this.egresosService.getHistorialSemanas().subscribe({
      next: (data) => {
        this.historial = data;
        if (data.semanas.length > 0) {
          this.seleccionarSemana(data.semanas[0]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadData();
  }

  seleccionarSemana(semana: ResumenEgresoSemanal): void {
    this.semanaSeleccionada = semana;
    this.egresosFiltrados = semana.egresos || [];
  }

  getTotalEgresos(): number {
    if (!this.historial) return 0;
    return this.historial.semanas.reduce((total, semana) => 
      total + semana.cantidadEgresos, 0);
  }

  getFormattedSemana(semana: string): string {
    if (!semana) return '';
    const [year, week] = semana.split('-');
    return `Año ${year}`;
  }

  getFormattedDateRange(fechaInicio: Date | null, fechaFin: Date | null): string {
    if (!fechaInicio || !fechaFin) return '';
    const inicio = this.formatDate(fechaInicio);
    const fin = this.formatDate(fechaFin);
    return `${inicio} - ${fin}`;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const fecha = typeof date === 'string' ? new Date(date) : date;
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
