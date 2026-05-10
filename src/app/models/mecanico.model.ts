export interface MecanicoDTO {
  id: number;
  nombre: string;
  porcentajeGanancia: number; // 0..1
  activo: boolean;
}

export interface CreateMecanicoDTO {
  nombre: string;
  porcentajeGanancia: number; // 0..1
  activo?: boolean;
}
