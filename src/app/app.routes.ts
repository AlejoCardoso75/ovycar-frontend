import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'clientes',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent)
  },
  {
    path: 'vehiculos',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/vehiculos/vehiculos.component').then(m => m.VehiculosComponent)
  },
  {
    path: 'mantenimientos',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/mantenimientos/mantenimientos.component').then(m => m.MantenimientosComponent)
  },
  {
    path: 'productos',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent)
  },
  {
    path: 'ingresos',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/ingresos/ingresos.component').then(m => m.IngresosComponent)
  },
  {
    path: 'egresos',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/egresos/egresos.component').then(m => m.EgresosComponent)
  },
  {
    path: 'egresos-gestion',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/egresos/egresos-gestion.component').then(m => m.EgresosGestionComponent)
  },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
