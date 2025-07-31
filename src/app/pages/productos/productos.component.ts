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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto, ProductoDTO } from '../../models/producto.model';
import { ReportesService } from '../../services/reportes.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-productos',
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
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nombre', 'codigo', 'precioVenta', 'stock', 'stockMinimo', 'categoria', 'marca', 'acciones'];
  dataSource = new MatTableDataSource<ProductoDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ProductoDTO>;

  productoForm!: FormGroup;
  isEditing = false;
  selectedProducto: ProductoDTO | null = null;
  searchTerm = '';
  showDialog = false;
  categorias = ['Aceites', 'Filtros', 'Frenos', 'Suspensión', 'Motor', 'Transmisión', 'Eléctrico', 'Carrocería', 'Otros'];

  // Estadísticas
  totalProductos = 0;
  totalStock = 0;
  valorTotalInventario = 0;
  productosBajoStock = 0;

  constructor(
    private productoService: ProductoService,
    private reportesService: ReportesService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadProductos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  loadProductos(): void {
    this.productoService.getAllProductos().subscribe({
      next: (productos) => {
        this.dataSource.data = productos;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalProductos = this.dataSource.data.length;
    this.totalStock = this.dataSource.data.reduce((sum, p) => sum + p.stock, 0);
    this.valorTotalInventario = this.dataSource.data.reduce((sum, p) => sum + (p.precioVenta * p.stock), 0);
    this.productosBajoStock = this.dataSource.data.filter(p => p.stock < p.stockMinimo).length;
  }

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: ProductoDTO, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.nombre.toLowerCase().includes(searchTerm) ||
             data.codigo.toLowerCase().includes(searchTerm) ||
             (data.categoria ? data.categoria.toLowerCase().includes(searchTerm) : false) ||
             (data.marca ? data.marca.toLowerCase().includes(searchTerm) : false);
    };
    
    this.dataSource.filter = this.searchTerm.trim();
  }

  openDialog(producto?: ProductoDTO): void {
    this.isEditing = !!producto;
    this.selectedProducto = producto || null;
    this.showDialog = true;
    
    if (producto) {
      this.productoForm.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        codigo: producto.codigo,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
        categoria: producto.categoria,
        marca: producto.marca || '',
        activo: producto.activo
      });
    } else {
      this.productoForm.reset({ activo: true });
    }
  }

  saveProducto(): void {
    if (this.productoForm.valid) {
      const productoData: Producto = this.productoForm.value;
      
      if (this.isEditing && this.selectedProducto) {
        this.productoService.updateProducto(this.selectedProducto.id, productoData).subscribe({
          next: (updatedProducto) => {
            const index = this.dataSource.data.findIndex(p => p.id === updatedProducto.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedProducto;
              this.dataSource._updateChangeSubscription();
            }
            this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.calcularEstadisticas(); // Recalculate stats after update
          },
          error: (error) => {
            console.error('Error actualizando producto:', error);
            this.snackBar.open('Error al actualizar el producto', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.productoService.createProducto(productoData).subscribe({
          next: (newProducto) => {
            this.dataSource.data.push(newProducto);
            this.dataSource._updateChangeSubscription();
            this.snackBar.open('Producto creado exitosamente', 'Cerrar', { duration: 3000 });
            this.closeDialog();
            this.calcularEstadisticas(); // Recalculate stats after create
          },
          error: (error) => {
            console.error('Error creando producto:', error);
            this.snackBar.open('Error al crear el producto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteProducto(producto: ProductoDTO): void {
    if (confirm(`¿Está seguro de eliminar el producto ${producto.nombre}?`)) {
      this.productoService.deleteProducto(producto.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(p => p.id !== producto.id);
          this.dataSource._updateChangeSubscription();
          this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.calcularEstadisticas(); // Recalculate stats after delete
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  closeDialog(): void {
    this.isEditing = false;
    this.selectedProducto = null;
    this.showDialog = false;
    this.productoForm.reset({ activo: true });
  }

  getErrorMessage(field: string): string {
    const control = this.productoForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }

  getStockStatus(stock: number, stockMinimo: number): string {
    if (stock === 0) return 'sin-stock';
    if (stock <= stockMinimo) return 'stock-bajo';
    return 'stock-ok';
  }

  descargarInventarioPdf(): void {
    this.reportesService.descargarInventarioPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inventario_ovycar.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Reporte PDF descargado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error descargando PDF:', error);
        this.snackBar.open('Error al descargar el reporte PDF', 'Cerrar', { duration: 3000 });
      }
    });
  }

  descargarInventarioExcel(): void {
    this.reportesService.descargarInventarioExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inventario_ovycar.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Reporte Excel descargado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error descargando Excel:', error);
        this.snackBar.open('Error al descargar el reporte Excel', 'Cerrar', { duration: 3000 });
      }
    });
  }
} 