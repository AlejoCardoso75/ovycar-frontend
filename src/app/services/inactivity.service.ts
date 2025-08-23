import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.setupInactivityTimer();
  }

  private setupInactivityTimer(): void {
    // Eventos que resetean el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.resetTimer();
      });
    });

    // Iniciar el timer
    this.resetTimer();
  }

  private resetTimer(): void {
    // Limpiar timer existente
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Solo configurar el timer si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      this.inactivityTimer = setTimeout(() => {
        this.handleInactivity();
      }, this.INACTIVITY_TIMEOUT);
    }
  }

  private handleInactivity(): void {
    console.log('Usuario inactivo por 5 minutos. Cerrando sesión...');
    this.authService.logout();
    this.router.navigate(['/login']);
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
  }
}
