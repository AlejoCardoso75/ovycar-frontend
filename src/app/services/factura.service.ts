import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura, FacturaDTO } from '../models/factura.model';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllFacturas(): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(`${this.apiUrl}/facturas`);
  }

  getFacturaById(id: number): Observable<FacturaDTO> {
    return this.http.get<FacturaDTO>(`${this.apiUrl}/facturas/${id}`);
  }

  getFacturaByNumero(numeroFactura: string): Observable<FacturaDTO> {
    return this.http.get<FacturaDTO>(`${this.apiUrl}/facturas/numero/${numeroFactura}`);
  }

  getFacturasByCliente(clienteId: number): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(`${this.apiUrl}/facturas/cliente/${clienteId}`);
  }

  getFacturasByEstado(estado: string): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(`${this.apiUrl}/facturas/estado/${estado}`);
  }

  getFacturasVencidas(): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(`${this.apiUrl}/facturas/vencidas`);
  }

  getEstadisticas(fechaInicio: string, fechaFin: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/facturas/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }

  createFactura(factura: Factura): Observable<FacturaDTO> {
    return this.http.post<FacturaDTO>(`${this.apiUrl}/facturas`, factura);
  }

  updateFactura(id: number, factura: Factura): Observable<FacturaDTO> {
    return this.http.put<FacturaDTO>(`${this.apiUrl}/facturas/${id}`, factura);
  }

  deleteFactura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/facturas/${id}`);
  }

  marcarComoPagada(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/facturas/${id}/pagar`, {});
  }

  cancelarFactura(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/facturas/${id}/cancelar`, {});
  }

  buscarFacturas(termino: string): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(`${this.apiUrl}/facturas/buscar?termino=${termino}`);
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/facturas/${id}/pdf`, { responseType: 'blob' });
  }
} 