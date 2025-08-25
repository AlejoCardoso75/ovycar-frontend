import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GananciaSocioService } from '../../services/ganancia-socio.service';

@Component({
  selector: 'app-ganancia-socio',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './ganancia-socio.component.html',
  styleUrls: ['./ganancia-socio.component.scss']
})
export class GananciaSocioComponent implements OnInit {
  loading = false;
  error = false;
  historial: any = null;
  semanaSeleccionada: any = null;
  mantenimientosFiltrados: any[] = [];

  // Paginación
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;
  semanasPaginadas: any[] = [];

  constructor(private gananciaSocioService: GananciaSocioService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    // Obtener datos reales del backend
    this.gananciaSocioService.getHistorialSemanas().subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del backend:', data);
        this.historial = data;
        this.semanaSeleccionada = data.semanas && data.semanas.length > 0 ? data.semanas[0] : null;
        this.mantenimientosFiltrados = this.semanaSeleccionada?.mantenimientos || [];
        this.calculatePagination();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando datos del backend:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  refreshData() {
    this.loadData();
  }

  seleccionarSemana(semana: any) {
    this.semanaSeleccionada = semana;
    this.mantenimientosFiltrados = semana.mantenimientos || [];
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
  }

  getFormattedDateRange(fechaInicio: Date, fechaFin: Date): string {
    if (!fechaInicio || !fechaFin) return '';
    const inicio = new Date(fechaInicio).toLocaleDateString('es-ES');
    const fin = new Date(fechaFin).toLocaleDateString('es-ES');
    return `${inicio} - ${fin}`;
  }

  getFormattedSemana(semana: string): string {
    if (!semana) return '';
    const [year, week] = semana.split('-');
    return `Semana ${week} del ${year}`;
  }

  // Métodos de paginación
  calculatePagination() {
    if (!this.historial?.semanas) return;
    
    this.totalPages = Math.ceil(this.historial.semanas.length / this.itemsPerPage);
    this.updatePagination();
  }

  updatePagination() {
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.historial.semanas.length);
    this.semanasPaginadas = this.historial.semanas.slice(this.startIndex, this.endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
