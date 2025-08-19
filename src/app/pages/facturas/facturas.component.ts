import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FacturaService } from '../../services/factura.service';
import { ClienteService } from '../../services/cliente.service';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ProductoService } from '../../services/producto.service';
import { ServicioService } from '../../services/servicio.service';
import { Factura, FacturaDTO, EstadoFactura, DetalleFactura, TipoItem } from '../../models/factura.model';
import { ClienteDTO } from '../../models/cliente.model';
import { MantenimientoDTO } from '../../models/mantenimiento.model';
import { ProductoDTO } from '../../models/producto.model';
import { ServicioDTO } from '../../models/servicio.model';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.scss']
})
export class FacturasComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['numeroFactura', 'cliente', 'fechaEmision', 'total', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<FacturaDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FacturaDTO>;

  facturaForm!: FormGroup;
  isEditing = false;
  selectedFactura: FacturaDTO | null = null;
  searchTerm = '';
  showDialog = false;
  clientes: ClienteDTO[] = [];
  filteredClientes!: Observable<ClienteDTO[]>;
  selectedCliente: ClienteDTO | null = null;
  mantenimientos: MantenimientoDTO[] = [];
  mantenimientosCliente: MantenimientoDTO[] = [];
  productos: ProductoDTO[] = [];
  servicios: ServicioDTO[] = [];
  estados = Object.values(EstadoFactura);
  tiposItem = Object.values(TipoItem);

  // Filtros por estado
  selectedEstado: EstadoFactura | 'TODOS' = 'TODOS';
  facturasPendientes: FacturaDTO[] = [];
  facturasPagadas: FacturaDTO[] = [];
  facturasVencidas: FacturaDTO[] = [];
  facturasCanceladas: FacturaDTO[] = [];

  // Estadísticas
  estadisticas = {
    total: 0,
    pendientes: 0,
    pagadas: 0,
    vencidas: 0,
    canceladas: 0,
    totalIngresos: 0
  };

  constructor(
    private facturaService: FacturaService,
    private clienteService: ClienteService,
    private mantenimientoService: MantenimientoService,
    private productoService: ProductoService,
    private servicioService: ServicioService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadFacturas();
    this.loadClientes();
    this.loadMantenimientos();
    this.loadProductos();
    this.loadServicios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.facturaForm = this.fb.group({
      clienteSearch: ['', [Validators.required]],
      clienteId: ['', [Validators.required]],
      mantenimientoId: [''],
      fechaEmision: [new Date().toISOString().split('T')[0], [Validators.required]],
      subtotal: [0, [Validators.min(0)]],
      impuestos: [0, [Validators.min(0)]],
      descuento: [0, [Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      observaciones: [''],
      detalles: this.fb.array([])
    });
  }

  get detallesArray(): FormArray {
    return this.facturaForm.get('detalles') as FormArray;
  }

  addDetalle(): void {
    const detalle = this.fb.group({
      tipoItem: ['', [Validators.required]],
      servicioId: [''],
      productoId: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      descripcion: ['']
    });

    this.detallesArray.push(detalle);
  }

  removeDetalle(index: number): void {
    this.detallesArray.removeAt(index);
    this.calcularTotales();
  }

  onTipoItemChange(index: number): void {
    const detalle = this.detallesArray.at(index);
    const tipoItem = detalle.get('tipoItem')?.value;
    
    if (tipoItem === TipoItem.SERVICIO) {
      detalle.get('productoId')?.setValue('');
    } else if (tipoItem === TipoItem.PRODUCTO) {
      detalle.get('servicioId')?.setValue('');
    }
  }

  onServicioChange(index: number): void {
    const detalle = this.detallesArray.at(index);
    const servicioId = detalle.get('servicioId')?.value;
    
    if (servicioId) {
      const servicio = this.servicios.find(s => s.id === servicioId);
      if (servicio) {
        detalle.get('precioUnitario')?.setValue(servicio.precio);
        this.calcularSubtotalDetalle(index);
      }
    }
  }

  onProductoChange(index: number): void {
    const detalle = this.detallesArray.at(index);
    const productoId = detalle.get('productoId')?.value;
    
    if (productoId) {
      const producto = this.productos.find(p => p.id === productoId);
      if (producto) {
        detalle.get('precioUnitario')?.setValue(producto.precioVenta);
        this.calcularSubtotalDetalle(index);
      }
    }
  }

  calcularSubtotalDetalle(index: number): void {
    const detalle = this.detallesArray.at(index);
    const cantidad = detalle.get('cantidad')?.value || 0;
    const precioUnitario = detalle.get('precioUnitario')?.value || 0;
    const subtotal = cantidad * precioUnitario;
    
    detalle.get('subtotal')?.setValue(subtotal);
    this.calcularTotales();
  }

  calcularTotales(): void {
    let subtotal = 0;
    
    for (let i = 0; i < this.detallesArray.length; i++) {
      const detalle = this.detallesArray.at(i);
      subtotal += detalle.get('subtotal')?.value || 0;
    }
    
    const impuestos = this.facturaForm.get('impuestos')?.value || 0;
    const descuento = this.facturaForm.get('descuento')?.value || 0;
    const total = subtotal + impuestos - descuento;
    
    this.facturaForm.patchValue({
      subtotal: subtotal,
      total: total
    });
  }

  loadFacturas(): void {
    this.facturaService.getAllFacturas().subscribe({
      next: (facturas) => {
        this.dataSource.data = facturas;
        this.categorizarFacturas(facturas);
        this.calcularEstadisticas(facturas);
      },
      error: (error) => {
        console.error('Error cargando facturas:', error);
        this.snackBar.open('Error al cargar las facturas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.setupClienteFilter();
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
      }
    });
  }

  setupClienteFilter(): void {
    this.filteredClientes = this.facturaForm.get('clienteSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        // Si el valor es null, undefined o string vacío, mostrar todos los clientes
        if (!value || typeof value !== 'string') {
          return this.clientes;
        }
        return this._filterClientes(value);
      })
    );
  }

  private _filterClientes(value: string): ClienteDTO[] {
    const filterValue = value.toLowerCase();
    return this.clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(filterValue) ||
      cliente.apellido.toLowerCase().includes(filterValue) ||
      cliente.documento.toLowerCase().includes(filterValue)
    );
  }

  onClienteSelected(clienteId: number): void {
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (cliente) {
      this.selectedCliente = cliente;
      this.facturaForm.patchValue({
        clienteId: cliente.id,
        clienteSearch: `${cliente.nombre} ${cliente.apellido} - ${cliente.documento}`
      });
      // Cargar mantenimientos del cliente seleccionado
      this.loadMantenimientosCliente(cliente.id);
    }
  }

  // Método para limpiar la selección de cliente
  clearClienteSelection(): void {
    this.selectedCliente = null;
    this.mantenimientosCliente = [];
    this.facturaForm.patchValue({
      clienteId: '',
      clienteSearch: ''
    });
  }

  displayClienteFn = (clienteId: number | string): string => {
    if (typeof clienteId === 'string') {
      return clienteId;
    }
    if (typeof clienteId === 'number') {
      const cliente = this.clientes.find(c => c.id === clienteId);
      return cliente ? `${cliente.nombre} ${cliente.apellido} - ${cliente.documento}` : '';
    }
    return '';
  }

  loadMantenimientosCliente(clienteId: number): void {
    this.mantenimientoService.getMantenimientosByCliente(clienteId).subscribe({
      next: (mantenimientos) => {
        this.mantenimientosCliente = mantenimientos;
      },
      error: (error) => {
        console.error('Error cargando mantenimientos del cliente:', error);
        this.mantenimientosCliente = [];
      }
    });
  }

  loadMantenimientos(): void {
    this.mantenimientoService.getAllMantenimientos().subscribe({
      next: (mantenimientos) => {
        this.mantenimientos = mantenimientos;
      },
      error: (error) => {
        console.error('Error cargando mantenimientos:', error);
      }
    });
  }

  loadProductos(): void {
    this.productoService.getAllProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      }
    });
  }

  loadServicios(): void {
    this.servicioService.getAllServicios().subscribe({
      next: (servicios: ServicioDTO[]) => {
        this.servicios = servicios;
      },
      error: (error: any) => {
        console.error('Error cargando servicios:', error);
      }
    });
  }

  categorizarFacturas(facturas: FacturaDTO[]): void {
    this.facturasPendientes = facturas.filter(f => f.estado === EstadoFactura.PENDIENTE);
    this.facturasPagadas = facturas.filter(f => f.estado === EstadoFactura.PAGADA);
    this.facturasVencidas = facturas.filter(f => f.estado === EstadoFactura.VENCIDA);
    this.facturasCanceladas = facturas.filter(f => f.estado === EstadoFactura.CANCELADA);
  }

  calcularEstadisticas(facturas: FacturaDTO[]): void {
    this.estadisticas = {
      total: facturas.length,
      pendientes: facturas.filter(f => f.estado === EstadoFactura.PENDIENTE).length,
      pagadas: facturas.filter(f => f.estado === EstadoFactura.PAGADA).length,
      vencidas: facturas.filter(f => f.estado === EstadoFactura.VENCIDA).length,
      canceladas: facturas.filter(f => f.estado === EstadoFactura.CANCELADA).length,
      totalIngresos: facturas
        .filter(f => f.estado === EstadoFactura.PAGADA)
        .reduce((sum, f) => sum + (f.total || 0), 0)
    };
  }

  filtrarPorEstado(estado: EstadoFactura | 'TODOS'): void {
    this.selectedEstado = estado;
    if (estado === 'TODOS') {
      this.dataSource.data = this.facturasPendientes.concat(
        this.facturasPagadas,
        this.facturasVencidas,
        this.facturasCanceladas
      );
    } else {
      switch (estado) {
        case EstadoFactura.PENDIENTE:
          this.dataSource.data = this.facturasPendientes;
          break;
        case EstadoFactura.PAGADA:
          this.dataSource.data = this.facturasPagadas;
          break;
        case EstadoFactura.VENCIDA:
          this.dataSource.data = this.facturasVencidas;
          break;
        case EstadoFactura.CANCELADA:
          this.dataSource.data = this.facturasCanceladas;
          break;
      }
    }
  }

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: FacturaDTO, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.numeroFactura.toLowerCase().includes(searchTerm) ||
             data.clienteNombre.toLowerCase().includes(searchTerm) ||
             data.estado.toLowerCase().includes(searchTerm);
    };
    
    this.dataSource.filter = this.searchTerm.trim();
  }

  openDialog(factura?: FacturaDTO): void {
    this.isEditing = !!factura;
    this.selectedFactura = factura || null;
    this.showDialog = true;
    
    // Limpiar detalles existentes
    while (this.detallesArray.length !== 0) {
      this.detallesArray.removeAt(0);
    }
    
    if (factura) {
      // Buscar el cliente para mostrar en el campo de búsqueda
      const cliente = this.clientes.find(c => c.id === factura.clienteId);
      this.selectedCliente = cliente || null;
      
      this.facturaForm.patchValue({
        clienteId: factura.clienteId,
        clienteSearch: cliente ? `${cliente.nombre} ${cliente.apellido} - ${cliente.documento}` : '',
        mantenimientoId: factura.mantenimientoId,
        fechaEmision: factura.fechaEmision.split('T')[0],
        subtotal: factura.subtotal,
        impuestos: factura.impuestos,
        descuento: factura.descuento,
        total: factura.total,
        observaciones: factura.observaciones || ''
      });
      
      // Cargar mantenimientos del cliente si existe
      if (cliente) {
        this.loadMantenimientosCliente(cliente.id);
      }
      
      // Cargar detalles si existen
      if (factura.detalles && factura.detalles.length > 0) {
        factura.detalles.forEach(detalle => {
          const detalleForm = this.fb.group({
            tipoItem: [detalle.tipoItem, [Validators.required]],
            servicioId: [detalle.servicioId || ''],
            productoId: [detalle.productoId || ''],
            cantidad: [detalle.cantidad, [Validators.required, Validators.min(1)]],
            precioUnitario: [detalle.precioUnitario, [Validators.required, Validators.min(0)]],
            subtotal: [detalle.subtotal, [Validators.required, Validators.min(0)]],
            descripcion: [detalle.descripcion || '']
          });
          this.detallesArray.push(detalleForm);
        });
      }
    } else {
      this.selectedCliente = null;
      this.mantenimientosCliente = [];
      this.facturaForm.reset({ 
        fechaEmision: new Date().toISOString().split('T')[0],
        subtotal: 0,
        impuestos: 0,
        descuento: 0,
        total: 0
      });
    }
  }

  saveFactura(): void {
    if (this.facturaForm.valid) {
      const facturaData: any = this.facturaForm.value;
      
      // Preparar detalles
      const detalles = this.detallesArray.value.map((detalle: any) => ({
        tipoItem: detalle.tipoItem,
        servicioId: detalle.servicioId || null,
        productoId: detalle.productoId || null,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal,
        descripcion: detalle.descripcion
      }));
      
      const facturaToSend = {
        ...facturaData,
        estado: EstadoFactura.PENDIENTE, // Siempre establecer como PENDIENTE
        detalles: detalles
      };
      
      if (this.isEditing && this.selectedFactura) {
        this.facturaService.updateFactura(this.selectedFactura.id, facturaToSend).subscribe({
          next: (updatedFactura) => {
            this.snackBar.open('Factura actualizada exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.loadFacturas();
          },
          error: (error) => {
            console.error('Error actualizando factura:', error);
            this.snackBar.open('Error al actualizar la factura', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.facturaService.createFactura(facturaToSend).subscribe({
          next: (newFactura) => {
            this.snackBar.open('Factura creada exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.loadFacturas();
          },
          error: (error) => {
            console.error('Error creando factura:', error);
            this.snackBar.open('Error al crear la factura', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteFactura(factura: FacturaDTO): void {
    if (confirm(`¿Está seguro de eliminar la factura ${factura.numeroFactura}?`)) {
      this.facturaService.deleteFactura(factura.id).subscribe({
        next: () => {
          this.snackBar.open('Factura eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadFacturas();
        },
        error: (error) => {
          console.error('Error eliminando factura:', error);
          this.snackBar.open('Error al eliminar la factura', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  marcarComoPagada(factura: FacturaDTO): void {
    this.facturaService.marcarComoPagada(factura.id).subscribe({
      next: () => {
        this.snackBar.open('Factura marcada como pagada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadFacturas();
      },
      error: (error) => {
        console.error('Error marcando factura como pagada:', error);
        this.snackBar.open('Error al marcar la factura como pagada', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelarFactura(factura: FacturaDTO): void {
    if (confirm(`¿Está seguro de cancelar la factura ${factura.numeroFactura}?`)) {
      this.facturaService.cancelarFactura(factura.id).subscribe({
        next: () => {
          this.snackBar.open('Factura cancelada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadFacturas();
        },
        error: (error) => {
          console.error('Error cancelando factura:', error);
          this.snackBar.open('Error al cancelar la factura', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  closeDialog(): void {
    this.isEditing = false;
    this.selectedFactura = null;
    this.selectedCliente = null;
    this.mantenimientosCliente = [];
    this.showDialog = false;
    this.facturaForm.reset({ 
      fechaEmision: new Date().toISOString().split('T')[0],
      subtotal: 0,
      impuestos: 0,
      descuento: 0,
      total: 0
    });
    
    // Limpiar detalles
    while (this.detallesArray.length !== 0) {
      this.detallesArray.removeAt(0);
    }
  }

  getErrorMessage(field: string): string {
    const control = this.facturaForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }

  getEstadoColor(estado: EstadoFactura): string {
    switch (estado) {
      case EstadoFactura.PENDIENTE:
        return 'primary';
      case EstadoFactura.PAGADA:
        return 'primary';
      case EstadoFactura.VENCIDA:
        return 'warn';
      case EstadoFactura.CANCELADA:
        return 'warn';
      default:
        return 'primary';
    }
  }

  canPagar(estado: EstadoFactura): boolean {
    return estado === EstadoFactura.PENDIENTE;
  }

  canCancelar(estado: EstadoFactura): boolean {
    return estado === EstadoFactura.PENDIENTE;
  }

  descargarPdf(factura: FacturaDTO): void {
    this.facturaService.descargarPdf(factura.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura_${factura.numeroFactura}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('PDF descargado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error descargando PDF:', error);
        this.snackBar.open('Error al descargar el PDF', 'Cerrar', { duration: 3000 });
      }
    });
  }
} 