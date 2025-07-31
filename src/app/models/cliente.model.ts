export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fechaRegistro?: string;
  activo?: boolean;
}

export interface ClienteDTO {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fechaRegistro: string;
  activo: boolean;
} 