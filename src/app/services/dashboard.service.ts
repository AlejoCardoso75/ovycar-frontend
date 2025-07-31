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
  facturasPendientes: number;
  facturasVencidas: number;
}

export interface DashboardAlertas {
  productosStockBajo: any[];
  productosSinStock: any[];
  facturasVencidas: any[];
  mantenimientosProgramados: any[];
}

export interface EstadisticasVentas {
  facturasPagadas: number;
  montoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getResumen(): Observable<DashboardResumen> {
    // Por ahora, devolver datos de ejemplo
    const resumen: DashboardResumen = {
      totalClientes: 25,
      totalVehiculos: 30,
      totalProductos: 150,
      mantenimientosProgramados: 5,
      mantenimientosEnProceso: 3,
      productosStockBajo: 8,
      productosSinStock: 2,
      facturasPendientes: 12,
      facturasVencidas: 3
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