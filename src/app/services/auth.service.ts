import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, AuthResponse, UserSession } from '../models/auth.model';

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

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearUserSession();
        }),
        catchError(error => {
          console.error('Error en logout:', error);
          this.clearUserSession();
          return of({});
        })
      );
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

  private setUserSession(authResponse: AuthResponse): void {
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
