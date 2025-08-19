export enum EstadoMantenimiento {
  PROGRAMADO = 'PROGRAMADO',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export interface Mantenimiento {
  id?: number;
  vehiculoId: number;
  tipoMantenimiento: string;
  descripcion?: string;
  fechaProgramada: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: EstadoMantenimiento;
  kilometrajeActual?: number;
  observaciones?: string;
  costo?: number;
}

export interface MantenimientoDTO {
  id: number;
  vehiculoId: number;
  vehiculoPlaca: string;
  vehiculoMarca: string;
  vehiculoModelo: string;
  clienteId: number;
  clienteNombre: string;
  tipoMantenimiento: string;
  descripcion?: string;
  fechaProgramada: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: EstadoMantenimiento;
  kilometrajeActual?: number;
  observaciones?: string;
  costo?: number;
  fechaRegistro: string;
} 