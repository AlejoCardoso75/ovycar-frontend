import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Login - Standalone Component
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  
  // Dashboard - Standalone Component
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  
  // Clientes - Standalone Component
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent),
    canActivate: [AuthGuard]
  },
  
  // Vehículos - Standalone Component
  {
    path: 'vehiculos',
    loadComponent: () => import('./pages/vehiculos/vehiculos.component').then(m => m.VehiculosComponent),
    canActivate: [AuthGuard]
  },
  
  // Mantenimientos - Standalone Component
  {
    path: 'mantenimientos',
    loadComponent: () => import('./pages/mantenimientos/mantenimientos.component').then(m => m.MantenimientosComponent),
    canActivate: [AuthGuard]
  },
  
  // Productos - Standalone Component
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent),
    canActivate: [AuthGuard]
  },
  
  // Servicios - Standalone Component
  {
    path: 'servicios',
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent),
    canActivate: [AuthGuard]
  },
  
  // Ingresos - Standalone Component
  {
    path: 'ingresos',
    loadComponent: () => import('./pages/ingresos/ingresos.component').then(m => m.IngresosComponent),
    canActivate: [AuthGuard]
  },
  
  // Egresos - Standalone Component
  {
    path: 'egresos',
    loadComponent: () => import('./pages/egresos/egresos.component').then(m => m.EgresosComponent),
    canActivate: [AuthGuard]
  },
  
  // Gestión de Egresos - Standalone Component
  {
    path: 'egresos-gestion',
    loadComponent: () => import('./pages/egresos/egresos-gestion.component').then(m => m.EgresosGestionComponent),
    canActivate: [AuthGuard]
  },
  
  // Facturas - Standalone Component
  {
    path: 'facturas',
    loadComponent: () => import('./pages/facturas/facturas.component').then(m => m.FacturasComponent),
    canActivate: [AuthGuard]
  },
  
  // Ganancia por Socio - Standalone Component
  {
    path: 'ganancia-socio',
    loadComponent: () => import('./pages/ganancia-socio/ganancia-socio.component').then(m => m.GananciaSocioComponent),
    canActivate: [AuthGuard]
  },
  
  // Perfil - Standalone Component
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [AuthGuard]
  },
  
  // Ruta de fallback
  { path: '**', redirectTo: '/dashboard' }
];
