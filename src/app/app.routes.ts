import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  // { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'clientes', 
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vehiculos', 
    loadComponent: () => import('./pages/vehiculos/vehiculos.component').then(m => m.VehiculosComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'mantenimientos', 
    loadComponent: () => import('./pages/mantenimientos/mantenimientos.component').then(m => m.MantenimientosComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'facturas', 
    loadComponent: () => import('./pages/facturas/facturas.component').then(m => m.FacturasComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'egresos', 
    loadComponent: () => import('./pages/egresos/egresos.component').then(m => m.EgresosComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'egresos-gestion', 
    loadComponent: () => import('./pages/egresos/egresos-gestion.component').then(m => m.EgresosGestionComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'ingresos', 
    loadComponent: () => import('./pages/ingresos/ingresos.component').then(m => m.IngresosComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'productos', 
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'servicios', 
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'perfil', 
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
