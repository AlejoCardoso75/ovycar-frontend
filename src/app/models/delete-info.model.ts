export interface DeleteInfo {
  canDelete: boolean;
  reason: string;
  facturasCount: number;
  facturas: FacturaInfo[];
}

export interface FacturaInfo {
  id: number;
  numeroFactura: string;
  estado: string;
  fechaEmision: string;
  total: number;
}
