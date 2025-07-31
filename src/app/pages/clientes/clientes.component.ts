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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, ClienteDTO } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
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
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nombre', 'apellido', 'documento', 'telefono', 'email', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<ClienteDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ClienteDTO>;

  clienteForm!: FormGroup;
  isEditing = false;
  selectedCliente: ClienteDTO | null = null;
  searchTerm = '';
  showDialog = false;

  constructor(
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  ngAfterViewInit(): void {
    // Conectar el paginador y ordenamiento con la tabla
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      documento: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      email: ['', [Validators.email]],
      direccion: [''],
      activo: [true]
    });
  }

  loadClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (clientes) => {
        this.dataSource.data = clientes;
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  applyFilter(): void {
    // Aplicar filtro personalizado
    this.dataSource.filterPredicate = (data: ClienteDTO, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.nombre.toLowerCase().includes(searchTerm) ||
             data.apellido.toLowerCase().includes(searchTerm) ||
             data.documento.includes(searchTerm) ||
             (data.email ? data.email.toLowerCase().includes(searchTerm) : false);
    };
    
    this.dataSource.filter = this.searchTerm.trim();
  }

  openDialog(cliente?: ClienteDTO): void {
    this.isEditing = !!cliente;
    this.selectedCliente = cliente || null;
    this.showDialog = true;
    
    if (cliente) {
      this.clienteForm.patchValue({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        documento: cliente.documento,
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        activo: cliente.activo
      });
    } else {
      this.clienteForm.reset({ activo: true });
    }
  }

  saveCliente(): void {
    if (this.clienteForm.valid) {
      const clienteData: Cliente = this.clienteForm.value;
      
      if (this.isEditing && this.selectedCliente) {
        this.clienteService.updateCliente(this.selectedCliente.id, clienteData).subscribe({
          next: (updatedCliente) => {
            const index = this.dataSource.data.findIndex(c => c.id === updatedCliente.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedCliente;
              this.dataSource._updateChangeSubscription();
            }
            this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
          },
          error: (error) => {
            console.error('Error actualizando cliente:', error);
            this.snackBar.open('Error al actualizar el cliente', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.clienteService.createCliente(clienteData).subscribe({
          next: (newCliente) => {
            this.dataSource.data.push(newCliente);
            this.dataSource._updateChangeSubscription();
            this.snackBar.open('Cliente creado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
          },
          error: (error) => {
            console.error('Error creando cliente:', error);
            this.snackBar.open('Error al crear el cliente', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteCliente(cliente: ClienteDTO): void {
    if (confirm(`¿Está seguro de eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`)) {
      this.clienteService.deleteCliente(cliente.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(c => c.id !== cliente.id);
          this.dataSource._updateChangeSubscription();
          this.snackBar.open('Cliente eliminado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error eliminando cliente:', error);
          this.snackBar.open('Error al eliminar el cliente', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  closeDialog(): void {
    this.isEditing = false;
    this.selectedCliente = null;
    this.showDialog = false;
    this.clienteForm.reset({ activo: true });
  }

  getErrorMessage(field: string): string {
    const control = this.clienteForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido';
    }
    return '';
  }
} 