import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './session-warning-modal.component.html',
  styleUrls: ['./session-warning-modal.component.scss']
})
export class SessionWarningModalComponent {
  @Output() extendSession = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  countdown = 60; // 60 segundos
  private countdownInterval: any;

  constructor(public dialogRef: MatDialogRef<SessionWarningModalComponent>) {
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.onLogout();
      }
    }, 1000);
  }

  onExtendSession(): void {
    clearInterval(this.countdownInterval);
    this.extendSession.emit();
    this.dialogRef.close('extend');
  }

  onLogout(): void {
    clearInterval(this.countdownInterval);
    this.logout.emit();
    this.dialogRef.close('logout');
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
