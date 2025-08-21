import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface UserData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  rol: string;
  fechaRegistro: Date;
  ultimoAcceso: Date;
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
    nombre: 'Juan Carlos',
    apellido: 'Pérez',
    email: 'juan.perez@ovycar.com',
    telefono: '+57 300 123 4567',
    cargo: 'Administrador del Sistema',
    departamento: 'Tecnología',
    rol: 'Administrador',
    fechaRegistro: new Date('2024-01-15'),
    ultimoAcceso: new Date()
  };

  userStats: UserStats = {
    totalSesiones: 156,
    diasActivo: 45,
    tiempoPromedio: '2h 30m',
    accionesRealizadas: 1247
  };

  constructor() {}

  ngOnInit(): void {
    // Los datos ya están cargados en las propiedades
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