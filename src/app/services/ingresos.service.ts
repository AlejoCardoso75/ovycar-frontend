import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IngresoMantenimiento {
  id: number;
  fecha: Date;
  concepto: string;
  monto: number;
  cliente: string;
  vehiculo: string;
  mecanico: string;
  estado: 'completado' | 'en_proceso' | 'cancelado' | 'pendiente';
  semana: string; // Formato: "YYYY-WW" (año-semana)
}

export interface ResumenSemanal {
  semana: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalIngresos: number;
  cantidadMantenimientos: number;
  promedioPorMantenimiento: number;
  crecimientoVsSemanaAnterior: number;
  mantenimientos: IngresoMantenimiento[];
}

export interface HistorialSemanas {
  semanas: ResumenSemanal[];
  totalGeneral: number;
  promedioSemanal: number;
  crecimientoPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class IngresosService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener historial completo de semanas
  getHistorialSemanas(): Observable<HistorialSemanas> {
    return this.http.get<HistorialSemanas>(`${this.apiUrl}/ingresos/historial-semanas`);
  }

  // Obtener resumen de una semana específica
  getResumenSemana(semana: string): Observable<ResumenSemanal> {
    return this.http.get<ResumenSemanal>(`${this.apiUrl}/ingresos/semana/${semana}`);
  }

  // Obtener ingresos por rango de fechas
  getIngresosPorFecha(fechaInicio: Date, fechaFin: Date): Observable<IngresoMantenimiento[]> {
    const params = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    };
    return this.http.get<IngresoMantenimiento[]>(`${this.apiUrl}/ingresos/por-fecha`, { params });
  }

  // Métodos auxiliares para cálculos de fechas
  getSemana(fecha: Date): string {
    const year = fecha.getFullYear();
    const week = this.getWeekNumber(fecha);
    return `${year}-${week.toString().padStart(2, '0')}`;
  }

  getFechasSemana(semana: string): { fechaInicio: Date; fechaFin: Date } {
    const [year, week] = semana.split('-').map(Number);
    
    // Calcular el primer día del año
    const firstDayOfYear = new Date(year, 0, 1);
    
    // Calcular el primer día de la semana
    const daysToAdd = (week - 1) * 7;
    const firstDayOfWeek = new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    
    // Ajustar al lunes
    const dayOfWeek = firstDayOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(firstDayOfWeek.getTime() - daysToMonday * 24 * 60 * 60 * 1000);
    
    // Domingo es 6 días después del lunes
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return { fechaInicio: monday, fechaFin: sunday };
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Método de respaldo con datos de ejemplo (solo para desarrollo)
  getDatosEjemplo(): Observable<HistorialSemanas> {
    // Solo usar en caso de que el backend no esté disponible
    console.warn('Usando datos de ejemplo - Backend no disponible');
    
    const historial: HistorialSemanas = {
      semanas: [
        {
          semana: "2024-52",
          fechaInicio: new Date(2024, 11, 23),
          fechaFin: new Date(2024, 11, 29),
          totalIngresos: 485000,
          cantidadMantenimientos: 6,
          promedioPorMantenimiento: 80833,
          crecimientoVsSemanaAnterior: 15.2,
          mantenimientos: [
            {
              id: 1,
              fecha: new Date(2024, 11, 25),
              concepto: 'Cambio de aceite y filtros Toyota Corolla',
              monto: 85000,
              cliente: 'Juan Pérez',
              vehiculo: 'Toyota Corolla - ABC123',
              mecanico: 'Carlos Méndez',
              estado: 'completado',
              semana: "2024-52"
            },
            {
              id: 2,
              fecha: new Date(2024, 11, 26),
              concepto: 'Mantenimiento preventivo Honda Civic',
              monto: 120000,
              cliente: 'María González',
              vehiculo: 'Honda Civic - XYZ789',
              mecanico: 'Roberto Silva',
              estado: 'completado',
              semana: "2024-52"
            }
          ]
        }
      ],
      totalGeneral: 485000,
      promedioSemanal: 485000,
      crecimientoPromedio: 15.2
    };
    
    return of(historial);
  }
} 