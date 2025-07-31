import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto, ProductoDTO } from '../../models/producto.model';

@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-overlay">
      <div class="dialog-container">
        <div class="dialog-header">
          <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Nuevo' }} Producto</h2>
          <button mat-icon-button class="close-button" (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
          <mat-dialog-content class="dialog-content">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Código</mat-label>
                <input matInput formControlName="codigo" placeholder="Código del producto">
                <mat-error *ngIf="productoForm.get('codigo')?.hasError('required')">
                  El código es requerido
                </mat-error>
                <mat-error *ngIf="productoForm.get('codigo')?.hasError('minlength')">
                  Mínimo 3 caracteres
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" placeholder="Nombre del producto">
                <mat-error *ngIf="productoForm.get('nombre')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
                <mat-error *ngIf="productoForm.get('nombre')?.hasError('minlength')">
                  Mínimo 2 caracteres
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" placeholder="Descripción del producto" rows="3"></textarea>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Marca</mat-label>
                <input matInput formControlName="marca" placeholder="Marca del producto">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="categoria">
                  <mat-option *ngFor="let categoria of categorias" [value]="categoria">
                    {{ categoria }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="productoForm.get('categoria')?.hasError('required')">
                  La categoría es requerida
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Precio de Compra</mat-label>
                <input matInput type="number" formControlName="precioCompra" placeholder="Precio de compra">
                <mat-error *ngIf="productoForm.get('precioCompra')?.hasError('required')">
                  El precio de compra es requerido
                </mat-error>
                <mat-error *ngIf="productoForm.get('precioCompra')?.hasError('min')">
                  El precio debe ser mayor a 0
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Precio de Venta</mat-label>
                <input matInput type="number" formControlName="precioVenta" placeholder="Precio de venta">
                <mat-error *ngIf="productoForm.get('precioVenta')?.hasError('required')">
                  El precio de venta es requerido
                </mat-error>
                <mat-error *ngIf="productoForm.get('precioVenta')?.hasError('min')">
                  El precio debe ser mayor a 0
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock" placeholder="Cantidad en stock">
                <mat-error *ngIf="productoForm.get('stock')?.hasError('required')">
                  El stock es requerido
                </mat-error>
                <mat-error *ngIf="productoForm.get('stock')?.hasError('min')">
                  El stock debe ser mayor o igual a 0
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Stock Mínimo</mat-label>
                <input matInput type="number" formControlName="stockMinimo" placeholder="Stock mínimo">
                <mat-error *ngIf="productoForm.get('stockMinimo')?.hasError('required')">
                  El stock mínimo es requerido
                </mat-error>
                <mat-error *ngIf="productoForm.get('stockMinimo')?.hasError('min')">
                  El stock mínimo debe ser mayor o igual a 0
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="checkbox-container">
              <mat-checkbox formControlName="activo" color="primary">
                Producto Activo
              </mat-checkbox>
            </div>
          </mat-dialog-content>
          
          <mat-dialog-actions align="end" class="dialog-actions">
            <button mat-button type="button" (click)="onCancel()" class="cancel-button">
              Cancelar
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!productoForm.valid" class="submit-button">
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </button>
          </mat-dialog-actions>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .close-button {
      color: #666;
      transition: color 0.2s ease;
    }

    .close-button:hover {
      color: #333;
    }

    .dialog-content {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    .checkbox-container {
      margin-top: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .dialog-actions {
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .cancel-button {
      margin-right: 12px;
      color: #666;
    }

    .submit-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .dialog-container {
        width: 95%;
        margin: 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .dialog-header {
        padding: 16px 16px 0 16px;
      }

      .dialog-content {
        padding: 16px;
      }

      .dialog-actions {
        padding: 12px 16px 16px 16px;
      }
    }

    /* Scrollbar styling */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class ProductoDialogComponent implements OnInit {
  productoForm!: FormGroup;
  isEditing = false;
  categorias = ['Aceites', 'Filtros', 'Frenos', 'Suspensión', 'Motor', 'Transmisión', 'Eléctrico', 'Carrocería', 'Otros'];

  constructor(
    private dialogRef: MatDialogRef<ProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { producto?: ProductoDTO },
    private fb: FormBuilder
  ) {
    this.isEditing = !!data.producto;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditing && this.data.producto) {
      this.productoForm.patchValue(this.data.producto);
    }
  }

  initForm(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      precioCompra: ['', [Validators.required, Validators.min(0)]],
      precioVenta: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      stockMinimo: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', [Validators.required]],
      marca: [''],
      activo: [true]
    });
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      const productoData: Producto = this.productoForm.value;
      this.dialogRef.close(productoData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 