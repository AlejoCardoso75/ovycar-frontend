import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehiculo, VehiculoDTO } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllVehiculos(): Observable<VehiculoDTO[]> {
    return this.http.get<VehiculoDTO[]>(`${this.apiUrl}/vehiculos`);
  }

  getVehiculoById(id: number): Observable<VehiculoDTO> {
    return this.http.get<VehiculoDTO>(`${this.apiUrl}/vehiculos/${id}`);
  }

  getVehiculoByPlaca(placa: string): Observable<VehiculoDTO> {
    return this.http.get<VehiculoDTO>(`${this.apiUrl}/vehiculos/placa/${placa}`);
  }

  getVehiculosByCliente(clienteId: number): Observable<VehiculoDTO[]> {
    return this.http.get<VehiculoDTO[]>(`${this.apiUrl}/vehiculos/cliente/${clienteId}`);
  }

  buscarPorPlaca(placa: string): Observable<VehiculoDTO[]> {
    return this.http.get<VehiculoDTO[]>(`${this.apiUrl}/vehiculos/buscar/placa?placa=${placa}`);
  }

  buscarPorMarca(marca: string): Observable<VehiculoDTO[]> {
    return this.http.get<VehiculoDTO[]>(`${this.apiUrl}/vehiculos/buscar/marca?marca=${marca}`);
  }

  createVehiculo(vehiculo: any): Observable<VehiculoDTO> {
    return this.http.post<VehiculoDTO>(`${this.apiUrl}/vehiculos`, vehiculo);
  }

  updateVehiculo(id: number, vehiculo: any): Observable<VehiculoDTO> {
    return this.http.put<VehiculoDTO>(`${this.apiUrl}/vehiculos/${id}`, vehiculo);
  }

  deleteVehiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vehiculos/${id}`);
  }
} 