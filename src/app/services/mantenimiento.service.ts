import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mantenimiento, MantenimientoDTO } from '../models/mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllMantenimientos(): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos`);
  }

  getMantenimientoById(id: number): Observable<MantenimientoDTO> {
    return this.http.get<MantenimientoDTO>(`${this.apiUrl}/mantenimientos/${id}`);
  }

  getMantenimientosByVehiculo(vehiculoId: number): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/vehiculo/${vehiculoId}`);
  }

  getMantenimientosByCliente(clienteId: number): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/cliente/${clienteId}`);
  }

  getMantenimientosByEstado(estado: string): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/estado/${estado}`);
  }

  getMantenimientosProgramados(): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/programados`);
  }

  getMantenimientosEnProceso(): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/en-proceso`);
  }

  getMantenimientosCompletados(): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/completados`);
  }

  buscarMantenimientos(termino: string): Observable<MantenimientoDTO[]> {
    return this.http.get<MantenimientoDTO[]>(`${this.apiUrl}/mantenimientos/buscar?termino=${termino}`);
  }

  createMantenimiento(mantenimiento: Mantenimiento): Observable<MantenimientoDTO> {
    return this.http.post<MantenimientoDTO>(`${this.apiUrl}/mantenimientos`, mantenimiento);
  }

  updateMantenimiento(id: number, mantenimiento: Mantenimiento): Observable<MantenimientoDTO> {
    return this.http.put<MantenimientoDTO>(`${this.apiUrl}/mantenimientos/${id}`, mantenimiento);
  }

  deleteMantenimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mantenimientos/${id}`);
  }

  iniciarMantenimiento(id: number): Observable<MantenimientoDTO> {
    return this.http.put<MantenimientoDTO>(`${this.apiUrl}/mantenimientos/${id}/iniciar`, {});
  }

  completarMantenimiento(id: number): Observable<MantenimientoDTO> {
    return this.http.put<MantenimientoDTO>(`${this.apiUrl}/mantenimientos/${id}/completar`, {});
  }

  cancelarMantenimiento(id: number): Observable<MantenimientoDTO> {
    return this.http.put<MantenimientoDTO>(`${this.apiUrl}/mantenimientos/${id}/cancelar`, {});
  }
} 