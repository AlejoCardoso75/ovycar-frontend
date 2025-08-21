export interface Egreso {
  id?: number;
  concepto: string;
  descripcion?: string;
  monto: number;
  categoria?: string;
  fechaEgreso: Date;
  fechaRegistro?: Date;
  responsable?: string;
  activo?: boolean;
}

export interface EgresoDTO {
  id: number;
  concepto: string;
  descripcion?: string;
  monto: number;
  categoria?: string;
  fechaEgreso: string;
  fechaRegistro: string;
  responsable?: string;
  activo: boolean;
}

export interface CreateEgresoDTO {
  concepto: string;
  descripcion?: string;
  monto: number;
  categoria?: string;
  fechaEgreso?: Date;
  responsable?: string;
}
