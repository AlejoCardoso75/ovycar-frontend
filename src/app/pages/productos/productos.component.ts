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
import { ProductoService } from '../../services/producto.service';
import { Producto, ProductoDTO } from '../../models/producto.model';
import { ReportesService } from '../../services/reportes.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ProductoDialogComponent } from './producto-dialog.component';
import { catchError, of } from 'rxjs';

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
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['codigo', 'nombre', 'marca', 'stock', 'precioVenta', 'categoria', 'acciones'];
  dataSource = new MatTableDataSource<ProductoDTO>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ProductoDTO>;

  // Propiedades para el template
  viewMode: 'table' | 'cards' = 'table';
  productos: ProductoDTO[] = [];
  loading = false;

  // Estadísticas
  totalProductos = 0;
  totalStock = 0;
  valorTotalInventario = 0;
  productosBajoStock = 0;

  constructor(
    private productoService: ProductoService,
    private reportesService: ReportesService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    console.log('ProductosComponent constructor llamado');
  }

  ngOnInit(): void {
    console.log('ProductosComponent ngOnInit llamado');
    this.loadProductos();
  }

  setupTable(): void {
    // Configurar el paginador
    this.dataSource.paginator = this.paginator;
    
    // Configurar el ordenamiento
    this.dataSource.sort = this.sort;
    
    // Configurar el filtro personalizado
    this.dataSource.filterPredicate = (data: ProductoDTO, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return data.nombre.toLowerCase().includes(searchTerm) ||
             data.codigo.toLowerCase().includes(searchTerm) ||
             (data.categoria ? data.categoria.toLowerCase().includes(searchTerm) : false) ||
             (data.marca ? data.marca.toLowerCase().includes(searchTerm) : false);
    };

    // Suscribirse a cambios en la paginación
    if (this.paginator) {
      this.paginator.page.subscribe((event) => {
        console.log('Evento de paginación:', event);
        console.log('Página actual:', event.pageIndex);
        console.log('Elementos por página:', event.pageSize);
        console.log('Longitud total:', event.length);
        
        // Forzar la actualización de la tabla
        this.dataSource._updateChangeSubscription();
      });
    }
  }

  // Método para verificar el estado de la paginación
  checkPaginationStatus(): void {
    if (this.paginator) {
      console.log('=== Estado de Paginación ===');
      console.log('Tamaño de página:', this.paginator.pageSize);
      console.log('Página actual:', this.paginator.pageIndex);
      console.log('Total de elementos:', this.paginator.length);
      console.log('Elementos en dataSource:', this.dataSource.data.length);
      console.log('Elementos mostrados:', this.dataSource.data.slice(
        this.paginator.pageIndex * this.paginator.pageSize,
        (this.paginator.pageIndex + 1) * this.paginator.pageSize
      ).length);
      console.log('==========================');
    }
  }

  // Método para manejar cambios en la paginación
  onPageChange(event: any): void {
    console.log('Cambio en paginación:', event);
    console.log('Nueva página:', event.pageIndex);
    console.log('Nuevo tamaño de página:', event.pageSize);
    
    // Actualizar la tabla
    this.dataSource._updateChangeSubscription();
    
    // Verificar el estado después del cambio
    setTimeout(() => {
      this.checkPaginationStatus();
    }, 0);
  }

  // Método para manejar cambios en el tamaño de página
  onPageSizeChange(event: any): void {
    console.log('Cambio en tamaño de página:', event);
    if (this.paginator) {
      this.paginator.pageSize = event.value;
      this.paginator.firstPage();
      this.dataSource._updateChangeSubscription();
    }
  }

  ngAfterViewInit(): void {
    console.log('ProductosComponent ngAfterViewInit llamado');
    // Usar setTimeout para asegurar que los ViewChild estén disponibles
    setTimeout(() => {
      this.setupTable();
      // Asegurar que el paginador esté configurado correctamente
      if (this.paginator) {
        this.paginator.pageSize = 5; // Establecer 5 elementos por página por defecto
        this.paginator.pageIndex = 0; // Ir a la primera página
        this.dataSource._updateChangeSubscription();
      }
    }, 100); // Aumentar el timeout para asegurar que todo esté listo
  }

  loadProductos(): void {
    console.log('Iniciando carga de productos...');
    this.loading = true;
    
    this.productoService.getAllProductos().pipe(
      catchError(error => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar los productos. Verifica que el backend esté ejecutándose.', 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return of([]);
      })
    ).subscribe({
      next: (productos) => {
        console.log('Productos recibidos en componente:', productos);
        this.dataSource.data = productos;
        this.productos = productos;
        this.calcularEstadisticas();
        this.loading = false;
        
        // Asegurar que el paginador se actualice y aplique la paginación
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.pageSize = 5;
            this.paginator.firstPage();
            this.dataSource._updateChangeSubscription();
            console.log('Paginador configurado - Tamaño de página:', this.paginator.pageSize);
            console.log('Total de elementos:', this.dataSource.data.length);
            
            // Verificar el estado de la paginación
            this.checkPaginationStatus();
          }
        }, 0);
        
        if (productos.length === 0) {
          this.snackBar.open('No se encontraron productos. Puedes agregar nuevos productos usando el botón "Nuevo Producto".', 'Cerrar', { 
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

  calcularEstadisticas(): void {
    this.totalProductos = this.dataSource.data.length;
    this.totalStock = this.dataSource.data.reduce((sum, p) => sum + p.stock, 0);
    this.valorTotalInventario = this.dataSource.data.reduce((sum, p) => sum + (p.precioVenta * p.stock), 0);
    this.productosBajoStock = this.dataSource.data.filter(p => p.stock < p.stockMinimo).length;
  }

  applyFilter(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim();
    
    // Volver a la primera página cuando se filtra
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  editProducto(producto: ProductoDTO): void {
    this.openDialog(producto);
  }

  openDialog(producto?: ProductoDTO): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      data: { producto: producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (producto) {
          this.updateProducto(producto.id, result);
        } else {
          this.createProducto(result);
        }
      }
    });
  }

  createProducto(productoData: Producto): void {
    this.productoService.createProducto(productoData).subscribe({
      next: (newProducto) => {
        this.dataSource.data.push(newProducto);
        this.dataSource._updateChangeSubscription();
        this.productos = [...this.dataSource.data];
        this.snackBar.open('Producto creado exitosamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.calcularEstadisticas();
        
        // Volver a la primera página después de agregar
        if (this.paginator) {
          this.paginator.firstPage();
        }
      },
      error: (error) => {
        console.error('Error creando producto:', error);
        this.snackBar.open('Error al crear el producto. Verifica los datos e intenta nuevamente.', 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updateProducto(id: number, productoData: Producto): void {
    this.productoService.updateProducto(id, productoData).subscribe({
      next: (updatedProducto) => {
        const index = this.dataSource.data.findIndex(p => p.id === updatedProducto.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedProducto;
          this.dataSource._updateChangeSubscription();
          this.productos = [...this.dataSource.data];
        }
        this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error actualizando producto:', error);
        this.snackBar.open('Error al actualizar el producto. Verifica los datos e intenta nuevamente.', 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteProducto(producto: ProductoDTO): void {
    if (confirm(`¿Está seguro de eliminar el producto ${producto.nombre}?`)) {
      this.productoService.deleteProducto(producto.id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(p => p.id !== producto.id);
          this.dataSource._updateChangeSubscription();
          this.productos = [...this.dataSource.data];
          this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.calcularEstadisticas();
          
          // Volver a la primera página después de eliminar
          if (this.paginator) {
            this.paginator.firstPage();
          }
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          this.snackBar.open('Error al eliminar el producto', 'Cerrar', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStockStatus(stock: number, stockMinimo?: number): string {
    if (stock === 0) return 'sin-stock';
    if (stockMinimo && stock <= stockMinimo) return 'stock-bajo';
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