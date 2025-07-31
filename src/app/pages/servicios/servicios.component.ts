import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatTableModule,
    MatToolbarModule,
    MatChipsModule
  ],
  template: `
    <div class="servicios-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>miscellaneous_services</mat-icon>
            Catálogo de Servicios
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="module-info">
            <div class="info-card">
              <mat-icon class="info-icon">settings</mat-icon>
              <div class="info-text">
                <h3>Servicios Automotrices Profesionales</h3>
                <p>Gestiona tu catálogo de servicios, precios, duración estimada y categorías para ofrecer la mejor atención a tus clientes.</p>
              </div>
            </div>
            
            <div class="features-grid">
              <div class="feature-item">
                <mat-icon>add_business</mat-icon>
                <span>Agregar Servicio</span>
              </div>
              <div class="feature-item">
                <mat-icon>category</mat-icon>
                <span>Categorías</span>
              </div>
              <div class="feature-item">
                <mat-icon>attach_money</mat-icon>
                <span>Precios</span>
              </div>
              <div class="feature-item">
                <mat-icon>schedule</mat-icon>
                <span>Duración</span>
              </div>
              <div class="feature-item">
                <mat-icon>star</mat-icon>
                <span>Populares</span>
              </div>
              <div class="feature-item">
                <mat-icon>description</mat-icon>
                <span>Descripciones</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .servicios-container {
      padding: 20px;
    }
    
    .module-info {
      padding: 20px 0;
    }
    
    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .info-icon {
      font-size: 2rem;
      color: #9c27b0;
      margin-top: 5px;
    }
    
    .info-text h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.3rem;
    }
    
    .info-text p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .feature-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border-color: #9c27b0;
    }
    
    .feature-item mat-icon {
      color: #9c27b0;
      font-size: 1.5rem;
    }
    
    .feature-item span {
      font-weight: 500;
      color: #333;
    }
    
    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .info-card {
        flex-direction: column;
        text-align: center;
      }
    }
    
    @media (max-width: 480px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ServiciosComponent {} 