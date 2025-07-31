export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  tiempoEstimado?: number;
  activo?: boolean;
}

export interface ServicioDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  tiempoEstimado?: number;
  activo: boolean;
} 