import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardResumen {
  totalClientes: number;
  totalVehiculos: number;
  totalProductos: number;
  mantenimientosProgramados: number;
  mantenimientosEnProceso: number;
  productosStockBajo: number;
  productosSinStock: number;
}

export interface DashboardAlertas {
  productosStockBajo: unknown[];
  productosSinStock: unknown[];
  mantenimientosProgramados: unknown[];
}

/** Totales de ingresos por mantenimientos en un rango de fechas (backend: /dashboard/estadisticas-ventas). */
export interface EstadisticasVentas {
  ingresosRegistrados: number;
  montoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getResumen(): Observable<DashboardResumen> {
    const resumen: DashboardResumen = {
      totalClientes: 25,
      totalVehiculos: 30,
      totalProductos: 150,
      mantenimientosProgramados: 5,
      mantenimientosEnProceso: 3,
      productosStockBajo: 8,
      productosSinStock: 2
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(resumen);
        observer.complete();
      }, 500);
    });
  }

  getAlertas(): Observable<DashboardAlertas> {
    return this.http.get<DashboardAlertas>(`${this.apiUrl}/dashboard/alertas`);
  }

  getEstadisticasVentas(fechaInicio: string, fechaFin: string): Observable<EstadisticasVentas> {
    return this.http.get<EstadisticasVentas>(`${this.apiUrl}/dashboard/estadisticas-ventas`, {
      params: { fechaInicio, fechaFin }
    });
  }
}
