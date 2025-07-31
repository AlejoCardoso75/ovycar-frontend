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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MantenimientoService } from '../../services/mantenimiento.service';
import { ClienteService } from '../../services/cliente.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { Mantenimiento, MantenimientoDTO, EstadoMantenimiento } from '../../models/mantenimiento.model';
import { ClienteDTO } from '../../models/cliente.model';
import { VehiculoDTO } from '../../models/vehiculo.model';

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
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['./mantenimientos.component.scss']
})
export class MantenimientosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['vehiculo', 'tipoMantenimiento', 'fechaProgramada', 'estado', 'costo', 'acciones'];
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
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadMantenimientos();
    this.loadVehiculos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.mantenimientoForm = this.fb.group({
      vehiculoId: ['', [Validators.required]],
      tipoMantenimiento: ['', [Validators.required]],
      descripcion: [''],
      fechaProgramada: ['', [Validators.required]],
      estado: [EstadoMantenimiento.PROGRAMADO, [Validators.required]],
      kilometrajeActual: ['', [Validators.min(0)]],
      kilometrajeProximo: ['', [Validators.min(0)]],
      observaciones: [''],
      costo: ['', [Validators.min(0)]]
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
      },
      error: (error) => {
        console.error('Error cargando vehículos:', error);
      }
    });
  }

  categorizarMantenimientos(mantenimientos: MantenimientoDTO[]): void {
    this.mantenimientosProgramados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.PROGRAMADO);
    this.mantenimientosEnProceso = mantenimientos.filter(m => m.estado === EstadoMantenimiento.EN_PROCESO);
    this.mantenimientosCompletados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.COMPLETADO);
    this.mantenimientosCancelados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.CANCELADO);
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

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: MantenimientoDTO, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.vehiculoPlaca.toLowerCase().includes(searchTerm) ||
             data.vehiculoMarca.toLowerCase().includes(searchTerm) ||
             data.clienteNombre.toLowerCase().includes(searchTerm) ||
             data.tipoMantenimiento.toLowerCase().includes(searchTerm) ||
             data.estado.toLowerCase().includes(searchTerm);
    };
    
    this.dataSource.filter = this.searchTerm.trim();
  }

  openDialog(mantenimiento?: MantenimientoDTO): void {
    this.isEditing = !!mantenimiento;
    this.selectedMantenimiento = mantenimiento || null;
    this.showDialog = true;
    
    if (mantenimiento) {
      this.mantenimientoForm.patchValue({
        vehiculoId: mantenimiento.vehiculoId,
        tipoMantenimiento: mantenimiento.tipoMantenimiento,
        descripcion: mantenimiento.descripcion || '',
        fechaProgramada: mantenimiento.fechaProgramada,
        estado: mantenimiento.estado,
        kilometrajeActual: mantenimiento.kilometrajeActual,
        kilometrajeProximo: mantenimiento.kilometrajeProximo,
        observaciones: mantenimiento.observaciones || '',
        costo: mantenimiento.costo
      });
    } else {
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
          kilometrajeProximo: mantenimientoData.kilometrajeProximo,
          observaciones: mantenimientoData.observaciones,
          costo: mantenimientoData.costo
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
          kilometrajeProximo: mantenimientoData.kilometrajeProximo,
          observaciones: mantenimientoData.observaciones,
          costo: mantenimientoData.costo
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
    if (confirm(`¿Está seguro de eliminar el mantenimiento ${mantenimiento.tipoMantenimiento}?`)) {
      this.mantenimientoService.deleteMantenimiento(mantenimiento.id).subscribe({
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
    if (confirm(`¿Está seguro de cancelar el mantenimiento ${mantenimiento.tipoMantenimiento}?`)) {
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
  }

  closeDialog(): void {
    this.isEditing = false;
    this.selectedMantenimiento = null;
    this.showDialog = false;
    this.mantenimientoForm.reset({ 
      estado: EstadoMantenimiento.PROGRAMADO,
      fechaProgramada: new Date().toISOString().split('T')[0]
    });
  }

  getErrorMessage(field: string): string {
    const control = this.mantenimientoForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
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