import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Verificar si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      // Verificar si el token es válido localmente primero
      if (!this.authService.isTokenValid()) {
        this.authService.logout();
        this.router.navigate(['/login']);
        return of(false);
      }
      
      // Validar el token con el backend
      return this.authService.validateToken().pipe(
        map(isValid => {
          if (isValid) {
            return true;
          } else {
            this.authService.logout();
            this.router.navigate(['/login']);
            return false;
          }
        }),
        catchError(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    } else {
      this.router.navigate(['/login']);
      return of(false);
    }
  }
}
