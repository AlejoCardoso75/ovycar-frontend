import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DashboardService, DashboardResumen, DashboardAlertas } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  stats: DashboardResumen = {
    totalClientes: 0,
    totalVehiculos: 0,
    totalProductos: 0,
    mantenimientosProgramados: 0,
    mantenimientosEnProceso: 0,
    productosStockBajo: 0,
    productosSinStock: 0,
    facturasPendientes: 0,
    facturasVencidas: 0
  };

  alertas: DashboardAlertas = {
    productosStockBajo: [],
    productosSinStock: [],
    facturasVencidas: [],
    mantenimientosProgramados: []
  };

  loading = true;
  error = false;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = false;

    // Cargar resumen
    this.dashboardService.getResumen().subscribe({
      next: (resumen) => {
        this.stats = resumen;
        this.loadAlertas();
      },
      error: (error) => {
        console.error('Error cargando resumen:', error);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Error al cargar los datos del dashboard', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadAlertas(): void {
    this.dashboardService.getAlertas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando alertas:', error);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Error al cargar las alertas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getStockPercentage(stock: number, stockMinimo: number): number {
    return Math.min((stock / stockMinimo) * 100, 100);
  }

  getStockColor(stock: number, stockMinimo: number): string {
    const percentage = this.getStockPercentage(stock, stockMinimo);
    if (percentage <= 20) return 'warn';
    if (percentage <= 50) return 'accent';
    return 'primary';
  }

  refreshData(): void {
    this.loadDashboardData();
  }
} 