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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EgresoService } from '../../services/egreso.service';
import { Egreso, EgresoDTO, CreateEgresoDTO } from '../../models/egreso.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { catchError, of } from 'rxjs';
import { NumberFormatDirective } from '../../directives/number-format.directive';

@Component({
  selector: 'app-egresos-gestion',
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
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    NumberFormatDirective
  ],
  templateUrl: './egresos-gestion.component.html',
  styleUrls: ['./egresos-gestion.component.scss']
})
export class EgresosGestionComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['concepto', 'descripcion', 'monto', 'categoria', 'fechaEgreso', 'responsable', 'acciones'];
  dataSource = new MatTableDataSource<EgresoDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<EgresoDTO>;

  // Propiedades para el template
  egresos: EgresoDTO[] = [];
  loading = false;
  dialogOpen = false;
  editingEgreso: EgresoDTO | null = null;
  egresoForm!: FormGroup;

  // Categorías predefinidas
  categorias = [
    'Repuestos',
    'Servicios',
    'Equipos',
    'Limpieza',
    'Mantenimiento',
    'Salarios',
    'Alquiler',
    'Otros'
  ];

  constructor(
    private egresoService: EgresoService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    console.log('EgresosGestionComponent constructor llamado');
  }

  ngOnInit(): void {
    console.log('EgresosGestionComponent ngOnInit llamado');
    this.initForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadEgresos();
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }, 100);
  }

  initForm(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    this.egresoForm = this.fb.group({
      concepto: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      monto: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      fechaEgreso: [todayString, Validators.required],
      responsable: ['', Validators.required]
    });
  }

  loadEgresos(): void {
    console.log('Iniciando carga de egresos...');
    this.loading = true;
    
    this.egresoService.getAllEgresos().pipe(
      catchError(error => {
        console.error('Error cargando egresos:', error);
        this.snackBar.open('Error al cargar los egresos. Verifica que el backend esté ejecutándose.', 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return of([]);
      })
    ).subscribe({
      next: (egresos) => {
        console.log('Egresos recibidos en componente:', egresos);
        this.dataSource.data = egresos;
        this.egresos = egresos;
        this.loading = false;
        
        if (egresos.length === 0) {
          this.snackBar.open('No se encontraron egresos. Puedes agregar nuevos egresos usando el botón "Nuevo Egreso".', 'Cerrar', { 
            duration: 4000,
            panelClass: ['info-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('Error en la suscripción:', error);
        this.loading = false;
      }
    });
  }

  openDialog(egreso?: EgresoDTO): void {
    this.editingEgreso = egreso || null;
    this.dialogOpen = true;
    
    if (egreso) {
      // Modo edición
      const fechaEgreso = new Date(egreso.fechaEgreso);
      const fechaString = fechaEgreso.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      console.log('Editando egreso, fecha original:', egreso.fechaEgreso, 'fecha convertida:', fechaString);
      this.egresoForm.patchValue({
        concepto: egreso.concepto,
        descripcion: egreso.descripcion || '',
        monto: egreso.monto,
        categoria: egreso.categoria || '',
        fechaEgreso: fechaString,
        responsable: egreso.responsable || ''
      });
    } else {
      // Modo creación
      const fechaActual = new Date();
      const fechaString = fechaActual.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      console.log('Creando nuevo egreso, fecha actual:', fechaString);
      this.egresoForm.reset({
        fechaEgreso: fechaString
      });
    }
    
    // Debug: verificar el valor del campo fecha
    setTimeout(() => {
      const fechaValue = this.egresoForm.get('fechaEgreso')?.value;
      console.log('Valor del campo fecha después de inicializar:', fechaValue);
    }, 100);
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.editingEgreso = null;
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    this.egresoForm.reset({
      fechaEgreso: todayString
    });
  }

  saveEgreso(): void {
    if (this.egresoForm.valid) {
      const formValue = this.egresoForm.value;
      console.log('Formulario válido, valores:', formValue);
      console.log('Fecha de egreso del formulario:', formValue.fechaEgreso, 'tipo:', typeof formValue.fechaEgreso);
      
      // Convertir la fecha string a Date object para el backend
      const fechaEgreso = new Date(formValue.fechaEgreso);
      console.log('Fecha convertida para backend:', fechaEgreso);
      
      const egresoData: CreateEgresoDTO = {
        concepto: formValue.concepto,
        descripcion: formValue.descripcion,
        monto: formValue.monto,
        categoria: formValue.categoria,
        fechaEgreso: fechaEgreso,
        responsable: formValue.responsable
      };

      if (this.editingEgreso) {
        // Actualizar egreso existente
        this.egresoService.updateEgreso(this.editingEgreso.id, egresoData).subscribe({
          next: (updatedEgreso) => {
            this.snackBar.open('Egreso actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.loadEgresos();
          },
          error: (error) => {
            console.error('Error actualizando egreso:', error);
            this.snackBar.open('Error al actualizar el egreso', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        // Crear nuevo egreso
        this.egresoService.createEgreso(egresoData).subscribe({
          next: (newEgreso) => {
            this.snackBar.open('Egreso creado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.loadEgresos();
          },
          error: (error) => {
            console.error('Error creando egreso:', error);
            this.snackBar.open('Error al crear el egreso', 'Cerrar', { duration: 3000 });
          }
        });
      }
    } else {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  editEgreso(egreso: EgresoDTO): void {
    this.openDialog(egreso);
  }

  deleteEgreso(egreso: EgresoDTO): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el egreso "${egreso.concepto}"?`)) {
      this.egresoService.deleteEgreso(egreso.id).subscribe({
        next: () => {
          this.snackBar.open('Egreso eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadEgresos();
        },
        error: (error) => {
          console.error('Error eliminando egreso:', error);
          this.snackBar.open('Error al eliminar el egreso', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const fecha = typeof date === 'string' ? new Date(date) : date;
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getTotalEgresos(): number {
    return this.egresos.reduce((total, egreso) => total + egreso.monto, 0);
  }
}
