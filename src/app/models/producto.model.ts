export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  categoria?: string;
  marca?: string;
  activo?: boolean;
}

export interface ProductoDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  categoria?: string;
  marca?: string;
  activo: boolean;
} 