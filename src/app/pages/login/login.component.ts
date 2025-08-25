import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { InactivityService } from '../../services/inactivity.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private inactivityService: InactivityService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const loginRequest: LoginRequest = this.loginForm.value;

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.inactivityService.resetInactivityTimer();
            this.snackBar.open('¡Bienvenido!', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(response.message || 'Error en el login', 'Cerrar', { duration: 3000 });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error en login:', error);
          let errorMessage = 'Error en el login';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 0) {
            errorMessage = 'Error de conexión con el servidor';
          } else if (error.status === 403) {
            errorMessage = 'Acceso denegado';
          } else if (error.status >= 500) {
            errorMessage = 'Error del servidor. Por favor, inténtelo más tarde';
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Por favor, complete todos los campos', 'Cerrar', { duration: 3000 });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
