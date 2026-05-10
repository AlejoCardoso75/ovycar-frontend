import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateMecanicoDTO, MecanicoDTO } from '../models/mecanico.model';

@Injectable({
  providedIn: 'root'
})
export class MecanicoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMecanicosActivos(): Observable<MecanicoDTO[]> {
    return this.http.get<MecanicoDTO[]>(`${this.apiUrl}/mecanicos/activos`);
  }

  getAllMecanicos(): Observable<MecanicoDTO[]> {
    return this.http.get<MecanicoDTO[]>(`${this.apiUrl}/mecanicos`);
  }

  createMecanico(payload: CreateMecanicoDTO): Observable<MecanicoDTO> {
    return this.http.post<MecanicoDTO>(`${this.apiUrl}/mecanicos`, payload);
  }

  updateMecanico(id: number, payload: CreateMecanicoDTO): Observable<MecanicoDTO> {
    return this.http.put<MecanicoDTO>(`${this.apiUrl}/mecanicos/${id}`, payload);
  }

  deleteMecanico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mecanicos/${id}`);
  }
}
