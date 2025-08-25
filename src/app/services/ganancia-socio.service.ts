import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GananciaSocioMantenimiento {
  id: number;
  fecha: Date;
  concepto: string;
  cliente: string;
  vehiculo: string;
  mecanico: string;
  estado: 'completado' | 'en_proceso' | 'cancelado' | 'pendiente';
  semana: string;
  ingresoNeto?: number;
}

export interface ResumenSemanalSocio {
  semana: string;
  fechaInicio: Date;
  fechaFin: Date;
  ingresosNetos: number;
  egresos: number;
  gananciaSocio: number;
  cantidadMantenimientos: number;
  mantenimientos: GananciaSocioMantenimiento[];
}

export interface HistorialSemanasSocio {
  semanas: ResumenSemanalSocio[];
  totalIngresosNetos: number;
  totalEgresos: number;
  totalGananciaSocio: number;
  promedioSemanal: number;
}

@Injectable({
  providedIn: 'root'
})
export class GananciaSocioService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener historial completo de semanas
  getHistorialSemanas(): Observable<HistorialSemanasSocio> {
    return this.http.get<HistorialSemanasSocio>(`${this.apiUrl}/ganancia-socio/historial-semanas`);
  }

  // Obtener resumen de una semana específica
  getResumenSemana(semana: string): Observable<ResumenSemanalSocio> {
    return this.http.get<ResumenSemanalSocio>(`${this.apiUrl}/ganancia-socio/semana/${semana}`);
  }

  // Obtener ganancia por socio por rango de fechas
  getGananciaPorFecha(fechaInicio: Date, fechaFin: Date): Observable<GananciaSocioMantenimiento[]> {
    const params = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    };
    return this.http.get<GananciaSocioMantenimiento[]>(`${this.apiUrl}/ganancia-socio/por-fecha`, { params });
  }

  // Método de respaldo con datos de ejemplo (solo para desarrollo)
  getDatosEjemplo(): Observable<HistorialSemanasSocio> {
    console.warn('Usando datos de ejemplo - Backend no disponible');
    
    const historial: HistorialSemanasSocio = {
      semanas: [
        {
          semana: "2024-52",
          fechaInicio: new Date(2024, 11, 23),
          fechaFin: new Date(2024, 11, 29),
          ingresosNetos: 242500,
          egresos: 150000,
          gananciaSocio: 92500,
          cantidadMantenimientos: 6,
          mantenimientos: [
            {
              id: 1,
              fecha: new Date(2024, 11, 25),
              concepto: 'Cambio de aceite y filtros Toyota Corolla',
              cliente: 'Juan Pérez',
              vehiculo: 'Toyota Corolla - ABC123',
              mecanico: 'Carlos Méndez',
              estado: 'completado',
              semana: "2024-52",
              ingresoNeto: 42500
            },
            {
              id: 2,
              fecha: new Date(2024, 11, 26),
              concepto: 'Mantenimiento preventivo Honda Civic',
              cliente: 'María González',
              vehiculo: 'Honda Civic - XYZ789',
              mecanico: 'Roberto Silva',
              estado: 'completado',
              semana: "2024-52",
              ingresoNeto: 60000
            }
          ]
        }
      ],
      totalIngresosNetos: 242500,
      totalEgresos: 150000,
      totalGananciaSocio: 92500,
      promedioSemanal: 92500
    };
    
    return of(historial);
  }
}
