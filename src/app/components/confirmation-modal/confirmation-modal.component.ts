import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  showDetails?: boolean;
  details?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="confirmation-modal">
      <div class="modal-header">
        <div class="icon-container" [ngClass]="getIconClass()">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
        
        <div *ngIf="data.showDetails && data.details" class="details-section">
          <mat-divider></mat-divider>
          <div class="details-content">
            <h4>Detalles:</h4>
            <p>{{ data.details }}</p>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()"
          (click)="onConfirm()"
          cdkFocusInitial>
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-modal {
      min-width: 400px;
      max-width: 600px;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .icon-container.warning {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .icon-container.danger {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .icon-container.info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    .icon-container mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    h2 {
      margin: 0;
      color: #333;
    }
    
    .message {
      font-size: 16px;
      line-height: 1.5;
      color: #666;
      margin-bottom: 16px;
    }
    
    .details-section {
      margin-top: 16px;
    }
    
    .details-content h4 {
      margin: 16px 0 8px 0;
      color: #333;
      font-weight: 500;
    }
    
    .details-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
    }
    
    mat-dialog-actions button {
      margin-left: 8px;
    }
  `]
})
export class ConfirmationModalComponent {
  data: ConfirmationModalData;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmationModalData
  ) {
    this.data = dialogData;
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  }

  getIconClass(): string {
    return this.data.type || 'info';
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
