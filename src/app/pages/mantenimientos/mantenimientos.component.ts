import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { MecanicoService } from '../../services/mecanico.service';
import { ClienteService } from '../../services/cliente.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ConfirmationModalService } from '../../services/confirmation-modal.service';
import { Mantenimiento, MantenimientoDTO, EstadoMantenimiento } from '../../models/mantenimiento.model';
import { ClienteDTO } from '../../models/cliente.model';
import { VehiculoDTO } from '../../models/vehiculo.model';
import { MecanicoDTO } from '../../models/mecanico.model';
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
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NumberFormatDirective
  ],
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['./mantenimientos.component.scss']
})
export class MantenimientosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['vehiculo', 'tipoMantenimiento', 'fechaProgramada', 'fechaCompletado', 'estado', 'mecanico', 'costo', 'acciones'];
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

  mecanicos: MecanicoDTO[] = [];

  // Filtros por estado
  selectedEstado: EstadoMantenimiento | 'TODOS' = 'TODOS';
  mantenimientosProgramados: MantenimientoDTO[] = [];
  mantenimientosEnProceso: MantenimientoDTO[] = [];
  mantenimientosCompletados: MantenimientoDTO[] = [];
  mantenimientosCancelados: MantenimientoDTO[] = [];
  
  // Lazy Loading de datos
  // pageSize = 20;
  // currentPage = 0;
  // totalItems = 0;
  // loading = false;
  // allDataLoaded = false;

  // Estado de búsqueda
  isSearching = false;
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
    private mecanicoService: MecanicoService,
    private vehiculoService: VehiculoService,
    private confirmationModalService: ConfirmationModalService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadMantenimientos();
    this.loadVehiculos();
    this.loadMecanicos();
    
    // Suscribirse a cambios en valorRepuestos para actualización en tiempo real
    this.mantenimientoForm.get('valorRepuestos')?.valueChanges.subscribe(() => {
      // Forzar detección de cambios para actualizar el campo calculado
      this.cdr.detectChanges();
    });

    this.mantenimientoForm.get('mecanicoId')?.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
    });
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
      costoManoObra: ['', [Validators.min(0)]],
      valorRepuestos: ['', [Validators.min(0)]],
      costoAdicionales: ['', [Validators.min(0)]],
      mecanicoId: [null, [Validators.required]],
      proveedorRepuestos: ['', [Validators.required]],
      garantia: ['Sin garantía']
    });
  }

  loadMecanicos(): void {
    this.mecanicoService.getMecanicosActivos().subscribe({
      next: (mecanicos) => {
        this.mecanicos = mecanicos;
      },
      error: (error) => {
        console.error('Error cargando mecánicos:', error);
        this.snackBar.open('Error al cargar los mecánicos', 'Cerrar', { duration: 3000 });
      }
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
  
  // Remover este método que no es necesario
  // loadMoreMantenimientos(): void {
  //   if (this.loading || this.allDataLoaded) {
  //     return;
  //   }
    
  //   this.loading = true;
  //   this.currentPage++;
    
  //   // Simular carga progresiva (en un caso real, esto sería una llamada al backend)
  //   setTimeout(() => {
  //     this.mantenimientoService.getAllMantenimientos().subscribe({
  //       next: (mantenimientos) => {
  //         // Agregar nuevos datos a los existentes
  //         const newData = [...this.dataSource.data, ...mantenimientos];
  //         this.dataSource.data = newData;
  //         this.categorizarMantenimientos(newData);
  //         this.calcularEstadisticas(newData);
          
  //         this.loading = false;
          
  //         // Verificar si se cargaron todos los datos
  //         if (mantenimientos.length < this.pageSize) {
  //           this.allDataLoaded = true;
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error cargando más mantenimientos:', error);
  //         this.loading = false;
  //       }
  //     });
  //   }, 500); // Simular delay de red
  // }

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

  onValorRepuestosChange(): void {
    // Forzar detección de cambios para actualizar los campos calculados
    this.cdr.detectChanges();
  }

  onCostoManoObraChange(): void {
    // Forzar detección de cambios para actualizar el costo total
    this.cdr.detectChanges();
  }

  onCostoAdicionalesChange(): void {
    // Forzar detección de cambios para actualizar el costo total
    this.cdr.detectChanges();
  }

  onMecanicoChange(): void {
    this.cdr.detectChanges();
  }

  calcularManoObra(): string {
    const valorRepuestos = this.mantenimientoForm.get('valorRepuestos')?.value || 0;
    
    // Siempre calcular el 20% del valor de repuestos para mostrar
    if (valorRepuestos > 0) {
      const calculo = Math.round(valorRepuestos * 0.2);
      return calculo.toLocaleString('en-US');
    }
    return '0';
  }

  get valorRepuestosCalculado(): string {
    return this.calcularManoObra();
  }

  get costoTotalCalculado(): string {
    const valorRepuestos = this.mantenimientoForm.get('valorRepuestos')?.value || 0;
    const costoManoObra = this.mantenimientoForm.get('costoManoObra')?.value || 0;
    const costoAdicionales = this.mantenimientoForm.get('costoAdicionales')?.value || 0;
    const proveedor = this.mantenimientoForm.get('proveedorRepuestos')?.value;
    
    let total = 0;
    
    if (proveedor === 'taller') {
      // Para taller: suma valor repuestos + mano de obra + adicionales
      total = valorRepuestos + costoManoObra + costoAdicionales;
    } else if (proveedor === 'cliente') {
      // Para cliente: suma mano de obra + adicionales (no incluye valor repuestos)
      total = costoManoObra + costoAdicionales;
    }
    
    return total.toLocaleString('en-US');
  }

  get porcentajeMecanicoSeleccionado(): number {
    const mecanicoId = this.mantenimientoForm.get('mecanicoId')?.value;
    if (!mecanicoId) {
      return 0;
    }
    const config = this.mecanicos.find(m => m.id === Number(mecanicoId));
    return config?.porcentajeGanancia ?? 0;
  }

  get gananciaMecanicoCalculada(): string {
    const costoManoObra = this.mantenimientoForm.get('costoManoObra')?.value || 0;
    const porcentaje = this.porcentajeMecanicoSeleccionado;
    const ganancia = costoManoObra * porcentaje;
    return ganancia.toLocaleString('en-US');
  }

  onProveedorRepuestosChange(event: any): void {
    const proveedor = event.value;
    const fechaProgramada = this.mantenimientoForm.get('fechaProgramada')?.value;
    
    if (proveedor === 'cliente') {
      // Si el cliente proporciona los repuestos, limpiar solo valor repuestos y no hay garantía
      this.mantenimientoForm.patchValue({
        garantia: 'Sin garantía',
        valorRepuestos: 0
      });
    } else if (proveedor === 'taller') {
      // Si el taller proporciona los repuestos
      if (fechaProgramada) {
        // Calcular garantía 3 meses después de la fecha programada
        this.calcularGarantia(fechaProgramada);
      }
    }
    
    // Forzar detección de cambios para actualizar los campos y el costo total
    this.cdr.detectChanges();
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
    
    // Aplicar filtro de búsqueda local a todas las categorías
    this.aplicarFiltroBusquedaLocal();
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
    
    if (searchTerm) {
      // Si hay término de búsqueda, usar el backend
      this.isSearching = true;
      this.mantenimientoService.buscarMantenimientos(searchTerm).subscribe({
        next: (mantenimientos) => {
          this.dataSource.data = mantenimientos;
          this.categorizarMantenimientos(mantenimientos);
          this.calcularEstadisticas(mantenimientos);
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error en la búsqueda:', error);
          this.snackBar.open('Error al realizar la búsqueda', 'Cerrar', { duration: 3000 });
          this.isSearching = false;
        }
      });
    } else {
      // Si no hay término de búsqueda, aplicar filtro local
      this.aplicarFiltroBusquedaLocal();
    }
  }

  aplicarFiltroBusquedaLocal(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    if (searchTerm) {
      // Aplicar filtro local a los datos ya cargados
      const allMantenimientos = this.mantenimientosProgramados.concat(
        this.mantenimientosEnProceso,
        this.mantenimientosCompletados,
        this.mantenimientosCancelados
      );
      
      const mantenimientosFiltrados = allMantenimientos.filter(m => 
        m.tipoMantenimiento.toLowerCase().includes(searchTerm) ||
        m.descripcion?.toLowerCase().includes(searchTerm) ||
        m.vehiculoPlaca.toLowerCase().includes(searchTerm) ||
        m.clienteNombre.toLowerCase().includes(searchTerm) ||
        m.mecanico?.toLowerCase().includes(searchTerm)
      );
      
      this.dataSource.data = mantenimientosFiltrados;
      this.calcularEstadisticas(mantenimientosFiltrados);
    } else {
      // Si no hay término de búsqueda, mostrar todos los datos
      this.dataSource.data = this.mantenimientosProgramados.concat(
        this.mantenimientosEnProceso,
        this.mantenimientosCompletados,
        this.mantenimientosCancelados
      );
      this.calcularEstadisticas(this.dataSource.data);
    }
  }

  applyFilter(): void {
    this.aplicarFiltroBusqueda();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.aplicarFiltroBusquedaLocal();
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
        costoManoObra: mantenimiento.costoManoObra,
        valorRepuestos: mantenimiento.valorRepuestos,
        costoAdicionales: mantenimiento.costoAdicionales,
        mecanicoId: mantenimiento.mecanicoId ?? null,
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
      
      // Calcular el costo total basado en los valores actuales
      const valorRepuestos = mantenimientoData.valorRepuestos || 0;
      const costoManoObra = mantenimientoData.costoManoObra || 0;
      const costoAdicionales = mantenimientoData.costoAdicionales || 0;
      const proveedor = mantenimientoData.proveedorRepuestos;
      
      let costoTotal = 0;
      if (proveedor === 'taller') {
        costoTotal = valorRepuestos + costoManoObra + costoAdicionales;
      } else if (proveedor === 'cliente') {
        costoTotal = costoManoObra + costoAdicionales;
      }
      
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
          costo: costoTotal,
          costoManoObra: mantenimientoData.costoManoObra,
          valorRepuestos: mantenimientoData.valorRepuestos,
          costoAdicionales: mantenimientoData.costoAdicionales,
          mecanicoId: mantenimientoData.mecanicoId,
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
          costo: costoTotal,
          costoManoObra: mantenimientoData.costoManoObra,
          valorRepuestos: mantenimientoData.valorRepuestos,
          costoAdicionales: mantenimientoData.costoAdicionales,
          mecanicoId: mantenimientoData.mecanicoId,
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
    this.confirmationModalService.confirmDelete(
      mantenimiento.tipoMantenimiento,
      'mantenimiento'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.performDelete(mantenimiento.id);
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