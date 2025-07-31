import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, ProductoDTO } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/productos`);
  }

  getProductoById(id: number): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/productos/${id}`);
  }

  getProductoByCodigo(codigo: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/productos/codigo/${codigo}`);
  }

  buscarProductos(termino: string): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/productos/buscar?termino=${termino}`);
  }

  getProductosStockBajo(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/productos/stock-bajo`);
  }

  getProductosSinStock(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/productos/sin-stock`);
  }

  createProducto(producto: Producto): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(`${this.apiUrl}/productos`, producto);
  }

  updateProducto(id: number, producto: Producto): Observable<ProductoDTO> {
    return this.http.put<ProductoDTO>(`${this.apiUrl}/productos/${id}`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`);
  }
} 