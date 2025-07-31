export enum EstadoFactura {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA'
}

export interface Factura {
  id?: number;
  numeroFactura?: string;
  clienteId: number;
  mantenimientoId?: number;
  fechaEmision: string;
  fechaVencimiento?: string;
  subtotal?: number;
  impuestos?: number;
  descuento?: number;
  total: number;
  estado: EstadoFactura;
  observaciones?: string;
  detalles?: DetalleFactura[];
}

export interface FacturaDTO {
  id: number;
  numeroFactura: string;
  clienteId: number;
  clienteNombre: string;
  mantenimientoId?: number;
  fechaEmision: string;
  fechaVencimiento?: string;
  subtotal?: number;
  impuestos?: number;
  descuento?: number;
  total: number;
  estado: EstadoFactura;
  observaciones?: string;
  fechaRegistro: string;
  detalles?: DetalleFacturaDTO[];
}

export interface DetalleFactura {
  id?: number;
  facturaId?: number;
  servicioId?: number;
  productoId?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descripcion?: string;
  tipoItem: TipoItem;
}

export interface DetalleFacturaDTO {
  id: number;
  facturaId: number;
  servicioId?: number;
  servicioNombre?: string;
  productoId?: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descripcion?: string;
  tipoItem: TipoItem;
}

export enum TipoItem {
  SERVICIO = 'SERVICIO',
  PRODUCTO = 'PRODUCTO',
  OTRO = 'OTRO'
} 