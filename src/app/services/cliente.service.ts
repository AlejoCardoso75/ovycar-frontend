import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, ClienteDTO } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllClientes(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(`${this.apiUrl}/clientes`);
  }

  getClienteById(id: number): Observable<ClienteDTO> {
    return this.http.get<ClienteDTO>(`${this.apiUrl}/clientes/${id}`);
  }

  getClienteByDocumento(documento: string): Observable<ClienteDTO> {
    return this.http.get<ClienteDTO>(`${this.apiUrl}/clientes/documento/${documento}`);
  }

  buscarClientes(termino: string): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(`${this.apiUrl}/clientes/buscar?termino=${termino}`);
  }

  createCliente(cliente: Cliente): Observable<ClienteDTO> {
    return this.http.post<ClienteDTO>(`${this.apiUrl}/clientes`, cliente);
  }

  updateCliente(id: number, cliente: Cliente): Observable<ClienteDTO> {
    return this.http.put<ClienteDTO>(`${this.apiUrl}/clientes/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clientes/${id}`);
  }
} 