import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EgresoSemanal {
  id: number;
  fechaEgreso: Date;
  concepto: string;
  monto: number;
  categoria: string;
  responsable: string;
  semana: string;
}

export interface ResumenEgresoSemanal {
  semana: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalEgresos: number;
  cantidadEgresos: number;
  promedioPorEgreso: number;
  crecimientoVsSemanaAnterior: number;
  egresos: EgresoSemanal[];
}

export interface HistorialEgresosSemanas {
  semanas: ResumenEgresoSemanal[];
  totalGeneral: number;
  promedioSemanal: number;
  crecimientoPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class EgresosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHistorialSemanas(): Observable<HistorialEgresosSemanas> {
    return this.http.get<HistorialEgresosSemanas>(`${this.apiUrl}/egresos-reportes/historial-semanas`);
  }

  getResumenSemana(semana: string): Observable<ResumenEgresoSemanal> {
    return this.http.get<ResumenEgresoSemanal>(`${this.apiUrl}/egresos-reportes/semana/${semana}`);
  }

  getEgresosPorFecha(fechaInicio: Date, fechaFin: Date): Observable<EgresoSemanal[]> {
    const params = {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    };
    return this.http.get<EgresoSemanal[]>(`${this.apiUrl}/egresos-reportes/por-fecha`, { params });
  }
}
