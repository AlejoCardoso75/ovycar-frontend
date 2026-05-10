import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateMecanicoDTO, MecanicoDTO } from '../../models/mecanico.model';
import { MecanicoService } from '../../services/mecanico.service';

@Component({
  selector: 'app-mecanicos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './mecanicos.component.html',
  styleUrls: ['./mecanicos.component.scss']
})
export class MecanicosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombre', 'porcentaje', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<MecanicoDTO>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<MecanicoDTO>;

  mecanicoForm: FormGroup;
  searchTerm = '';
  showDialog = false;
  isEditing = false;
  selectedMecanico: MecanicoDTO | null = null;

  constructor(
    private mecanicoService: MecanicoService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.mecanicoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      porcentajeGanancia: [0.35, [Validators.required, Validators.min(0), Validators.max(1)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadMecanicos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMecanicos(): void {
    this.mecanicoService.getAllMecanicos().subscribe({
      next: (mecanicos) => {
        this.dataSource.data = mecanicos;
      },
      error: (error) => {
        console.error('Error cargando mecánicos:', error);
        this.snackBar.open(this.getBackendErrorMessage(error, 'Error al cargar los mecánicos'), 'Cerrar', { duration: 4000 });
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: MecanicoDTO, filter: string) =>
      data.nombre.toLowerCase().includes(filter);
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  openDialog(mecanico?: MecanicoDTO): void {
    this.isEditing = !!mecanico;
    this.selectedMecanico = mecanico || null;
    this.showDialog = true;

    if (mecanico) {
      this.mecanicoForm.patchValue({
        nombre: mecanico.nombre,
        porcentajeGanancia: mecanico.porcentajeGanancia,
        activo: mecanico.activo
      });
    } else {
      this.mecanicoForm.reset({
        nombre: '',
        porcentajeGanancia: 0.35,
        activo: true
      });
    }
  }

  saveMecanico(): void {
    if (this.mecanicoForm.invalid) {
      return;
    }

    const payload: CreateMecanicoDTO = this.mecanicoForm.value;

    if (this.isEditing && this.selectedMecanico) {
      this.mecanicoService.updateMecanico(this.selectedMecanico.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Mecánico actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.closeDialog();
          this.loadMecanicos();
        },
        error: (error) => {
          console.error('Error actualizando mecánico:', error);
          this.snackBar.open(this.getBackendErrorMessage(error, 'Error al actualizar el mecánico'), 'Cerrar', { duration: 5000 });
        }
      });
      return;
    }

    this.mecanicoService.createMecanico(payload).subscribe({
      next: () => {
        this.snackBar.open('Mecánico creado exitosamente', 'Cerrar', { duration: 3000 });
        this.closeDialog();
        this.loadMecanicos();
      },
      error: (error) => {
        console.error('Error creando mecánico:', error);
        this.snackBar.open(this.getBackendErrorMessage(error, 'Error al crear el mecánico'), 'Cerrar', { duration: 5000 });
      }
    });
  }

  toggleActivo(mecanico: MecanicoDTO): void {
    const payload: CreateMecanicoDTO = {
      nombre: mecanico.nombre,
      porcentajeGanancia: mecanico.porcentajeGanancia,
      activo: !mecanico.activo
    };

    this.mecanicoService.updateMecanico(mecanico.id, payload).subscribe({
      next: () => {
        this.snackBar.open(`Mecánico ${payload.activo ? 'activado' : 'desactivado'} exitosamente`, 'Cerrar', { duration: 3000 });
        this.loadMecanicos();
      },
      error: (error) => {
        console.error('Error cambiando estado del mecánico:', error);
        this.snackBar.open(this.getBackendErrorMessage(error, 'Error al cambiar el estado del mecánico'), 'Cerrar', { duration: 5000 });
      }
    });
  }

  deleteMecanico(mecanico: MecanicoDTO): void {
    if (!confirm(`¿Deseas eliminar al mecánico ${mecanico.nombre}?`)) {
      return;
    }

    this.mecanicoService.deleteMecanico(mecanico.id).subscribe({
      next: () => {
        this.snackBar.open('Mecánico eliminado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadMecanicos();
      },
      error: (error) => {
        console.error('Error eliminando mecánico:', error);
        this.snackBar.open(this.getBackendErrorMessage(error, 'Error al eliminar el mecánico'), 'Cerrar', { duration: 5000 });
      }
    });
  }

  closeDialog(): void {
    this.showDialog = false;
    this.isEditing = false;
    this.selectedMecanico = null;
  }

  getErrorMessage(field: 'nombre' | 'porcentajeGanancia'): string {
    const control = this.mecanicoForm.get(field);
    if (!control) return 'Campo inválido';
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('minlength')) return 'Mínimo 2 caracteres';
    if (control.hasError('min') || control.hasError('max')) return 'Debe estar entre 0 y 1';
    return 'Campo inválido';
  }

  asPercent(value: number): string {
    return `${Math.round((value || 0) * 100)}%`;
  }

  private getBackendErrorMessage(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;
    const backendMessage = httpError?.error?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
      return backendMessage;
    }
    return fallback;
  }
}
