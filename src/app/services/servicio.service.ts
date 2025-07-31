import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServicioDTO } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllServicios(): Observable<ServicioDTO[]> {
    return this.http.get<ServicioDTO[]>(`${this.apiUrl}/servicios`);
  }

  getServicioById(id: number): Observable<ServicioDTO> {
    return this.http.get<ServicioDTO>(`${this.apiUrl}/servicios/${id}`);
  }

  createServicio(servicio: any): Observable<ServicioDTO> {
    return this.http.post<ServicioDTO>(`${this.apiUrl}/servicios`, servicio);
  }

  updateServicio(id: number, servicio: any): Observable<ServicioDTO> {
    return this.http.put<ServicioDTO>(`${this.apiUrl}/servicios/${id}`, servicio);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/servicios/${id}`);
  }
} 