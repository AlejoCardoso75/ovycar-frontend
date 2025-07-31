import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { IngresosService, Ingreso, ResumenIngresos } from '../../services/ingresos.service';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss']
})
export class IngresosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fecha', 'concepto', 'tipo', 'monto', 'cliente', 'estado'];
  dataSource = new MatTableDataSource<Ingreso>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtros
  periodoSeleccionado: 'semanal' | 'mensual' | 'trimestral' | 'anual' = 'mensual';
  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();

  // Datos
  ingresos: Ingreso[] = [];
  ingresosFiltrados: Ingreso[] = [];
  resumen: ResumenIngresos = {
    total: 0,
    ventas: 0,
    servicios: 0,
    mantenimientos: 0,
    promedio: 0,
    crecimiento: 0
  };

  constructor(private ingresosService: IngresosService, private snackBar: MatSnackBar) {
    this.configurarFechas();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  configurarFechas(): void {
    const hoy = new Date();
    this.fechaFin = hoy;
    
    switch (this.periodoSeleccionado) {
      case 'semanal':
        this.fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mensual':
        this.fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'trimestral':
        this.fechaInicio = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
        break;
      case 'anual':
        this.fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
    }
  }

  cambiarPeriodo(): void {
    this.configurarFechas();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    // Usar datos de ejemplo por ahora
    this.ingresosService.getDatosEjemplo().subscribe(ingresos => {
      this.ingresos = ingresos;
      this.ingresosFiltrados = ingresos.filter(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        return fechaIngreso >= this.fechaInicio && fechaIngreso <= this.fechaFin;
      });
      this.dataSource.data = this.ingresosFiltrados;
      this.calcularResumen();
    });
  }

  cargarDatos(): void {
    this.aplicarFiltros();
  }

  calcularResumen(): void {
    const total = this.ingresosFiltrados.reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const ventas = this.ingresosFiltrados
      .filter(ingreso => ingreso.tipo === 'venta')
      .reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const servicios = this.ingresosFiltrados
      .filter(ingreso => ingreso.tipo === 'servicio')
      .reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const mantenimientos = this.ingresosFiltrados
      .filter(ingreso => ingreso.tipo === 'mantenimiento')
      .reduce((sum, ingreso) => sum + ingreso.monto, 0);

    this.resumen = {
      total,
      ventas,
      servicios,
      mantenimientos,
      promedio: this.ingresosFiltrados.length > 0 ? total / this.ingresosFiltrados.length : 0,
      crecimiento: 12.5 // Ejemplo de crecimiento
    };
  }
} 