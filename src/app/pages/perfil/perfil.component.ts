import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { UserSession } from '../../models/auth.model';

interface UserData {
  nombre: string;
  apellido: string;
  username: string;
  rol: string;
  fechaRegistro?: Date;
  ultimoAcceso?: Date;
}

interface UserStats {
  totalSesiones: number;
  diasActivo: number;
  tiempoPromedio: string;
  accionesRealizadas: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  userData: UserData = {
    nombre: '',
    apellido: '',
    username: '',
    rol: '',
    fechaRegistro: undefined,
    ultimoAcceso: undefined
  };

  userStats: UserStats = {
    totalSesiones: 0,
    diasActivo: 0,
    tiempoPromedio: '0h 0m',
    accionesRealizadas: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
    
    // Suscribirse a cambios del usuario
    this.authService.currentUser$.subscribe(user => {
      console.log('User changed:', user);
      if (user) {
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from AuthService:', currentUser);
    
    if (currentUser) {
      this.userData = {
        nombre: currentUser.nombre,
        apellido: currentUser.apellido,
        username: currentUser.username,
        rol: currentUser.rol,
        fechaRegistro: new Date(), // Por ahora usamos la fecha actual
        ultimoAcceso: new Date() // Por ahora usamos la fecha actual
      };
      console.log('User data loaded:', this.userData);
    } else {
      console.log('No current user found');
    }
  }

  logout(): void {
    // Implementar lógica de logout
    console.log('Logout clicked');
  }

  // Método para formatear fechas en formato dd/mm/aaaa
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const fecha = typeof date === 'string' ? new Date(date) : date;
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
} 