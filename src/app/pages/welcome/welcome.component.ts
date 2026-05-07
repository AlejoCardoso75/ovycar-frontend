import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  readonly telefonoTaller = '316 307 0025';
  readonly whatsappLink = 'https://wa.me/573163070025';

  /** Marcas habituales (logos SVG locales, basados en Simple Icons — MIT). */
  readonly marcasAtendidas = [
    { id: 'chevrolet', name: 'Chevrolet', logo: 'assets/images/marcas/chevrolet.svg' },
    { id: 'ford', name: 'Ford', logo: 'assets/images/marcas/ford.svg' },
    { id: 'hyundai', name: 'Hyundai', logo: 'assets/images/marcas/hyundai.svg' },
    { id: 'kia', name: 'Kia', logo: 'assets/images/marcas/kia.svg' },
    { id: 'mazda', name: 'Mazda', logo: 'assets/images/marcas/mazda.svg' },
    { id: 'mitsubishi', name: 'Mitsubishi', logo: 'assets/images/marcas/mitsubishi.svg' },
    { id: 'nissan', name: 'Nissan', logo: 'assets/images/marcas/nissan.svg' },
    { id: 'renault', name: 'Renault', logo: 'assets/images/marcas/renault.svg' },
    { id: 'toyota', name: 'Toyota', logo: 'assets/images/marcas/toyota.svg' }
  ];

  readonly serviciosRapidos = [
    { icon: 'construction', label: 'Mantenimiento preventivo y correctivo' },
    { icon: 'settings', label: 'Reparación de motores' },
    { icon: 'car_repair', label: 'Frenos' },
    { icon: 'precision_manufacturing', label: 'Rodamientos' },
    { icon: 'build', label: 'Embragues' },
    { icon: 'tune', label: 'Sincronización' },
    { icon: 'settings_input_component', label: 'Servicio de escáner' },
    { icon: 'opacity', label: 'Lavado de inyectores' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated() && this.authService.isTokenValid()) {
      this.router.navigate(['/dashboard']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
