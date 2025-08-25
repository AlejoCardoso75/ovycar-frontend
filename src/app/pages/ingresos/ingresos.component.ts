import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IngresosService, HistorialSemanas, ResumenSemanal, IngresoMantenimiento } from '../../services/ingresos.service';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss']
})
export class IngresosComponent implements OnInit {
  historial: HistorialSemanas | null = null;
  semanaSeleccionada: ResumenSemanal | null = null;
  mantenimientosFiltrados: IngresoMantenimiento[] = [];
  loading = false;
  error = false;

  // Variables de paginación
  currentPage = 1;
  itemsPerPage = 6; // Mostrar 6 semanas por página
  semanasPaginadas: ResumenSemanal[] = [];

  constructor(private ingresosService: IngresosService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;

    this.ingresosService.getHistorialSemanas().subscribe({
      next: (data) => {
        this.historial = data;
        this.currentPage = 1; // Reset a la primera página
        this.updatePaginacion();
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

  seleccionarSemana(semana: ResumenSemanal): void {
    this.semanaSeleccionada = semana;
    this.mantenimientosFiltrados = semana.mantenimientos || [];
  }

  getTotalMantenimientos(): number {
    if (!this.historial) return 0;
    return this.historial.semanas.reduce((total: number, semana: ResumenSemanal) => 
      total + semana.cantidadMantenimientos, 0);
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

  // Métodos de paginación
  get totalPages(): number {
    if (!this.historial) return 0;
    return Math.ceil(this.historial.semanas.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    if (!this.historial) return 0;
    return Math.min(this.startIndex + this.itemsPerPage, this.historial.semanas.length);
  }

  updatePaginacion(): void {
    if (!this.historial) {
      this.semanasPaginadas = [];
      return;
    }
    
    const start = this.startIndex;
    const end = this.endIndex;
    this.semanasPaginadas = this.historial.semanas.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginacion();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginacion();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginacion();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
} 