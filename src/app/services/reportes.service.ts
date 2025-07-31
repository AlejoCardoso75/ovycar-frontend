import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  descargarInventarioPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario/pdf`, { responseType: 'blob' });
  }

  descargarInventarioExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario/excel`, { responseType: 'blob' });
  }
} 