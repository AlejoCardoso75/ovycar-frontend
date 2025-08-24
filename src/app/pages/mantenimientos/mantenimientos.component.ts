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
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ClienteService } from '../../services/cliente.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { Mantenimiento, MantenimientoDTO, EstadoMantenimiento } from '../../models/mantenimiento.model';
import { ClienteDTO } from '../../models/cliente.model';
import { VehiculoDTO } from '../../models/vehiculo.model';
import { DeleteInfo, FacturaInfo } from '../../models/delete-info.model';
import { NumberFormatDirective } from '../../directives/number-format.directive';

@Component({
  selector: 'app-mantenimientos',
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
    MatDialogModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    NumberFormatDirective
  ],
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['./mantenimientos.component.scss']
})
export class MantenimientosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['vehiculo', 'tipoMantenimiento', 'fechaProgramada', 'estado', 'mecanico', 'costo', 'acciones'];
  dataSource = new MatTableDataSource<MantenimientoDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<MantenimientoDTO>;

  mantenimientoForm!: FormGroup;
  isEditing = false;
  selectedMantenimiento: MantenimientoDTO | null = null;
  searchTerm = '';
  showDialog = false;
  vehiculos: VehiculoDTO[] = [];
  filteredVehiculos!: Observable<VehiculoDTO[]>;
  selectedVehiculo: VehiculoDTO | null = null;
  estados = Object.values(EstadoMantenimiento);
  tiposMantenimiento = [
    'Cambio de Aceite',
    'Cambio de Filtros',
    'Frenos',
    'Suspensión',
    'Motor',
    'Transmisión',
    'Eléctrico',
    'Carrocería',
    'Diagnóstico',
    'Otros'
  ];

  // Filtros por estado
  selectedEstado: EstadoMantenimiento | 'TODOS' = 'TODOS';
  mantenimientosProgramados: MantenimientoDTO[] = [];
  mantenimientosEnProceso: MantenimientoDTO[] = [];
  mantenimientosCompletados: MantenimientoDTO[] = [];
  mantenimientosCancelados: MantenimientoDTO[] = [];
  
  // Mantenimientos filtrados por búsqueda
  mantenimientosProgramadosFiltrados: MantenimientoDTO[] = [];
  mantenimientosEnProcesoFiltrados: MantenimientoDTO[] = [];
  mantenimientosCompletadosFiltrados: MantenimientoDTO[] = [];
  mantenimientosCanceladosFiltrados: MantenimientoDTO[] = [];

  // Estadísticas
  estadisticas = {
    total: 0,
    programados: 0,
    enProceso: 0,
    completados: 0,
    cancelados: 0
  };

  constructor(
    private mantenimientoService: MantenimientoService,
    private vehiculoService: VehiculoService,
    private confirmationModalService: ConfirmationModalService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadMantenimientos();
    this.loadVehiculos();
    // Inicializar las listas filtradas
    this.aplicarFiltroBusqueda();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.mantenimientoForm = this.fb.group({
      vehiculoSearch: ['', [Validators.required]],
      vehiculoId: ['', [Validators.required]],
      tipoMantenimiento: ['', [Validators.required]],
      descripcion: [''],
      fechaProgramada: ['', [Validators.required]],
      estado: [EstadoMantenimiento.PROGRAMADO, [Validators.required]],
      kilometrajeActual: ['', [Validators.min(0)]],
      observaciones: [''],
      costo: ['', [Validators.min(0)]],
      mecanico: ['', [Validators.required]],
      proveedorRepuestos: ['', [Validators.required]],
      garantia: ['Sin garantía']
    });
  }

  loadMantenimientos(): void {
    this.mantenimientoService.getAllMantenimientos().subscribe({
      next: (mantenimientos) => {
        this.dataSource.data = mantenimientos;
        this.categorizarMantenimientos(mantenimientos);
        this.calcularEstadisticas(mantenimientos);
      },
      error: (error) => {
        console.error('Error cargando mantenimientos:', error);
        this.snackBar.open('Error al cargar los mantenimientos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadVehiculos(): void {
    this.vehiculoService.getAllVehiculos().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
        this.setupVehiculoFilter();
      },
      error: (error) => {
        console.error('Error cargando vehículos:', error);
      }
    });
  }

  setupVehiculoFilter(): void {
    this.filteredVehiculos = this.mantenimientoForm.get('vehiculoSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVehiculos(value))
    );
  }

  private _filterVehiculos(value: string): VehiculoDTO[] {
    const filterValue = value.toLowerCase();
    return this.vehiculos.filter(vehiculo => 
      vehiculo.placa.toLowerCase().includes(filterValue) ||
      vehiculo.marca.toLowerCase().includes(filterValue) ||
      vehiculo.modelo.toLowerCase().includes(filterValue) ||
      vehiculo.clienteNombre.toLowerCase().includes(filterValue)
    );
  }

  onVehiculoSelected(vehiculoId: number): void {
    const vehiculo = this.vehiculos.find(v => v.id === vehiculoId);
    if (vehiculo) {
      this.selectedVehiculo = vehiculo;
      const kilometrajeFormateado = (vehiculo.kilometraje || 0).toLocaleString('en-US');
      this.mantenimientoForm.patchValue({
        vehiculoId: vehiculo.id,
        vehiculoSearch: `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.clienteNombre})`,
        kilometrajeActual: vehiculo.kilometraje || 0
      });
      
      // Formatear el kilometraje en el campo de solo lectura
      setTimeout(() => {
        const kilometrajeInput = document.querySelector('input[formControlName="kilometrajeActual"]') as HTMLInputElement;
        if (kilometrajeInput) {
          kilometrajeInput.value = kilometrajeFormateado;
        }
      }, 0);
    }
  }

  onProveedorRepuestosChange(event: any): void {
    const proveedor = event.value;
    const fechaProgramada = this.mantenimientoForm.get('fechaProgramada')?.value;
    
    if (proveedor === 'cliente') {
      // Si el cliente proporciona los repuestos, no hay garantía
      this.mantenimientoForm.patchValue({
        garantia: 'Sin garantía'
      });
    } else if (proveedor === 'taller' && fechaProgramada) {
      // Si el taller proporciona los repuestos, calcular 3 meses después de la fecha programada
      this.calcularGarantia(fechaProgramada);
    }
  }

  onFechaProgramadaChange(event: any): void {
    const fechaProgramada = event.value;
    const proveedor = this.mantenimientoForm.get('proveedorRepuestos')?.value;
    
    // Solo recalcular garantía si el taller proporciona los repuestos
    if (proveedor === 'taller' && fechaProgramada) {
      this.calcularGarantia(fechaProgramada);
    }
  }

  private calcularGarantia(fechaProgramada: string): void {
    const fechaGarantia = new Date(fechaProgramada);
    fechaGarantia.setMonth(fechaGarantia.getMonth() + 3);
    
    const fechaGarantiaFormateada = fechaGarantia.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.mantenimientoForm.patchValue({
      garantia: `Garantía hasta ${fechaGarantiaFormateada}`
    });
  }

  displayVehiculoFn = (vehiculoId: number | string): string => {
    if (typeof vehiculoId === 'string') {
      return vehiculoId;
    }
    if (typeof vehiculoId === 'number') {
      const vehiculo = this.vehiculos.find(v => v.id === vehiculoId);
      return vehiculo ? `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.clienteNombre})` : '';
    }
    return '';
  }

  categorizarMantenimientos(mantenimientos: MantenimientoDTO[]): void {
    this.mantenimientosProgramados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.PROGRAMADO);
    this.mantenimientosEnProceso = mantenimientos.filter(m => m.estado === EstadoMantenimiento.EN_PROCESO);
    this.mantenimientosCompletados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.COMPLETADO);
    this.mantenimientosCancelados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.CANCELADO);
    
    // Aplicar filtro de búsqueda a todas las categorías
    this.aplicarFiltroBusqueda();
  }

  calcularEstadisticas(mantenimientos: MantenimientoDTO[]): void {
    this.estadisticas = {
      total: mantenimientos.length,
      programados: mantenimientos.filter(m => m.estado === EstadoMantenimiento.PROGRAMADO).length,
      enProceso: mantenimientos.filter(m => m.estado === EstadoMantenimiento.EN_PROCESO).length,
      completados: mantenimientos.filter(m => m.estado === EstadoMantenimiento.COMPLETADO).length,
      cancelados: mantenimientos.filter(m => m.estado === EstadoMantenimiento.CANCELADO).length
    };
  }

  filtrarPorEstado(estado: EstadoMantenimiento | 'TODOS'): void {
    this.selectedEstado = estado;
    if (estado === 'TODOS') {
      this.dataSource.data = this.mantenimientosProgramados.concat(
        this.mantenimientosEnProceso,
        this.mantenimientosCompletados,
        this.mantenimientosCancelados
      );
    } else {
      switch (estado) {
        case EstadoMantenimiento.PROGRAMADO:
          this.dataSource.data = this.mantenimientosProgramados;
          break;
        case EstadoMantenimiento.EN_PROCESO:
          this.dataSource.data = this.mantenimientosEnProceso;
          break;
        case EstadoMantenimiento.COMPLETADO:
          this.dataSource.data = this.mantenimientosCompletados;
          break;
        case EstadoMantenimiento.CANCELADO:
          this.dataSource.data = this.mantenimientosCancelados;
          break;
      }
    }
  }

  onTabChange(event: any): void {
    // El cambio de pestañas se maneja automáticamente por el contenido de cada pestaña
    // No necesitamos lógica adicional aquí
  }

  aplicarFiltroBusqueda(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    // Función para verificar si un mantenimiento coincide con el filtro
    const coincideConFiltro = (mantenimiento: MantenimientoDTO): boolean => {
      if (!searchTerm) return true;
      
      return mantenimiento.vehiculoPlaca.toLowerCase().includes(searchTerm) ||
             mantenimiento.vehiculoMarca.toLowerCase().includes(searchTerm) ||
             mantenimiento.clienteNombre.toLowerCase().includes(searchTerm) ||
             mantenimiento.tipoMantenimiento.toLowerCase().includes(searchTerm) ||
             mantenimiento.estado.toLowerCase().includes(searchTerm) ||
             (mantenimiento.mecanico ? mantenimiento.mecanico.toLowerCase().includes(searchTerm) : false);
    };
    
    // Aplicar filtro a cada categoría
    this.mantenimientosProgramadosFiltrados = this.mantenimientosProgramados.filter(coincideConFiltro);
    this.mantenimientosEnProcesoFiltrados = this.mantenimientosEnProceso.filter(coincideConFiltro);
    this.mantenimientosCompletadosFiltrados = this.mantenimientosCompletados.filter(coincideConFiltro);
    this.mantenimientosCanceladosFiltrados = this.mantenimientosCancelados.filter(coincideConFiltro);
  }

  applyFilter(): void {
    this.aplicarFiltroBusqueda();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.aplicarFiltroBusqueda();
  }

  openDialog(mantenimiento?: MantenimientoDTO): void {
    this.isEditing = !!mantenimiento;
    this.selectedMantenimiento = mantenimiento || null;
    this.showDialog = true;
    
    if (mantenimiento) {
      // Buscar el vehículo para mostrar en el campo de búsqueda
      const vehiculo = this.vehiculos.find(v => v.id === mantenimiento.vehiculoId);
      this.selectedVehiculo = vehiculo || null;
      
      this.mantenimientoForm.patchValue({
        vehiculoId: mantenimiento.vehiculoId,
        vehiculoSearch: vehiculo ? `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.clienteNombre})` : '',
        tipoMantenimiento: mantenimiento.tipoMantenimiento,
        descripcion: mantenimiento.descripcion || '',
        fechaProgramada: mantenimiento.fechaProgramada,
        estado: mantenimiento.estado,
        kilometrajeActual: mantenimiento.kilometrajeActual,
        observaciones: mantenimiento.observaciones || '',
        costo: mantenimiento.costo,
        mecanico: mantenimiento.mecanico || '',
        proveedorRepuestos: mantenimiento.proveedorRepuestos || 'taller',
        garantia: mantenimiento.garantia || 'Sin garantía'
      });
      
      // Formatear el kilometraje en el campo de solo lectura
      setTimeout(() => {
        const kilometrajeInput = document.querySelector('input[formControlName="kilometrajeActual"]') as HTMLInputElement;
        if (kilometrajeInput) {
          const kilometrajeFormateado = (mantenimiento.kilometrajeActual || 0).toLocaleString('en-US');
          kilometrajeInput.value = kilometrajeFormateado;
        }
      }, 0);
    } else {
      this.selectedVehiculo = null;
      this.mantenimientoForm.reset({ 
        estado: EstadoMantenimiento.PROGRAMADO,
        fechaProgramada: new Date().toISOString().split('T')[0]
      });
    }
  }

  saveMantenimiento(): void {
    if (this.mantenimientoForm.valid) {
      const mantenimientoData: any = this.mantenimientoForm.value;
      
      if (this.isEditing && this.selectedMantenimiento) {
        // Para actualización
        const mantenimientoToUpdate = {
          id: this.selectedMantenimiento.id,
          vehiculoId: mantenimientoData.vehiculoId,
          tipoMantenimiento: mantenimientoData.tipoMantenimiento,
          descripcion: mantenimientoData.descripcion,
          fechaProgramada: mantenimientoData.fechaProgramada,
          estado: mantenimientoData.estado,
          kilometrajeActual: mantenimientoData.kilometrajeActual,
          observaciones: mantenimientoData.observaciones,
          costo: mantenimientoData.costo,
          mecanico: mantenimientoData.mecanico,
          proveedorRepuestos: mantenimientoData.proveedorRepuestos,
          garantia: mantenimientoData.garantia
        };
        
        this.mantenimientoService.updateMantenimiento(this.selectedMantenimiento.id, mantenimientoToUpdate).subscribe({
          next: (updatedMantenimiento) => {
            this.snackBar.open('Mantenimiento actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.loadMantenimientos();
          },
          error: (error) => {
            console.error('Error actualizando mantenimiento:', error);
            this.snackBar.open('Error al actualizar el mantenimiento', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Para creación
        const mantenimientoToCreate = {
          vehiculoId: mantenimientoData.vehiculoId,
          tipoMantenimiento: mantenimientoData.tipoMantenimiento,
          descripcion: mantenimientoData.descripcion,
          fechaProgramada: mantenimientoData.fechaProgramada,
          estado: mantenimientoData.estado,
          kilometrajeActual: mantenimientoData.kilometrajeActual,
          observaciones: mantenimientoData.observaciones,
          costo: mantenimientoData.costo,
          mecanico: mantenimientoData.mecanico,
          proveedorRepuestos: mantenimientoData.proveedorRepuestos,
          garantia: mantenimientoData.garantia
        };
        
        this.mantenimientoService.createMantenimiento(mantenimientoToCreate).subscribe({
          next: (newMantenimiento) => {
            this.snackBar.open('Mantenimiento creado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.loadMantenimientos();
          },
          error: (error) => {
            console.error('Error creando mantenimiento:', error);
            this.snackBar.open('Error al crear el mantenimiento', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteMantenimiento(mantenimiento: MantenimientoDTO): void {
    // Obtener información detallada sobre la eliminación
    this.mantenimientoService.getDeleteInfo(mantenimiento.id).subscribe({
      next: (deleteInfo: DeleteInfo) => {
        if (deleteInfo.canDelete) {
          // Si se puede eliminar, mostrar modal de confirmación simple
          this.confirmationModalService.confirmDelete(
            mantenimiento.tipoMantenimiento, 
            'mantenimiento'
          ).subscribe(confirmed => {
            if (confirmed) {
              this.performDelete(mantenimiento.id);
            }
          });
        } else {
          // Si no se puede eliminar, mostrar modal con opciones de cascada
          this.showDeleteOptionsWithModal(mantenimiento, deleteInfo);
        }
      },
      error: (error) => {
        console.error('Error obteniendo información de eliminación:', error);
        this.snackBar.open('Error al verificar el mantenimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private performDelete(mantenimientoId: number): void {
    this.mantenimientoService.deleteMantenimiento(mantenimientoId).subscribe({
      next: () => {
        this.snackBar.open('Mantenimiento eliminado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadMantenimientos();
      },
      error: (error) => {
        console.error('Error eliminando mantenimiento:', error);
        this.snackBar.open('Error al eliminar el mantenimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private showDeleteOptionsWithModal(mantenimiento: MantenimientoDTO, deleteInfo: DeleteInfo): void {
    // Mostrar modal con información detallada sobre las facturas asociadas
    this.confirmationModalService.confirmDeleteWithFacturas(
      mantenimiento.tipoMantenimiento,
      deleteInfo.facturas || []
    ).subscribe(confirmed => {
      if (confirmed) {
        this.performDeleteWithCascade(mantenimiento.id);
      }
    });
  }

  private performDeleteWithCascade(mantenimientoId: number): void {
    this.mantenimientoService.deleteMantenimientoWithCascade(mantenimientoId).subscribe({
      next: () => {
        this.snackBar.open('Mantenimiento y facturas eliminados exitosamente', 'Cerrar', { duration: 3000 });
        this.loadMantenimientos();
      },
      error: (error) => {
        console.error('Error eliminando mantenimiento con cascada:', error);
        let errorMessage = 'Error al eliminar el mantenimiento';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  iniciarMantenimiento(mantenimiento: MantenimientoDTO): void {
    this.mantenimientoService.iniciarMantenimiento(mantenimiento.id).subscribe({
      next: (updatedMantenimiento) => {
        this.snackBar.open('Mantenimiento iniciado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadMantenimientos();
      },
      error: (error) => {
        console.error('Error iniciando mantenimiento:', error);
        this.snackBar.open('Error al iniciar el mantenimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  completarMantenimiento(mantenimiento: MantenimientoDTO): void {
    this.mantenimientoService.completarMantenimiento(mantenimiento.id).subscribe({
      next: (updatedMantenimiento) => {
        this.snackBar.open('Mantenimiento completado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadMantenimientos();
      },
      error: (error) => {
        console.error('Error completando mantenimiento:', error);
        this.snackBar.open('Error al completar el mantenimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelarMantenimiento(mantenimiento: MantenimientoDTO): void {
    this.confirmationModalService.confirm({
      title: 'Confirmar cancelación',
      message: `¿Está seguro de cancelar el mantenimiento "${mantenimiento.tipoMantenimiento}"?`,
      confirmText: 'Cancelar mantenimiento',
      cancelText: 'No cancelar',
      type: 'warning'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.mantenimientoService.cancelarMantenimiento(mantenimiento.id).subscribe({
          next: (updatedMantenimiento) => {
            this.snackBar.open('Mantenimiento cancelado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadMantenimientos();
          },
          error: (error) => {
            console.error('Error cancelando mantenimiento:', error);
            this.snackBar.open('Error al cancelar el mantenimiento', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  closeDialog(): void {
    this.isEditing = false;
    this.selectedMantenimiento = null;
    this.selectedVehiculo = null;
    this.showDialog = false;
    this.mantenimientoForm.reset({ 
      estado: EstadoMantenimiento.PROGRAMADO,
      fechaProgramada: new Date().toISOString().split('T')[0]
    });
  }

  getErrorMessage(field: string): string {
    const control = this.mantenimientoForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    return 'Campo inválido';
  }

  // Método para formatear fechas en formato dd/mm/aaaa
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const fecha = typeof date === 'string' ? new Date(date) : date;
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getEstadoColor(estado: EstadoMantenimiento): string {
    switch (estado) {
      case EstadoMantenimiento.PROGRAMADO:
        return 'primary';
      case EstadoMantenimiento.EN_PROCESO:
        return 'accent';
      case EstadoMantenimiento.COMPLETADO:
        return 'primary';
      case EstadoMantenimiento.CANCELADO:
        return 'warn';
      default:
        return 'primary';
    }
  }

  canIniciar(estado: EstadoMantenimiento): boolean {
    return estado === EstadoMantenimiento.PROGRAMADO;
  }

  canCompletar(estado: EstadoMantenimiento): boolean {
    return estado === EstadoMantenimiento.EN_PROCESO;
  }

  canCancelar(estado: EstadoMantenimiento): boolean {
    return estado === EstadoMantenimiento.PROGRAMADO || estado === EstadoMantenimiento.EN_PROCESO;
  }
} 