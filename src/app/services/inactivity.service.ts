import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth.service';
import { SessionWarningModalComponent } from '../components/session-warning-modal/session-warning-modal.component';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimer: any;
  private warningTimer: any;
  private warningDialog: any;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos
  private readonly WARNING_TIMEOUT = 29 * 60 * 1000; // 29 minutos (1 minuto antes)
  private isEnabled = true; // Para habilitar/deshabilitar el sistema

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.setupInactivityTimer();
  }

  private setupInactivityTimer(): void {
    // Eventos que resetean el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        // Solo resetear si el usuario está autenticado
        if (this.authService.isAuthenticated()) {
          this.resetTimer();
        }
      });
    });

    // Iniciar el timer
    this.resetTimer();
  }

  private resetTimer(): void {
    // Si el sistema está deshabilitado, no hacer nada
    if (!this.isEnabled) {
      console.log('Sistema de inactividad deshabilitado');
      return;
    }

    // Limpiar timers existentes
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    // Cerrar modal de advertencia si está abierto
    if (this.warningDialog) {
      this.warningDialog.close();
      this.warningDialog = null;
    }

    // Solo configurar los timers si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      console.log('Usuario autenticado, configurando timers de inactividad...');
      
      // Verificar token solo al configurar los timers, no constantemente
      if (this.authService.isTokenValid()) {
        console.log('Token válido, configurando timers...');
        
        // Timer de advertencia (1 minuto antes)
        this.warningTimer = setTimeout(() => {
          console.log('Mostrando advertencia de inactividad...');
          this.showWarningDialog();
        }, this.WARNING_TIMEOUT);

        // Timer de inactividad
        this.inactivityTimer = setTimeout(() => {
          console.log('Ejecutando timeout de inactividad...');
          this.handleInactivity();
        }, this.INACTIVITY_TIMEOUT);
      } else {
        // Si el token no es válido, cerrar sesión
        console.log('Token no válido, cerrando sesión...');
        this.handleInactivity();
      }
    } else {
      console.log('Usuario no autenticado, no configurando timers...');
    }
  }

  private showWarningDialog(): void {
    // Solo mostrar el modal si no está ya abierto
    if (!this.warningDialog) {
      this.warningDialog = this.dialog.open(SessionWarningModalComponent, {
        width: '400px',
        disableClose: true,
        panelClass: 'session-warning-dialog'
      });

      this.warningDialog.afterClosed().subscribe((result: string) => {
        this.warningDialog = null;
        if (result === 'extend') {
          this.extendSession();
        } else if (result === 'logout') {
          this.handleInactivity();
        }
      });
    }
  }

  private extendSession(): void {
    console.log('Extendiendo sesión...');
    // Intentar renovar el token en el backend
    this.authService.extendSession().subscribe({
      next: (success) => {
        if (success) {
          console.log('Sesión extendida exitosamente');
        } else {
          console.log('No se pudo extender la sesión');
        }
        // Resetear el timer para dar 15 minutos más
        this.resetTimer();
      },
      error: (error) => {
        console.error('Error extendiendo sesión:', error);
        // Resetear el timer de todas formas
        this.resetTimer();
      }
    });
  }

  private handleInactivity(): void {
    console.log('Usuario inactivo por 30 minutos. Cerrando sesión...');
    this.clearTimer();
    this.authService.logout();
  }

  // Método público para resetear el timer manualmente
  public resetInactivityTimer(): void {
    this.resetTimer();
  }

  // Método para limpiar el timer cuando el usuario hace logout
  public clearTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.warningDialog) {
      this.warningDialog.close();
      this.warningDialog = null;
    }
  }

  // Método para habilitar/deshabilitar el sistema de inactividad
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      console.log('Sistema de inactividad habilitado');
      this.resetTimer();
    } else {
      console.log('Sistema de inactividad deshabilitado');
      this.clearTimer();
    }
  }

  // Método para verificar si el sistema está habilitado
  public getEnabled(): boolean {
    return this.isEnabled;
  }
}
