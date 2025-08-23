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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { VehiculoService } from '../../services/vehiculo.service';
import { ClienteService } from '../../services/cliente.service';
import { Vehiculo, VehiculoDTO } from '../../models/vehiculo.model';
import { ClienteDTO } from '../../models/cliente.model';

@Component({
  selector: 'app-vehiculos',
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
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.scss']
})
export class VehiculosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['cliente', 'placa', 'marca', 'modelo', 'año', 'color', 'kilometraje', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<VehiculoDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<VehiculoDTO>;

  vehiculoForm!: FormGroup;
  isEditing = false;
  selectedVehiculo: VehiculoDTO | null = null;
  searchTerm = '';
  showDialog = false;
  clientes: ClienteDTO[] = [];
  
  // Propiedades para autocompletado de clientes
  filteredClientes!: Observable<ClienteDTO[]>;
  selectedCliente: ClienteDTO | null = null;

  constructor(
    private vehiculoService: VehiculoService,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadVehiculos();
    this.loadClientes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.vehiculoForm = this.fb.group({
      clienteSearch: ['', [Validators.required]],
      clienteId: ['', [Validators.required]],
      placa: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(1)]],
      anio: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      color: ['', [Validators.required, Validators.minLength(2)]],
      kilometraje: ['', [Validators.required, Validators.min(0)]],
      activo: [true]
    });
  }

  loadVehiculos(): void {
    this.vehiculoService.getAllVehiculos().subscribe({
      next: (vehiculos) => {
        this.dataSource.data = vehiculos;
      },
      error: (error) => {
        console.error('Error cargando vehículos:', error);
        this.snackBar.open('Error al cargar los vehículos', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  setupClienteFilter(): void {
    this.filteredClientes = this.vehiculoForm.get('clienteSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClientes(value || ''))
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
      this.vehiculoForm.patchValue({
        clienteId: cliente.id,
        clienteSearch: `${cliente.nombre} ${cliente.apellido} - ${cliente.documento}`
      });
    }
  }

  displayClienteFn = (clienteId: number | string): string => {
    if (typeof clienteId === 'string') {
      return clienteId;
    }
    if (typeof clienteId === 'number') {
      const cliente = this.clientes.find(c => c.id === clienteId);
      return cliente ? `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono}` : '';
    }
    return '';
  }

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: VehiculoDTO, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.placa.toLowerCase().includes(searchTerm) ||
             data.marca.toLowerCase().includes(searchTerm) ||
             data.modelo.toLowerCase().includes(searchTerm) ||
             data.clienteNombre.toLowerCase().includes(searchTerm) ||
             (data.color ? data.color.toLowerCase().includes(searchTerm) : false);
    };
    
    this.dataSource.filter = this.searchTerm.trim();
  }

  openDialog(vehiculo?: VehiculoDTO): void {
    this.isEditing = !!vehiculo;
    this.selectedVehiculo = vehiculo || null;
    this.showDialog = true;
    
    if (vehiculo) {
      // Buscar el cliente para mostrar en el campo de búsqueda
      const cliente = this.clientes.find(c => c.id === vehiculo.clienteId);
      this.selectedCliente = cliente || null;
      
      this.vehiculoForm.patchValue({
        clienteId: vehiculo.clienteId,
        clienteSearch: cliente ? `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono}` : '',
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        color: vehiculo.color,
        kilometraje: vehiculo.kilometraje,
        activo: vehiculo.activo
      });
    } else {
      this.vehiculoForm.reset({ activo: true });
      this.selectedCliente = null;
    }
  }

  saveVehiculo(): void {
    if (this.vehiculoForm.valid) {
      const vehiculoData = this.vehiculoForm.value;
      
      if (this.isEditing && this.selectedVehiculo) {
        this.vehiculoService.updateVehiculo(this.selectedVehiculo.id, vehiculoData).subscribe({
          next: (updatedVehiculo) => {
            const index = this.dataSource.data.findIndex(v => v.id === updatedVehiculo.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedVehiculo;
              this.dataSource._updateChangeSubscription();
            }
            this.snackBar.open('Vehículo actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
          },
          error: (error) => {
            console.error('Error actualizando vehículo:', error);
            this.snackBar.open('Error al actualizar el vehículo', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.vehiculoService.createVehiculo(vehiculoData).subscribe({
          next: (newVehiculo) => {
            this.dataSource.data.push(newVehiculo);
            this.dataSource._updateChangeSubscription();
            this.snackBar.open('Vehículo creado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
          },
          error: (error) => {
            console.error('Error creando vehículo:', error);
            this.snackBar.open('Error al crear el vehículo', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteVehiculo(vehiculo: VehiculoDTO): void {
    if (confirm(`¿Está seguro de eliminar el vehículo ${vehiculo.placa}?`)) {
      this.vehiculoService.deleteVehiculo(vehiculo.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(v => v.id !== vehiculo.id);
          this.dataSource._updateChangeSubscription();
          this.snackBar.open('Vehículo eliminado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error eliminando vehículo:', error);
          this.snackBar.open('Error al eliminar el vehículo', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  closeDialog(): void {
    this.isEditing = false;
    this.selectedVehiculo = null;
    this.selectedCliente = null;
    this.showDialog = false;
    this.vehiculoForm.reset({ activo: true });
  }

  getErrorMessage(field: string): string {
    const control = this.vehiculoForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      if (field === 'anio') {
        return 'El año debe tener 4 dígitos';
      }
      return 'Formato inválido';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    return '';
  }

  getClienteNombre(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado';
  }

  formatKilometraje(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remover todos los caracteres no numéricos
    value = value.replace(/[^\d]/g, '');
    
    // Convertir a número
    const numValue = parseInt(value) || 0;
    
    // Formatear con separadores de miles
    const formatted = numValue.toLocaleString('en-US');
    
    // Actualizar el input
    input.value = formatted;
    
    // Actualizar el control del formulario
    this.vehiculoForm.get('kilometraje')?.setValue(numValue, { emitEvent: false });
  }
}