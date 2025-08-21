import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent)
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./pages/vehiculos/vehiculos.component').then(m => m.VehiculosComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent)
  },
  {
    path: 'mantenimientos',
    loadComponent: () => import('./pages/mantenimientos/mantenimientos.component').then(m => m.MantenimientosComponent)
  },
  // {
  //   path: 'facturas',
  //   loadComponent: () => import('./pages/facturas/facturas.component').then(m => m.FacturasComponent)
  // },
  {
    path: 'servicios',
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent)
  },
  {
    path: 'ingresos',
    loadComponent: () => import('./pages/ingresos/ingresos.component').then(m => m.IngresosComponent)
  },
  {
    path: 'egresos',
    loadComponent: () => import('./pages/egresos/egresos.component').then(m => m.EgresosComponent)
  },
  {
    path: 'egresos-gestion',
    loadComponent: () => import('./pages/egresos/egresos-gestion.component').then(m => m.EgresosGestionComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
