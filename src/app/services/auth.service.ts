import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, UserSession } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setUserSession(response);
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return of({
            token: '',
            username: '',
            nombre: '',
            apellido: '',
            rol: '',
            message: 'Error de conexión',
            success: false
          });
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, registerRequest)
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.token) {
            this.setUserSession(response);
          }
        }),
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('Ejecutando logout...');
    this.clearUserSession();
    // Forzar recarga de la página para limpiar completamente el estado
    window.location.href = '/login';
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/validate`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(response => response.success),
      catchError(() => {
        this.clearUserSession();
        return of(false);
      })
    );
  }

  isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.isAuthenticated;
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.token : null;
  }

  getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      // Decodificar el token JWT (solo la parte del payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  isTokenInactive(): boolean {
    // La inactividad se maneja en el InactivityService, no aquí
    // Este método siempre retorna false para que no interfiera con la validación del token
    return false;
  }

  isTokenValid(): boolean {
    // Solo verificar que no haya expirado
    return !this.isTokenExpired();
  }

  // Método para extender la sesión (renovar el token)
  extendSession(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/extend`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(response => {
        if (response.success && response.token) {
          this.setUserSession(response);
          return true;
        }
        return false;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  private setUserSession(authResponse: AuthResponse): void {
    if (authResponse.token && authResponse.username && authResponse.nombre && authResponse.apellido && authResponse.rol) {
      const userSession: UserSession = {
        token: authResponse.token,
        username: authResponse.username,
        nombre: authResponse.nombre,
        apellido: authResponse.apellido,
        rol: authResponse.rol,
        isAuthenticated: true
      };

      this.currentUserSubject.next(userSession);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
    }
  }

  private clearUserSession(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userSession: UserSession = JSON.parse(storedUser);
        this.currentUserSubject.next(userSession);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
}
