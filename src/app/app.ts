import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { InactivityService } from './services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'OvyCar';

  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private inactivityService: InactivityService
  ) {
    // Verificar autenticación al inicializar
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    // Si no está autenticado y no está en login, redirigir
    if (!this.authService.isAuthenticated() && this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
    
    // Verificar autenticación cada 30 segundos si está autenticado
    if (this.authService.isAuthenticated()) {
      setInterval(() => {
        if (!this.authService.isTokenValid()) {
          console.log('Token expirado, cerrando sesión...');
          this.authService.logout();
        }
      }, 30000); // 30 segundos
    }
  }

  get isHandset$() {
    return this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  logout(): void {
    this.inactivityService.clearTimer();
    this.authService.logout();
    this.snackBar.open('Sesión cerrada exitosamente', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/login']);
  }
}
