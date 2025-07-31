# OvyCar Frontend - Angular

Frontend de la aplicación OvyCar desarrollado en Angular 17 con Angular Material.

## Características

- **Dashboard interactivo** con estadísticas y alertas en tiempo real
- **Gestión completa de clientes** (CRUD)
- **Gestión de vehículos** asociados a clientes
- **Control de inventario** de productos
- **Seguimiento de mantenimientos** programados y en proceso
- **Sistema de facturación** con estados de pago
- **Gestión de servicios** ofrecidos
- **Interfaz responsive** para dispositivos móviles y desktop
- **Tema Material Design** moderno y profesional

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Angular CLI (`npm install -g @angular/cli`)

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd ovycar-front/ovycar-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el backend:**
   Asegúrate de que el backend de OvyCar esté ejecutándose en `http://localhost:8080`

## Ejecución

### Desarrollo
```bash
ng serve
```
La aplicación estará disponible en `http://localhost:4200`

### Producción
```bash
ng build --configuration production
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── models/           # Interfaces y tipos TypeScript
│   ├── pages/           # Componentes de páginas
│   │   ├── dashboard/   # Dashboard principal
│   │   ├── clientes/    # Gestión de clientes
│   │   ├── vehiculos/   # Gestión de vehículos
│   │   ├── productos/   # Control de inventario
│   │   ├── mantenimientos/ # Seguimiento de mantenimientos
│   │   ├── facturas/    # Sistema de facturación
│   │   └── servicios/   # Gestión de servicios
│   ├── services/        # Servicios para comunicación con API
│   └── app.component.*  # Componente principal
├── environments/        # Configuraciones de entorno
└── styles.scss         # Estilos globales y tema Material
```

## Tecnologías Utilizadas

- **Angular 17** - Framework principal
- **Angular Material** - Componentes UI
- **TypeScript** - Lenguaje de programación
- **SCSS** - Preprocesador de CSS
- **RxJS** - Programación reactiva
- **Angular Forms** - Manejo de formularios

## Funcionalidades Principales

### Dashboard
- Resumen de estadísticas del negocio
- Alertas de stock bajo y facturas vencidas
- Mantenimientos programados
- Navegación rápida a módulos

### Gestión de Clientes
- Listado con búsqueda y filtros
- Crear, editar y eliminar clientes
- Validación de formularios
- Estados activo/inactivo

### Control de Inventario
- Gestión de productos
- Alertas de stock bajo
- Categorización de productos
- Precios y costos

### Mantenimientos
- Programación de servicios
- Estados de mantenimiento
- Asociación con vehículos
- Costos estimados vs reales

### Facturación
- Generación de facturas
- Estados de pago
- Detalles de productos y servicios
- Historial de transacciones

## Configuración del Backend

El frontend está configurado para comunicarse con el backend en:
- **Desarrollo:** `http://localhost:8080/api`
- **Producción:** `/api` (relativo al dominio)

## Scripts Disponibles

- `ng serve` - Servidor de desarrollo
- `ng build` - Compilar para producción
- `ng test` - Ejecutar pruebas unitarias
- `ng lint` - Verificar código con ESLint

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para soporte técnico, contacta al equipo de desarrollo o crea un issue en el repositorio.
