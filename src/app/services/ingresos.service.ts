import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Ingreso {
  id: number;
  fecha: Date;
  concepto: string;
  monto: number;
  tipo: 'venta' | 'servicio' | 'mantenimiento';
  cliente?: string;
  factura?: string;
  estado: 'pagado' | 'pendiente' | 'cancelado';
}

export interface ResumenIngresos {
  total: number;
  ventas: number;
  servicios: number;
  mantenimientos: number;
  promedio: number;
  crecimiento: number;
}

export interface FiltroIngresos {
  fechaInicio: Date;
  fechaFin: Date;
  tipo?: string;
  estado?: string;
  cliente?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngresosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener todos los ingresos
  getAllIngresos(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.apiUrl}/ingresos`);
  }

  // Obtener ingresos con filtros
  getIngresosFiltrados(filtros: FiltroIngresos): Observable<Ingreso[]> {
    const params = new URLSearchParams();
    params.append('fechaInicio', filtros.fechaInicio.toISOString());
    params.append('fechaFin', filtros.fechaFin.toISOString());
    
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.cliente) params.append('cliente', filtros.cliente);

    return this.http.get<Ingreso[]>(`${this.apiUrl}/ingresos/filtrados?${params.toString()}`);
  }

  // Obtener resumen de ingresos
  getResumenIngresos(fechaInicio: Date, fechaFin: Date): Observable<ResumenIngresos> {
    const params = new URLSearchParams();
    params.append('fechaInicio', fechaInicio.toISOString());
    params.append('fechaFin', fechaFin.toISOString());

    return this.http.get<ResumenIngresos>(`${this.apiUrl}/ingresos/resumen?${params.toString()}`);
  }

  // Obtener ingresos por período
  getIngresosPorPeriodo(periodo: 'semanal' | 'mensual' | 'trimestral' | 'anual'): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${this.apiUrl}/ingresos/periodo/${periodo}`);
  }

  // Crear nuevo ingreso
  createIngreso(ingreso: Omit<Ingreso, 'id'>): Observable<Ingreso> {
    return this.http.post<Ingreso>(`${this.apiUrl}/ingresos`, ingreso);
  }

  // Actualizar ingreso
  updateIngreso(id: number, ingreso: Partial<Ingreso>): Observable<Ingreso> {
    return this.http.put<Ingreso>(`${this.apiUrl}/ingresos/${id}`, ingreso);
  }

  // Eliminar ingreso
  deleteIngreso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingresos/${id}`);
  }

  // Obtener estadísticas de crecimiento
  getEstadisticasCrecimiento(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ingresos/estadisticas`);
  }

  // Datos de ejemplo para desarrollo
  getDatosEjemplo(): Observable<Ingreso[]> {
    const ingresos: Ingreso[] = [
      {
        id: 1,
        fecha: new Date(2024, 11, 25),
        concepto: 'Cambio de aceite Toyota Corolla',
        monto: 85000,
        tipo: 'servicio',
        cliente: 'Juan Pérez',
        factura: 'FAC-001',
        estado: 'pagado'
      },
      {
        id: 2,
        fecha: new Date(2024, 11, 24),
        concepto: 'Venta de frenos delanteros',
        monto: 65000,
        tipo: 'venta',
        cliente: 'María González',
        factura: 'FAC-002',
        estado: 'pagado'
      },
      {
        id: 3,
        fecha: new Date(2024, 11, 23),
        concepto: 'Mantenimiento preventivo Honda Civic',
        monto: 120000,
        tipo: 'mantenimiento',
        cliente: 'Carlos Rodríguez',
        factura: 'FAC-003',
        estado: 'pagado'
      },
      {
        id: 4,
        fecha: new Date(2024, 11, 22),
        concepto: 'Venta de batería 60Ah',
        monto: 250000,
        tipo: 'venta',
        cliente: 'Ana López',
        factura: 'FAC-004',
        estado: 'pagado'
      },
      {
        id: 5,
        fecha: new Date(2024, 11, 21),
        concepto: 'Alineación y balanceo',
        monto: 80000,
        tipo: 'servicio',
        cliente: 'Luis Martínez',
        factura: 'FAC-005',
        estado: 'pendiente'
      },
      {
        id: 6,
        fecha: new Date(2024, 11, 20),
        concepto: 'Cambio de llantas completas',
        monto: 720000,
        tipo: 'mantenimiento',
        cliente: 'Pedro García',
        factura: 'FAC-006',
        estado: 'pagado'
      },
      {
        id: 7,
        fecha: new Date(2024, 11, 19),
        concepto: 'Venta de filtros de aire',
        monto: 20000,
        tipo: 'venta',
        cliente: 'Carmen Ruiz',
        factura: 'FAC-007',
        estado: 'pagado'
      },
      {
        id: 8,
        fecha: new Date(2024, 11, 18),
        concepto: 'Diagnóstico computarizado',
        monto: 35000,
        tipo: 'servicio',
        cliente: 'Roberto Silva',
        factura: 'FAC-008',
        estado: 'pagado'
      },
      {
        id: 9,
        fecha: new Date(2024, 11, 17),
        concepto: 'Venta de aceite de transmisión',
        monto: 50000,
        tipo: 'venta',
        cliente: 'Patricia Morales',
        factura: 'FAC-009',
        estado: 'pagado'
      },
      {
        id: 10,
        fecha: new Date(2024, 11, 16),
        concepto: 'Reparación de sistema de frenos',
        monto: 185000,
        tipo: 'mantenimiento',
        cliente: 'Fernando Herrera',
        factura: 'FAC-010',
        estado: 'pagado'
      }
    ];

    return of(ingresos);
  }
} 