export interface Vehiculo {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  anio?: string;
  color?: string;
  numeroVin?: string;
  kilometraje?: number;
  clienteId: number;
  cliente?: Cliente;
  activo?: boolean;
}

export interface VehiculoDTO {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio?: string;
  color?: string;
  numeroVin?: string;
  kilometraje?: number;
  clienteId: number;
  clienteNombre: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
}

export interface ClienteDTO {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
} 