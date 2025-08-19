import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationModalComponent, ConfirmationModalData } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {

  constructor(private dialog: MatDialog) { }

  confirm(data: ConfirmationModalData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmationModalComponent> = this.dialog.open(ConfirmationModalComponent, {
      width: '500px',
      disableClose: true,
      data: data
    });

    return new Observable<boolean>(observer => {
      dialogRef.componentInstance.confirmed.subscribe(() => {
        dialogRef.close();
        observer.next(true);
        observer.complete();
      });

      dialogRef.componentInstance.cancelled.subscribe(() => {
        dialogRef.close();
        observer.next(false);
        observer.complete();
      });

      dialogRef.afterClosed().subscribe(() => {
        observer.next(false);
        observer.complete();
      });
    });
  }

  confirmDelete(itemName: string, itemType: string = 'elemento'): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar ${itemType} "${itemName}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'warning'
    });
  }

  confirmDeleteWithDependencies(
    itemName: string, 
    itemType: string, 
    dependenciesCount: number, 
    dependenciesType: string = 'elementos asociados'
  ): Observable<boolean> {
    return this.confirm({
      title: 'Confirmar eliminación con dependencias',
      message: `¿Está seguro de que desea eliminar ${itemType} "${itemName}"?`,
      confirmText: 'Eliminar todo',
      cancelText: 'Cancelar',
      type: 'danger',
      showDetails: true,
      details: `Esta acción eliminará también ${dependenciesCount} ${dependenciesType} asociados. Esta operación no se puede deshacer.`
    });
  }

  confirmDeleteWithFacturas(
    mantenimientoName: string, 
    facturas: any[]
  ): Observable<boolean> {
    const facturasInfo = facturas.length > 0 ? 
      `\n\nFacturas asociadas:\n${facturas.map(f => `- ${f.numeroFactura} (${f.estado}) - $${f.total}`).join('\n')}` : '';
    
    return this.confirm({
      title: 'Confirmar eliminación de mantenimiento',
      message: `¿Está seguro de que desea eliminar el mantenimiento "${mantenimientoName}"?`,
      confirmText: 'Eliminar mantenimiento y facturas',
      cancelText: 'Cancelar',
      type: 'danger',
      showDetails: true,
      details: `Esta acción eliminará permanentemente el mantenimiento y todas sus ${facturas.length} factura(s) asociada(s).${facturasInfo}\n\nEsta operación no se puede deshacer.`
    });
  }
}
