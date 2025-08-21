import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EgresoDTO, CreateEgresoDTO } from '../models/egreso.model';

@Injectable({
  providedIn: 'root'
})
export class EgresoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllEgresos(): Observable<EgresoDTO[]> {
    return this.http.get<EgresoDTO[]>(`${this.apiUrl}/egresos`);
  }

  getEgresoById(id: number): Observable<EgresoDTO> {
    return this.http.get<EgresoDTO>(`${this.apiUrl}/egresos/${id}`);
  }

  createEgreso(egreso: CreateEgresoDTO): Observable<EgresoDTO> {
    return this.http.post<EgresoDTO>(`${this.apiUrl}/egresos`, egreso);
  }

  updateEgreso(id: number, egreso: CreateEgresoDTO): Observable<EgresoDTO> {
    return this.http.put<EgresoDTO>(`${this.apiUrl}/egresos/${id}`, egreso);
  }

  deleteEgreso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/egresos/${id}`);
  }
}
